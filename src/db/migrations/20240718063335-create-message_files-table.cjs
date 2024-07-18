'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('message_files', {
      id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.DataTypes.UUID,
      },
      chatId: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'chats',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sender: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      text: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      url: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      fileName: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      fileType: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('message_files');
  }
};
