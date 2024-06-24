import Message from "../db/models/Message.js";
import crypto from "crypto";

import {findUserChats} from "./chatService.js";
import {validateEmail, validateString} from "../validators/inputValidators.js";
import {find} from "./globalService.js";

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// TODO: precisa salvar as mensagens criptografadas no db
export async function createMessage({chatId, sender, text}) {
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

  const msg = Message.create(data);
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

  const messages = await Message.findAll({ where: { chatId }, raw: true });
  return messages;
  // return messages.map(msg => msg.text = decrypt(msg.text));
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