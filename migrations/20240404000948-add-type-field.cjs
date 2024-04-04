'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'client',
    });

    await queryInterface.addColumn('owners', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'owner',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'type');
    await queryInterface.removeColumn('owners', 'type');
  },
};
