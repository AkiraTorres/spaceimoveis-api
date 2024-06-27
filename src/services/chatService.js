import {v4 as uuid} from 'uuid';

import Chat from "../db/models/Chat.js";
import { validateEmail } from "../validators/inputValidators.js";
import { find } from "./globalService.js";
import { Op } from "sequelize";
import OwnerPhoto from "../db/models/OwnerPhoto.js";
import RealtorPhoto from "../db/models/RealtorPhoto.js";
import RealstatePhoto from "../db/models/RealstatePhoto.js";

export async function create(email1, email2) {
  const validatedEmail1 = validateEmail(email1);
  const validatedEmail2 = validateEmail(email2);

  const user1 = await find(validatedEmail1);
  const user2 = await find(validatedEmail2);

  if (!user1 || !user2) {
    throw new Error('Usuário não encontrado');
  }

  let chat = await Chat.findOne({ where: {
      [Op.or]: [
        { [Op.and]: [{user1: validatedEmail1}, {user2: validatedEmail2}] },
        { [Op.and]: [{user1: validatedEmail2}, {user2: validatedEmail1}] },
      ]
  }});

  if (!chat) {
    chat = await Chat.create({ id: uuid(), user1: email1, user2: email2 });
  }

  chat.receiverName = user2.name;
  chat.senderName = user1.name;

  if (user2.type === 'client') {
    chat.receiverProfile = null;
  } else if (user2.type === 'owner') {
    chat.receiverProfile = await OwnerPhoto.findOne({ where: { email: user2.email } });
  } else if (user2.type === 'realtor') {
    chat.receiverProfile = await RealtorPhoto.findOne({ where: { email: user2.email } });
  } else if (user2.type === 'realstate') {
    chat.receiverProfile = await RealstatePhoto.findOne({ where: { email: user2.email } });
  }

  if (user1.type === 'client') {
    chat.receiverProfile = null;
  } else if (user1.type === 'owner') {
    chat.senderProfile = await OwnerPhoto.findOne({ where: { email: user1.email } });
  } else if (user1.type === 'realtor') {
    chat.senderProfile = await RealtorPhoto.findOne({ where: { email: user1.email } });
  } else if (user1.type === 'realstate') {
    chat.senderProfile = await RealstatePhoto.findOne({ where: { email: user1.email } });
  }

  return chat;
}

export async function findUserChats(email) {
  const validatedEmail = validateEmail(email);

  const user = await find(validatedEmail);

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  const chats = await Chat.findAll({
    where: {
      [Op.or]: [{user1: validatedEmail}, {user2: validatedEmail}]
    }
  });

  return Promise.all(chats.map(async chat => {
    const editedChat = chat;
    const r = editedChat.user1 === validatedEmail ? editedChat.user2 : editedChat.user1;
    const receiver = await find(r);
    editedChat.receiverName = receiver.name;
    editedChat.senderName = user.name;

    if (receiver.type === 'client') {
      editedChat.receiverProfile = null;
    } else if (receiver.type === 'owner') {
      editedChat.receiverProfile = await OwnerPhoto.findOne({ where: { email: receiver.email } });
    } else if (receiver.type === 'realtor') {
      editedChat.receiverProfile = await RealtorPhoto.findOne({ where: { email: receiver.email } });
    } else if (receiver.type === 'realstate') {
      editedChat.receiverProfile = await RealstatePhoto.findOne({ where: { email: receiver.email } });
    }

    if (user.type === 'client') {
      editedChat.receiverProfile = null;
    } else if (user.type === 'owner') {
      editedChat.senderProfile = await OwnerPhoto.findOne({ where: { email: user.email } });
    } else if (user.type === 'realtor') {
      editedChat.senderProfile = await RealtorPhoto.findOne({ where: { email: user.email } });
    } else if (user.type === 'realstate') {
      editedChat.senderProfile = await RealstatePhoto.findOne({ where: { email: user.email } });
    }

    return editedChat;
  }));
}

export async function findChat(email1, email2) {
  const validatedEmail1 = validateEmail(email1);
  const validatedEmail2 = validateEmail(email2);

  const user1 = await find(validatedEmail1);
  const user2 = await find(validatedEmail2);

  if (!user1 || !user2) {
    throw new Error('Usuário não encontrado');
  }

  const chat = await Chat.findOne({ where: {
      [Op.and]: [
        { [Op.or]: [{user1: validatedEmail1}, {user2: validatedEmail2}] },
        { [Op.or]: [{user1: validatedEmail2}, {user2: validatedEmail1}] },
      ]
  }});

  if (!chat) {
    throw new Error('Chat não encontrado');
  }

  chat.senderName = user1.name;
  chat.receiverName = user2.name;

  if (user1.type === 'client') {
    chat.receiverProfile = null;
  } else if (user1.type === 'owner') {
    chat.receiverProfile = await OwnerPhoto.findOne({ where: { email: user1.email } });
  } else if (user1.type === 'realtor') {
    chat.receiverProfile = await RealtorPhoto.findOne({ where: { email: user1.email } });
  } else if (user1.type === 'realstate') {
    chat.receiverProfile = await RealstatePhoto.findOne({ where: { email: user1.email } });
  }

  if (user2.type === 'client') {
    chat.senderProfile = null;
  } else if (user2.type === 'owner') {
    chat.senderProfile = await OwnerPhoto.findOne({ where: { email: user2.email } });
  } else if (user2.type === 'realtor') {
    chat.senderProfile = await RealtorPhoto.findOne({ where: { email: user2.email } });
  } else if (user2.type === 'realstate') {
    chat.senderProfile = await RealstatePhoto.findOne({ where: { email: user2.email } });
  }

  return chat;
}

export async function findChatByChatId(chatId, s) {
  const chat = await Chat.findByPk(chatId);

  if (!chat) {
    throw new Error('Chat não encontrado');
  }

  const receiverEmail = chat.user1 === s ? chat.user2 : chat.user1;
  const senderEmail = chat.user2 === s ? chat.user2 : chat.user1;

  const receiver = await find(receiverEmail);
  const sender = await find(senderEmail);

  chat.senderName = receiver.name;
  chat.receiverName = sender.name;

  if (receiver.type === 'client') {
    chat.receiverProfile = null;
  } else if (receiver.type === 'owner') {
    chat.receiverProfile = await OwnerPhoto.findOne({ where: { email: receiver.email } });
  } else if (receiver.type === 'realtor') {
    chat.receiverProfile = await RealtorPhoto.findOne({ where: { email: receiver.email } });
  } else if (receiver.type === 'realstate') {
    chat.receiverProfile = await RealstatePhoto.findOne({ where: { email: receiver.email } });
  }

  if (sender.type === 'client') {
    chat.senderProfile = null;
  } else if (sender.type === 'owner') {
    chat.senderProfile = await OwnerPhoto.findOne({ where: { email: sender.email } });
  } else if (sender.type === 'realtor') {
    chat.senderProfile = await RealtorPhoto.findOne({ where: { email: sender.email } });
  } else if (sender.type === 'realstate') {
    chat.senderProfile = await RealstatePhoto.findOne({ where: { email: sender.email } });
  }

  return chat;
}