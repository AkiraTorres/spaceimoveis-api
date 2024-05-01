import { DataTypes, sequelize } from '../Conn.js';

const Property = sequelize.define('properties', {
  id: {
    type: DataTypes.UUID,
    autoIncrement: false,
    primaryKey: true,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'property',
  },
  owner_email: {
    type: DataTypes.STRING,
    allowNull: true,
    references: { model: 'owners', key: 'email' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  realtor_email: {
    type: DataTypes.STRING,
    allowNull: true,
    references: { model: 'realtors', key: 'email' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  realstate_email: {
    type: DataTypes.STRING,
    allowNull: true,
    references: { model: 'realstate', key: 'email' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  announcement_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  property_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rent_price: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  sell_price: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  cep: {
    type: DataTypes.STRING(9),
    allowNull: false,
  },
  address: {
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
  district: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  complement: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  floor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  parking_spaces: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pool: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  grill: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  air_conditioning: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  playground: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  event_area: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  financiable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  iptu: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  aditional_fees: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  negotiable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  suites: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  furnished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  gym: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  balcony: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  solar_energy: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  concierge: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  yard: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

export default Property;
