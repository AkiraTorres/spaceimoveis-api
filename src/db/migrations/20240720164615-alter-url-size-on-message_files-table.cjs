'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('message_files', 'url', {
      type: Sequelize.STRING(2048),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('message_files', 'url', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
