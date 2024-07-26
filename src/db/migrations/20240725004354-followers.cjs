'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('followers', {
      id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.DataTypes.UUIDV4,
      },
      followerEmail: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      followedEmail: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('followers');
  }
};
