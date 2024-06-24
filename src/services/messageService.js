import Message from "../db/models/Message.js";
import OwnerPhoto from "../db/models/OwnerPhoto.js";
import RealtorPhoto from "../db/models/RealtorPhoto.js";
import RealstatePhoto from "../db/models/RealstatePhoto.js";

import { findUserChats } from "./chatService.js";
import { validateEmail, validateString } from "../validators/inputValidators.js";
import { find } from "./globalService.js";

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

  const msg = await Message.create(data);

  msg.username = user.name;

  if (user.type === 'owner') {
    msg.profile = await OwnerPhoto.findOne({ where: { email: user.email } });
  } else if (user.type === 'realtor') {
    msg.profile = await RealtorPhoto.findOne({ where: { email: user.email } });
  } else if (user.type === 'realstate') {
    msg.profile = await RealstatePhoto.findOne({ where: { email: user.email } });
  }

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

  const response = Promise.all(messages.map(async msg => {
    const editedMsg = msg;
    editedMsg.username = user.name;

    if (user.type === 'owner') {
      editedMsg.profile = await OwnerPhoto.findOne({ where: { email: user.email } });
    } else if (user.type === 'realtor') {
      editedMsg.profile = await RealtorPhoto.findOne({ where: { email: user.email } });
    } else if (user.type === 'realstate') {
      editedMsg.profile = await RealstatePhoto.findOne({ where: { email: user.email } });
    }
    return editedMsg;
  }));

  return response;
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
