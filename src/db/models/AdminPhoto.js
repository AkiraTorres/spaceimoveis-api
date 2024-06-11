import { DataTypes, sequelize } from '../Conn.js';

const AdminPhoto = sequelize.define('admins_pictures', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    autoIncrement: false,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'admins',
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

export default AdminPhoto;
