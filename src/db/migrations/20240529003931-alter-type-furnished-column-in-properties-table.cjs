'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('properties', 'furnished');

    await queryInterface.addColumn('properties', 'furnished', {
      type: Sequelize.ENUM('not-furnished', 'semi-furnished', 'furnished'),
      allowNull: false,
      defaultValue: 'not-furnished',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('properties', 'furnished');

    await queryInterface.addColumn('properties', 'furnished', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },
};
