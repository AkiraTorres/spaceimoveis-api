import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { v4 as uuid } from 'uuid';

import Message from "../db/models/Message.js";
import MessageFile from "../db/models/MessageFile.js";

import {findChatByChatId, findUserChats} from "./chatService.js";
import {validateEmail, validateString} from "../validators/inputValidators.js";
import {find} from "./globalService.js";
import firebaseConfig from '../config/firebase.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// TODO: precisa salvar as mensagens criptografadas no db
export async function createMessage({ chatId, sender, text }) {
  const validatedEmail = validateEmail(sender);
  const validatedChatId = validateString(chatId);
  const validatedText = validateString(text);

  const user = await find(validatedEmail, false, false, true);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  if (!text || text === '') {
    const error = new Error('Não se pode enviar uma mensagem vazia');
    error.status = 400;
    throw error;
  }

  const data = {
    chatId: validatedChatId,
    sender: validatedEmail,
    text: validatedText,
  }

  const m = await Message.create(data);
  const msg = m.get({ plain: true });

  let chat;
  try {
    chat = await findChatByChatId(validatedChatId, validatedEmail);
  } catch (error) {
    const e = new Error('Chat não encontrado');
    e.status = 404;
    throw e;
  }

  const receiver = chat.user1.email === user.email ? chat.user2 : chat.user1;

  msg.senderName = user.name;
  msg.senderEmail = user.email;
  msg.senderProfile = user.profile;
  msg.receiverName = receiver.name;
  msg.receiverEmail = receiver.email;
  msg.receiverProfile = receiver.profile;

  return msg;
}

export async function findMessages(chatId, email) {
  const validatedEmail = validateEmail(email);

  const user = await find(validatedEmail, false, false, true);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  const chats = await findUserChats(validatedEmail, false, false, true);

  if (!chats || !chats.find(chat => chat.id === chatId)) {
    const error =  Error('Chat não encontrado');
    error.status = 404;
    throw error;
  }

  let chat;
  try {
    chat = await findChatByChatId(chatId, validateEmail);
  } catch (error) {
    const e = new Error('Chat não encontrado');
    e.status = 404;
    throw e;
  }

  const [m, mf] = await Promise.all([
    Message.findAll({ where: { chatId }, raw: true }),
    MessageFile.findAll({ where: { chatId }, raw: true }),
  ]);

  const messages = [...m, ...mf];

  messages.sort((a, b) => a.createdAt - b.createdAt);

  return Promise.all(messages.map(async msg => {
    const editedMsg = msg;

    const sender = chat.user1.email === editedMsg.sender ? chat.user1 : chat.user2;
    const receiver = chat.user1.email === editedMsg.sender ? chat.user2 : chat.user1;

    editedMsg.senderName = sender.name;
    editedMsg.senderEmail = sender.email;
    editedMsg.senderProfile = sender.profile;
    editedMsg.receiverName = receiver.name;
    editedMsg.receiverEmail = receiver.email;
    editedMsg.receiverProfile = receiver.profile;

    return editedMsg;
  }));
}

export async function createFileMessage({ chatId, sender, file, text, type, fileName, contentType }) {
  const validatedEmail = validateEmail(sender);
  const validatedChatId = validateString(chatId);
  // const validatedText = text === "" ? "" : validateString(text);
  const validatedText = text; // TODO: text can be empty, needs to change the validation string function later to add this option

  const user = await find(validatedEmail, false, false, true);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    console.error(error);
    throw error;
  }

  const chat = await findChatByChatId(validatedChatId);
  if (!chat) {
    const error = new Error('Chat não encontrado');
    error.status = 404;
    console.error(error);
    throw error;
  }

  if (!file) {
    const error = new Error('Arquivo não encontrado');
    error.status = 400;
    console.error(error);
    throw error;
  }

  if (!contentType && type !== 'audio') {
    const error = new Error('Tipo de conteúdo não encontrado');
    error.status = 400;
    console.error(error);
    throw error
  }

  if (!fileName) {
    const error = new Error('Nome do arquivo não encontrado');
    error.status = 400;
    console.error(error);
    throw error
  }

  if (!['audio', 'video', 'file', 'image'].includes(type)) {
    const error = new Error('Tipo de arquivo inválido');
    error.status = 400;
    console.error(error);
    throw error;
  }

  const msgId = uuid();

  const uploadFile = type === 'image' ? Buffer.from(file) : file.buffer;
  console.log(uploadFile);

  let downloadUrl;
  try {
    const storageRef = ref(storage, `files/${validatedChatId}/${msgId}-${fileName}`);
    const metadata = { contentType };
    const snapshot = await uploadBytes(storageRef, uploadFile, metadata);
    downloadUrl = await getDownloadURL(snapshot.ref);
  } catch (e) {
    console.error(e);
    const error = new Error('Erro ao enviar arquivo');
    error.status = 500;
    throw error;
  }

  const m = await MessageFile.create({
    id: msgId,
    chatId: validatedChatId,
    sender: validatedEmail,
    text: validatedText,
    url: downloadUrl,
    fileName: fileName,
    type: type, // TODO: alter type in the db to be a enum type with fields: image, audio, video, file
  });

  const message = m.get({ plain: true });

  const receiver = chat.user1.email === user.email ? chat.user2 : chat.user1;

  message.senderName = user.name;
  message.senderEmail = user.email;
  message.senderProfile = user.profile;
  message.receiverName = receiver.name;
  message.receiverEmail = receiver.email;
  message.receiverProfile = receiver.profile;

  return message;
}

export async function deleteMessage(id, sender) {
  const validatedEmail = validateEmail(sender);
  const validatedId = validateString(id);
  const message = await Message.findByPk(validatedId) === null ? await MessageFile.findByPk(validatedId) : await Message.findByPk(validatedId);
  const user = await find(validatedEmail, false, false, true);

  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  if (!message) {
    const error = new Error('Mensagem não encontrada');
    error.status = 404;
    throw error;
  }

  if (message.sender !== validatedEmail) {
    const error = new Error('Usuário não autorizado');
    error.status = 401;
    throw error;
  }

  if (message.type === 'text') {
    await Message.update({ isDeleted: true }, { where: { id: validatedId } });
  } else {
    await MessageFile.update({ isDeleted: true }, { where: { id: validatedId } });
    const storageRef = ref(storage, `files/${message.chatId}/${validatedId}-${message.fileName}`);
    await deleteObject(storageRef);
  }
  return { "message": "Mensagem deletada com sucesso" };
}
