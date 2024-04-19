import { DataTypes, sequelize } from '../Conn.js';

const Client = sequelize.define('photos', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    autoIncrement: false,
    allowNull: false,
  },
  property_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Client;
