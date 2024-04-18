'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn('properties', 'neighborhood', 'district');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('properties', 'district', 'neighborhood');
  },
};
