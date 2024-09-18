import { io } from './server.js';
import MessageService from './services/messageService.js';

const messageService = new MessageService();

io.on('connection', (socket) => {
  socket.on('open_chat', async (data, callback) => {
    socket.join(data.chatId);

    const messagesRoom = await messageService.findMessages(data.chatId, data.email);
    callback(messagesRoom);
  });

  socket.on('message', async (data) => {
    const msgData = {
      chatId: data.chatId,
      sender: data.email,
      text: data.message,
    };

    const msgRes = await messageService.createMessage(msgData);
    io.to(data.chatId).emit('message', msgRes);
  });

  socket.on('upload', async (data, callback) => {
    let msgRes;
    try {
      msgRes = await messageService.createFileMessage({
        chatId: data.chatId,
        sender: data.email,
        file: data.file,
        text: data.text,
        type: data.type,
        contentType: data.contentType,
        fileName: data.fileName,
        platform: data.platform,
      });
      io.to(data.chatId).emit('message', msgRes);
    } catch (error) {
      callback(error);
    }
  });

  socket.on('delete_message', async (data) => {
    await messageService.deleteMessage(data.id, data.email);
    io.to(data.chatId).emit('delete_message', data.id);
  });
});
