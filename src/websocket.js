/* eslint-disable no-console */
import { io } from './server.js';
import MessageService from './services/messageService.js';

io.on('connection', (socket) => {
  socket.on('open_chat', async (data, callback) => {
    socket.join(data.chatId);

    try {
      const messagesRoom = await MessageService.findMessages(data.chatId, data.email);
      const unreadMessages = await MessageService.getUnreadMessages(data.email);

      io.to(data.email).emit('notification', unreadMessages);
      if (typeof callback === 'function') callback(messagesRoom);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('open_notification', async (data, callback) => {
    socket.join(data.email);

    if (typeof callback === 'function') {
      const unreadMessages = await MessageService.getUnreadMessages(data.email);
      callback(unreadMessages);
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

      const unreadMessages = await MessageService.getUnreadMessages(data.receiver);
      io.to(data.receiver).emit('notification', unreadMessages);
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

      const unreadMessages = await MessageService.getUnreadMessages(data.receiver);
      io.to(data.receiver).emit('notification', unreadMessages);
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
