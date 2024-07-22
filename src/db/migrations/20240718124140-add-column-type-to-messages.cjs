'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('messages', 'type', {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      defaultValue: 'text',
    });

    await queryInterface.renameColumn('message_files', 'fileType', 'type');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('message_files', 'type', 'fileType');
    await queryInterface.removeColumn('messages', 'type');
  }
};
