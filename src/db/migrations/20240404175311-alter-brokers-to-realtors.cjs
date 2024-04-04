'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable('brokers', 'realtors');

    await queryInterface.changeColumn('realtors', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'realtor',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable('realtors', 'brokers');

    await queryInterface.addColumn('brokers', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'broker',
    });
  },
};
