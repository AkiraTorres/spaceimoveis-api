import { DataTypes, sequelize } from '../Conn.js';

const ShareToRealtor = sequelize.define('share_to_realtor', {
  id: {
    type: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  realtor_email: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'realtor',
      key: 'email',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  property_id: {
    type: DataTypes.UUIDV4,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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

export default ShareToRealtor;
