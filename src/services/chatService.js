import { v4 as uuid } from 'uuid';

import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateEmail } from '../validators/inputValidators.js';
import UserService from './userService.js';

export default class ChatService {
  static async create(email1, email2) {
    const validatedEmail1 = validateEmail(email1);
    const validatedEmail2 = validateEmail(email2);

    const user1 = await UserService.find({ email: validatedEmail1 });
    const user2 = await UserService.find({ email: validatedEmail2 });

    if (!user1 || !user2) throw new ConfigurableError('Usuário não encontrado', 404);

    let chat = await prisma.chat.findFirst({
      where: {
        OR: [
          {
            AND: [
              { user1Email: validatedEmail1 },
              { user2Email: validatedEmail2 },
            ],
          },
          {
            AND: [
              { user1Email: validatedEmail2 },
              { user2Email: validatedEmail1 },
            ],
          },
        ],
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({ id: uuid(), user1Email: email1, user2Email: email2 });
    }

    chat.user1 = user1;
    chat.user2 = user2;

    return chat;
  }

  static async findUserChats(email) {
    const validatedEmail = validateEmail(email);

    const user = await UserService.find({ email: validatedEmail });

    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { user1: validatedEmail },
          { user2: validatedEmail },
        ],
      },
    });

    return Promise.all(chats.map(async (chat) => {
      const editedChat = chat;
      const user1 = await UserService.find({ email: chat.user1 });
      const user2 = await UserService.find({ email: chat.user2 });

      editedChat.user1 = user1;
      editedChat.user2 = user2;

      return editedChat;
    }));
  }

  static async findChat(email1, email2) {
    const validatedEmail1 = validateEmail(email1);
    const validatedEmail2 = validateEmail(email2);

    const user1 = await UserService.find({ email: validatedEmail1 });
    const user2 = await UserService.find({ email: validatedEmail2 });

    if (!user1 || !user2) throw new ConfigurableError('Usuário não encontrado', 404);

    const chat = await prisma.chat.findFirst({
      where: {
        AND: [
          {
            OR: [
              { user1: validatedEmail1 },
              { user2: validatedEmail2 },
            ],
          },
          {
            OR: [
              { user1: validatedEmail2 },
              { user2: validatedEmail1 },
            ],
          },
        ],
      },
    });

    if (!chat) throw new ConfigurableError('Chat não encontrado', 404);

    chat.user1 = user1;
    chat.user2 = user2;

    return chat;
  }

  static async findChatByChatId(chatId) {
    const chat = await prisma.chat.findFirst(chatId);

    if (!chat) throw new ConfigurableError('Chat não encontrado', 404);

    chat.user1 = await UserService.find({ email: chat.user1 });
    chat.user2 = await UserService.find({ email: chat.user2 });

    return chat;
  }
}
