import { DataTypes, sequelize } from '../Conn.js';

const RealstatePhoto = sequelize.define('realstates_pictures', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    autoIncrement: false,
    allowNull: false,
  },
  email: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'realstate',
      key: 'email',
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

export default RealstatePhoto;
