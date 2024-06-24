import { io } from "./server.js";
import * as messageService from "./services/messageService.js";
import * as chatService from "./services/chatService.js";
import { findMessages } from "./services/messageService.js";

const users = [];

io.on('connection', socket => {
  socket.on("open_chat", async (data, callback) => {
    socket.join(data.chatId);

    const messagesRoom = await findMessages(data.chatId, data.email);
    callback(messagesRoom);
  });

  socket.on("message", async data => {
    // Salvar as mensagens
    const msgData = {
      chatId: data.chatId,
      sender: data.email,
      text: data.message,
      createdAt: new Date(),
    };

    messageService.createMessage(msgData);

    io.to(data.chatId).emit("message", msgData);
    // messages.push(message);

    // Enviar para os usuários da sala
    // io.to(data.room).emit("message", message);
  });
});
