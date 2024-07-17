import { DataTypes, sequelize } from '../Conn.js';

const Owner = sequelize.define('owners', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING(11),
    allowNull: true,
  },
  rg: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  house_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cep: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(2),
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'owner',
  },
  bio: {
    type: DataTypes.STRING(1024),
    allowNull: true,
    defaultValue: true,
  },
  subscription: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'free',
  },
  idPhone: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otp_ttl: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default Owner;
