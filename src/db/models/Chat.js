import { sequelize, DataTypes } from "../Conn.js";

const Chat = sequelize.define('chats', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  user1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user2: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

export default Chat;
