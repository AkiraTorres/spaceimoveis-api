import { io } from "./server.js";
import * as messageService from "./services/messageService.js";
import {createFileMessage, findMessages} from "./services/messageService.js";
import fs from 'fs/promises';

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

  socket.on("upload", async (data, callback) => {
    console.log(data);
    let msgRes;
    try {
      msgRes = await createFileMessage({
        chatId: data.chatId,
        sender: data.email,
        file: data.file,
        text: data.text,
        type: data.type,
        contentType: data.contentType,
        fileName: data.fileName
      });
      io.to(data.chatId).emit("message", msgRes);
    } catch (error) {
      console.error(error);
      callback(error);
    }
  });

  socket.on('image', async image => {
    // image is an array of bytes
    const buffer = Buffer.from(image, 'base64');
    await fs.writeFile('/tmp/image', buffer);

    const img = await fs.readFile('/tmp/image');
    console.log(img);
  });

  socket.on('delete_message', async data => {
    await messageService.deleteMessage(data.id, data.email);
    io.to(data.chatId).emit('delete_message', data.id);
  });
});
