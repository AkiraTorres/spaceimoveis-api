'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('properties', 'parking_spaces', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('properties', 'parking_spaces', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
