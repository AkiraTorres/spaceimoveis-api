import { io } from './server.js';
import MessageService from './services/messageService.js';

async function emitUnreadMessages(email) {
  const unreadMessages = await MessageService.getUnreadMessages(email);
  if (unreadMessages) io.to(email).emit('notification', unreadMessages);
}

io.on('connection', (socket) => {
  socket.on('open_chat', async (data, callback) => {
    socket.join(data.chatId);

    const messagesRoom = await MessageService.findMessages(data.chatId, data.email);
    callback(messagesRoom);
  });

  socket.on('open_notification', async (data, callback) => {
    socket.join(data.email);
    const unreadMessages = await MessageService.getUnreadMessages(data.email);
    callback(unreadMessages);
  });

  socket.on('message', async (data) => {
    const msgData = {
      chatId: data.chatId,
      sender: data.email,
      text: data.message,
    };

    const msgRes = await MessageService.createMessage(msgData);
    io.to(data.chatId).emit('message', msgRes);

    emitUnreadMessages(data.email);
    emitUnreadMessages(data.receiver);
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

      emitUnreadMessages(data.email);
      emitUnreadMessages(data.receiver);
    } catch (error) {
      try {
        callback(error);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  });

  socket.on('delete_message', async (data) => {
    await MessageService.deleteMessage(data.id, data.email);
    io.to(data.chatId).emit('delete_message', data.id);
  });
});
