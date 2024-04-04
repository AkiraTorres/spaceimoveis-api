'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('brokers', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'broker',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('brokers', 'type');
  },
};
