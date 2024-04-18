'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn('properties', 'number', 'house_number');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('properties', 'house_number', 'number');
  },
};
