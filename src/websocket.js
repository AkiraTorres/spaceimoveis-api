import { io } from "./server.js";
import * as messageService from "./services/messageService.js";
import { findMessages } from "./services/messageService.js";

io.on('connection', socket => {
  socket.on("open_chat", async (data, callback) => {
    socket.join(data.chatId);

    const messagesRoom = await findMessages(data.chatId, data.email);
    callback(messagesRoom);
  });

  socket.on("message", async data => {
    const msgData = {
      chatId: data.chatId,
      sender: data.email,
      text: data.message,
    };

    const msgRes = await messageService.createMessage(msgData);
    io.to(data.chatId).emit("message", msgRes);
  });

  socket.on('delete_message', async data => {
    await messageService.deleteMessage(data.id, data.email);
    io.to(data.chatId).emit('delete_message', data.id);
  });
});
