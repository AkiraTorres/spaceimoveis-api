'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('properties', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.addColumn('properties', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.addColumn('photos', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.addColumn('photos', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('properties', 'createdAt');
    await queryInterface.removeColumn('properties', 'updatedAt');
    await queryInterface.removeColumn('photos', 'createdAt');
    await queryInterface.removeColumn('photos', 'updatedAt');
  },
};
