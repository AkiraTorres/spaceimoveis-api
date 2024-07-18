'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('message_files', 'url', {
      type: Sequelize.DataTypes.STRING(2048),
      allowNull: null,
    });

    await queryInterface.renameColumn('message_files', 'url', 'file');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('message_files', 'file', 'url');
    await queryInterface.changeColumn('message_files', 'url', {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    });
  }
};
