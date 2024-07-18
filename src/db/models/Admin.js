import { DataTypes, sequelize } from '../Conn.js';

const Admin = sequelize.define('admins', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING(11),
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  idPhone: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otp_ttl: {
    type: DataTypes.DATE,
    allowNull: true,
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

export default Admin;
