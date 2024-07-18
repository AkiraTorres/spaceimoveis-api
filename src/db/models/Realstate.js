import { DataTypes, sequelize } from '../Conn.js';

const Realstate = sequelize.define('realstates', {
  company_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    primaryKey: true,
  },
  cnpj: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  creci: {
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
  cep: {
    type: DataTypes.STRING(9),
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  house_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(2),
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'realstate',
  },
  social_one: {
    type: DataTypes.STRING(512),
    allowNull: true,
  },
  social_two: {
    type: DataTypes.STRING(512),
    allowNull: true,
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
});

export default Realstate;
