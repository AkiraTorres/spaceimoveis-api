import {v4 as uuid} from 'uuid';

import Chat from "../db/models/Chat.js";
import {validateEmail} from "../validators/inputValidators.js";
import {find} from "./globalService.js";
import {Op} from "sequelize";
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

  if (user2.type === 'owner') {
    chat.receiverProfile = await OwnerPhoto.findOne({ where: { email: user2.email } });
  } else if (user2.type === 'realtor') {
    chat.receiverProfile = await RealtorPhoto.findOne({ where: { email: user2.email } });
  } else if (user2.type === 'realstate') {
    chat.receiverProfile = await RealstatePhoto.findOne({ where: { email: user2.email } });
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
    const receiver = chat.user1 === validatedEmail ? chat.user2 : chat.user1;
    const user = await find(receiver);
    chat.receiverName = user.name;

    if (user.type === 'owner') {
      chat.receiverProfile = await OwnerPhoto.findOne({ where: { email: user.email } });
    } else if (user.type === 'realtor') {
      chat.receiverProfile = await RealtorPhoto.findOne({ where: { email: user.email } });
    } else if (user.type === 'realstate') {
      chat.receiverProfile = await RealstatePhoto.findOne({ where: { email: user.email } });
    }

    return chat;
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

  chat.receiverName = user2.name;

  if (user2.type === 'owner') {
    chat.receiverProfile = await OwnerPhoto.findOne({ where: { email: user2.email } });
  } else if (user2.type === 'realtor') {
    chat.receiverProfile = await RealtorPhoto.findOne({ where: { email: user2.email } });
  } else if (user2.type === 'realstate') {
    chat.receiverProfile = await RealstatePhoto.findOne({ where: { email: user2.email } });
  }

  return chat;
}