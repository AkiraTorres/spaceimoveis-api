import { DataTypes, sequelize } from '../Conn.js';

const Favorite = sequelize.define('favorites', {
  id: {
    type: DataTypes.UUID,
    allowNull: false,
    primaryKey: true,
    autoIncrement: false,
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
  client_email: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'clients',
      key: 'email',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  owner_email: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'owners',
      key: 'email',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  realtor_email: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'realtors',
      key: 'email',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  realstate_email: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'realstates',
      key: 'email',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
});

export default Favorite;
