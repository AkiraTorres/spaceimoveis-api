import { sequelize, DataTypes } from "../Conn.js";

const ReasonRejected = sequelize.define('reason_rejected_properties', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4,
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
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, { timestamps: false });

export default ReasonRejected;