import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateEmail, validateMessageType, validateString } from '../validators/inputValidators.js';
import ChatService from './chatService.js';
import UserService from './userService.js';

export default class NotificationService {
  // TODO: precisa salvar as mensagens criptografadas no db
  static async createNotification({ title, sender, text, receiver, type, sharedPropertyId, chatId, appointmentId, propertyId }) {
    if (!title || !sender || !receiver || !type) throw new ConfigurableError('Os campos title, sender, receiver e type são obrigatórios', 400);

    const validatedSender = validateEmail(sender);
    const validatedReceiver = validateEmail(receiver);
    const validatedTitle = validateString(title);
    const validatedText = text ? validateString(text) : null;
    const validatedSharedPropertyId = sharedPropertyId ? validateString(sharedPropertyId) : null;
    const validatedChatId = chatId ? validateString(chatId) : null;
    const validatedAppointmentId = appointmentId ? validateString(appointmentId) : null;
    const validatedPropertyId = propertyId ? validateString(propertyId) : null;
    // const validatedType = validateMessageType(type);

    const senderUser = await UserService.find({ email: validatedSender });
    if (!senderUser) throw new ConfigurableError('Usuário não encontrado', 404);

    const receiverUser = await UserService.find({ email: validatedReceiver });
    if (!receiverUser) throw new ConfigurableError('Usuário não encontrado', 404);

    const data = {
      title: validatedTitle,
      sender: validatedSender,
      text: validatedText,
      user: validatedReceiver,
      type,
      chatId: validatedChatId,
      sharedPropertyId: validatedSharedPropertyId,
      appointmentId: validatedAppointmentId,
      propertyId: validatedPropertyId,
    };
    const notification = await prisma.notification.create({ data });

    return {
      ...notification,
      senderName: senderUser.name,
      senderEmail: senderUser.email,
      senderProfile: senderUser.profile,
      userName: receiverUser.name,
      userEmail: receiverUser.email,
      userProfile: receiverUser.profile,
    };
  }

  static async getNotifications(email) {
    const validatedEmail = validateEmail(email);

    const notifications = await prisma.notification.findMany({
      where: { user: validatedEmail },
      orderBy: { createdAt: 'desc' },
    });

    const result = await Promise.all(notifications.map(async (notification) => {
      const user = await UserService.find({ email: notification.user, select: { name: true, profile: true } });
      const sender = await UserService.find({ email: notification.sender, select: { name: true, profile: true } });
      return {
        ...notification,
        userName: user.name,
        userEmail: user.email,
        userProfile: user.profile,
        senderName: sender.name,
        senderEmail: sender.email,
        senderProfile: sender.profile,
      };
    }));

    return result;
  }

  static async getUnreadNotifications(email) {
    const validatedEmail = validateEmail(email);

    const notifications = await prisma.notification.findMany({
      where: { user: validatedEmail, read: false },
      orderBy: { createdAt: 'desc' },
    });

    const result = await Promise.all(notifications.map(async (notification) => {
      const user = await UserService.find({ email: notification.user, select: { name: true, profile: true } });
      const sender = await UserService.find({ email: notification.sender, select: { name: true, profile: true } });
      return {
        ...notification,
        userName: user.name,
        userEmail: user.email,
        userProfile: user.profile,
        senderName: sender.name,
        senderEmail: sender.email,
        senderProfile: sender.profile,
      };
    }));

    return result;
  }

  static async markAsRead(id, email) {
    const validatedId = validateString(id);

    const validatedEmail = validateEmail(email);
    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const transactions = [
      prisma.notification.update({
        where: { id: validatedId },
        data: { read: true },
      }),
      prisma.notification.deleteMany({
        where: { id: validatedId, type: 'message', read: true },
      }),
    ];

    return prisma.$transaction(transactions);
  }

  static async markAllAsRead(email) {
    const validatedEmail = validateEmail(email);

    const notifications = await prisma.notification.updateMany({
      where: { user: validatedEmail, read: false },
      data: { read: true },
    });

    return notifications;
  }

  static async markAllAsReadByType(email, type) {
    const validatedEmail = validateEmail(email);
    const validatedType = validateMessageType(type);

    const notifications = await prisma.notification.updateMany({
      where: { user: validatedEmail, type: validatedType, read: false },
      data: { read: true },
    });

    return notifications;
  }

  static async markAllAsReadByChat(email, senderEmail) {
    const validatedEmail = validateEmail(email);
    const validatedSenderEmail = validateEmail(senderEmail);

    const chat = await ChatService.findChat(validatedEmail, validatedSenderEmail);
    if (!chat) throw new ConfigurableError('Chat não encontrado', 404);

    const transactions = [
      prisma.notification.updateMany({
        where: { user: validatedEmail, sender: validatedSenderEmail, chatId: chat.id, type: 'message', read: false },
        data: { read: true },
      }),
      prisma.notification.deleteMany({
        where: { user: validatedEmail, sender: validatedSenderEmail, chatId: chat.id, type: 'message', read: true },
      }),
    ];

    return prisma.$transaction(transactions);
  }

  static async markAllAsReadByChatId(email, chatId) {
    const validatedEmail = validateEmail(email);
    const validatedChatId = validateString(chatId);

    const chat = await ChatService.findChatByChatId(validatedChatId);
    if (!chat) throw new ConfigurableError('Chat não encontrado', 404);

    const transactions = [
      prisma.notification.updateMany({
        where: { user: validatedEmail, sender: chat.senderEmail, chatId: chat.id, type: 'message', read: false },
        data: { read: true },
      }),
      prisma.notification.deleteMany({
        where: { user: validatedEmail, sender: chat.senderEmail, chatId: chat.id, type: 'message', read: true },
      }),
    ];

    return prisma.$transaction(transactions);
  }
}
