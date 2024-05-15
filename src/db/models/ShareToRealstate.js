import { DataTypes, sequelize } from '../Conn.js';

const ShareToRealstate = sequelize.define('share_to_realstate', {
  id: {
    type: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  realstate_email: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'realstate',
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

export default ShareToRealstate;
