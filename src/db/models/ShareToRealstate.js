import { DataTypes, sequelize } from '../Conn.js';

const ShareToRealstate = sequelize.define('share_to_realstates', {
  id: {
    type: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  email: {
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
  accepted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
