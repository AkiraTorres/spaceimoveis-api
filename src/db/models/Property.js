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
  is_highlighted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
    allowNull: true,
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
    allowNull: true,
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  parking_spaces: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  pool: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  grill: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  air_conditioning: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  playground: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  event_area: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  gourmet_area: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  garden: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  porch: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  slab: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  gated_community: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
    allowNull: true,
    defaultValue: null,
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
    type: DataTypes.ENUM('not-furnished', 'semi-furnished', 'furnished'),
    allowNull: false,
    defaultValue: 'not-furnished',
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
  times_seen: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  verified: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },
});

export default Property;
