import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

import firebaseConfig from '../config/firebase.js';
import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateEmail, validateMessageType, validateString } from '../validators/inputValidators.js';
import ChatService from './chatService.js';
import UserService from './userService.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export default class MessageService {
  // TODO: precisa salvar as mensagens criptografadas no db
  static async createMessage({ chatId, sender, text }) {
    if (!text || text === '') throw new ConfigurableError('Texto da mensagem não pode ser vazio', 400);

    const validatedEmail = validateEmail(sender);
    const validatedChatId = validateString(chatId);
    const validatedText = validateString(text);

    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const data = { chatId: validatedChatId, senderEmail: validatedEmail, text: validatedText };
    const msg = await prisma.message.create({ data });
    const chat = await ChatService.findChatByChatId(validatedChatId, validatedEmail);
    const receiver = chat.user1.email === user.email ? chat.user2 : chat.user1;

    return {
      ...msg,
      senderName: user.name,
      senderEmail: user.email,
      senderProfile: user.profile,
      receiverName: receiver.name,
      receiverEmail: receiver.email,
      receiverProfile: receiver.profile,
    };
  }

  static async findMessages(chatId, email) {
    const validatedEmail = validateEmail(email);

    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const chats = await ChatService.findUserChats(validatedEmail);
    if (!chats || !chats.some((chat) => chat.id === chatId)) throw new ConfigurableError('Chat não encontrado', 404);

    const chat = await ChatService.findChatByChatId(chatId);
    if (!chat) throw new ConfigurableError('Chat não encontrado', 404);

    const messages = await prisma.message.findMany({ where: { chatId } });
    if (!messages || messages.length === 0) return [];

    messages.sort((a, b) => a.createdAt - b.createdAt);

    const transactions = [];

    messages.forEach((message) => {
      if (message.senderEmail === validatedEmail && !message.isRead) {
        transactions.push(prisma.message.update({ where: { id: message.id }, data: { isRead: true } }));
      }
    });

    await prisma.$transaction(transactions);

    return messages;
  }

  static async createFileMessage({ chatId, sender, file, text, t, fileName, contentType, platform }) {
    const validatedEmail = validateEmail(sender);
    const validatedChatId = validateString(chatId);
    const type = validateMessageType(t);
    const validatedText = text === '' || text === undefined ? '' : validateString(text);

    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const chat = await ChatService.findChatByChatId(validatedChatId);
    if (!chat) throw new ConfigurableError('Chat não encontrado', 404);
    if (!file) throw new ConfigurableError('Arquivo não encontrado', 400);
    if (!contentType && type !== 'audio') throw new ConfigurableError('Tipo de conteúdo não encontrado', 400);
    if (!fileName) throw new ConfigurableError('Nome do arquivo não encontrado', 400);
    if (!['audio', 'video', 'file', 'image'].includes(type)) throw new ConfigurableError('Tipo de arquivo inválido', 400);

    const msgId = uuid();

    let uploadFile = file.buffer;
    let name = fileName;
    let ct = contentType;
    if (['image', 'audio'].includes(type) || platform === 'mobile') {
      const buf = Buffer.from(file, 'base64');
      const filename = fileURLToPath(import.meta.url);
      const dirname = path.dirname(filename);
      const filePath = path.join(dirname, 'public', 'tmp', 'files');
      await fs.mkdir(filePath, { recursive: true });
      const fileFullPath = path.join(filePath, name);
      await fs.writeFile(fileFullPath, buf);
      uploadFile = await fs.readFile(fileFullPath);

      fs.rm(path.join(dirname, 'public'), { recursive: true, force: true });

      if (type === 'audio' && platform === 'mobile') {
        name = name.replace(/\.aac$/, '.wav');
        ct = 'audio/wav';
      }
    }

    let downloadUrl;
    try {
      const storageRef = ref(storage, `files/${validatedChatId}/${msgId}-${name}`);
      const metadata = { contentType: ct };
      const snapshot = await uploadBytes(storageRef, uploadFile, metadata);
      downloadUrl = await getDownloadURL(snapshot.ref);
    } catch (e) {
      throw new ConfigurableError('Erro ao salvar arquivo', 500);
    }

    const data = { chatId: validatedChatId, senderEmail: validatedEmail, text: validatedText, url: downloadUrl, filename: name, type };

    return prisma.message.create({ data });
  }

  static async deleteMessage(id, sender) {
    const validatedEmail = validateEmail(sender);
    const validatedId = validateString(id);
    const message = await prisma.message.findFirst(validatedId) === null;
    const user = await UserService.find({ email: validatedEmail });

    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);
    if (!message) throw new ConfigurableError('Mensagem não encontrada', 404);
    if (message.senderEmail !== validatedEmail) throw new ConfigurableError('Usuário não autorizado', 401);

    await prisma.message.delete({ where: { id: validatedId } });

    if (message.type !== 'text') {
      const storageRef = ref(storage, `files/${message.chatId}/${validatedId}-${message.fileName}`);
      await deleteObject(storageRef);
    }
    return { message: 'Mensagem deletada com sucesso' };
  }

  static async getUnreadMessages(email) {
    const validatedEmail = validateEmail(email);

    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const m = await prisma.message.findMany({
      where: {
        senderEmail: { not: validatedEmail },
        isRead: false,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const messages = await Promise.all(m.map(async (message) => {
      const sender = await UserService.find({ email: message.senderEmail });

      return {
        ...message,
        senderName: sender.name,
        // senderEmail: sender.email,
        senderProfile: sender.profile,
      };
    }));

    return { messages, total: messages.length };
  }
}
