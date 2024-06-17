'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('properties', 'verified');

    await queryInterface.addColumn('properties', 'verified', {
      type: Sequelize.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('properties', 'verified');

    await queryInterface.addColumn('properties', 'verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
  },
};
