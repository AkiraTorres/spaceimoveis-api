import Message from "../db/models/Message.js";

import {findChatByChatId, findUserChats} from "./chatService.js";
import {validateEmail, validateString} from "../validators/inputValidators.js";
import {find} from "./globalService.js";

// TODO: precisa salvar as mensagens criptografadas no db
export async function createMessage({ chatId, sender, text }) {
  const validatedEmail = validateEmail(sender);
  const validatedChatId = validateString(chatId);
  const validatedText = validateString(text);

  const user = await find(validatedEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
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

  const user = await find(validatedEmail);
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  const chats = await findUserChats(validatedEmail);

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

  const messages = await Message.findAll({ where: { chatId }, raw: true });

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

export async function deleteMessage(id, sender) {
  const validatedEmail = validateEmail(sender);
  const message = await Message.findByPk(id);
  const user = await find(validatedEmail);

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

  await Message.destroy({ where: { id } });
  return { "message": "Mensagem deletada com sucesso" };
}
