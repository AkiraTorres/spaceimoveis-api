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
  const chat = await findChatByChatId(validatedChatId, validatedEmail);

  msg.senderName = chat.senderName;
  msg.senderEmail = chat.senderEmail;
  msg.senderProfile = chat.senderProfile;
  msg.receiverName = chat.receiverName;
  msg.receiverEmail = chat.receiverEmail
  msg.receiverProfile = chat.receiverProfile

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

  const chat = await findChatByChatId(chatId, validateEmail);
  const messages = await Message.findAll({ where: { chatId }, raw: true });

  return Promise.all(messages.map(async msg => {
    const editedMsg = msg;

    editedMsg.senderName = chat.senderName;
    editedMsg.senderEmail = chat.senderEmail;
    editedMsg.senderProfile = chat.senderProfile;
    editedMsg.receiverName = chat.receiverName;
    editedMsg.receiverEmail = chat.receiverEmail
    editedMsg.receiverProfile = chat.receiverProfile

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
