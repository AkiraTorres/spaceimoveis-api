'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn('properties', 'created_at', 'createdAt');
    await queryInterface.renameColumn('properties', 'updated_at', 'updatedAt');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('properties', 'createdAt', 'created_at');
    await queryInterface.renameColumn('properties', 'updatedAt', 'updated_at');
  },
};
