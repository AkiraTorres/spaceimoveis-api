/* eslint-disable no-console */
import { io } from './server.js';
import MessageService from './services/messageService.js';
import NotificationService from './services/notificationService.js';

io.on('connection', (socket) => {
  socket.on('open_chat', async (data, callback) => {
    socket.join(data.chatId);

    try {
      const messagesRoom = await MessageService.findMessages(data.chatId, data.email);
      // const unreadMessages = await MessageService.getUnreadMessages(data.email);
      await NotificationService.markAllAsReadByChatId(data.email, data.chatId);
      const notifications = await NotificationService.getNotifications(data.email);

      // io.to(data.email).emit('notification', unreadMessages);
      io.to(data.email).emit('all_notifications', notifications);
      if (typeof callback === 'function') callback(messagesRoom);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('open_notification', async (data, callback) => {
    socket.join(data.email);

    if (typeof callback === 'function') {
      // const unreadMessages = await MessageService.getUnreadMessages(data.email);
      const notifications = await NotificationService.getNotifications(data.email);
      callback(notifications);
    }
  });

  socket.on('send_notification', async (data, callback) => {
    try {
      const notificationData = {
        title: data.title,
        sender: data.sender,
        text: data.text ? data.text : '',
        receiver: data.receiver,
        type: data.type,
      };

      const notification = await NotificationService.createNotification(notificationData);
      io.to(data.receiver).emit('notification', notification);
    } catch (error) {
      if (typeof callback === 'function') callback(error);
      else console.error(error);
    }
  });

  socket.on('message', async (data, callback) => {
    try {
      const msgData = {
        chatId: data.chatId,
        sender: data.email,
        text: data.message,
      };

      const msgRes = await MessageService.createMessage(msgData);
      io.to(data.chatId).emit('message', msgRes);

      const notification = await NotificationService.createNotification({
        title: 'Nova mensagem',
        sender: data.email,
        text: data.message,
        receiver: data.receiver,
        type: 'message',
      });
      io.to(data.receiver).emit('notification', notification);

      // const unreadMessages = await MessageService.getUnreadMessages(data.receiver);
      // io.to(data.receiver).emit('notification', unreadMessages);
    } catch (error) {
      if (typeof callback === 'function') callback(error);
      else console.error(error);
    }
  });

  socket.on('upload', async (data, callback) => {
    let msgRes;
    try {
      msgRes = await MessageService.createFileMessage({
        chatId: data.chatId,
        sender: data.email,
        file: data.file,
        text: data.text,
        t: data.type,
        contentType: data.contentType,
        fileName: data.fileName,
        platform: data.platform,
      });
      io.to(data.chatId).emit('message', msgRes);

      const notification = await NotificationService.createNotification({
        title: 'Nova mensagem',
        sender: data.email,
        text: data.text ? data.text : 'Abra a conversa para visualizar a imagem',
        receiver: data.receiver,
        type: 'message',
      });
      io.to(data.receiver).emit('notification', notification);

      // const unreadMessages = await MessageService.getUnreadMessages(data.receiver);
      // io.to(data.receiver).emit('notification', unreadMessages);
    } catch (error) {
      if (typeof callback === 'function') callback(error);
      else console.error(error);
    }
  });

  socket.on('delete_message', async (data, callback) => {
    try {
      await MessageService.deleteMessage(data.id, data.email);
      io.to(data.chatId).emit('delete_message', data.id);
    } catch (error) {
      if (typeof callback === 'function') callback(error);
      else console.error(error);
    }
  });
});
