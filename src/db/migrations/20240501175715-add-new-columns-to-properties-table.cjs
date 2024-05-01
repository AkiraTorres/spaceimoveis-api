'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('properties', 'iptu', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('properties', 'aditional_fees', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('properties', 'negotiable', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('properties', 'suites', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('properties', 'furnished', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('properties', 'gym', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('properties', 'balcony', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('properties', 'solar_energy', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('properties', 'concierge', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('properties', 'yard', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('properties', 'iptu');
    await queryInterface.removeColumn('properties', 'aditional_fees');
    await queryInterface.removeColumn('properties', 'negotiable');
    await queryInterface.removeColumn('properties', 'suites');
    await queryInterface.removeColumn('properties', 'furnished');
    await queryInterface.removeColumn('properties', 'gym');
    await queryInterface.removeColumn('properties', 'balcony');
    await queryInterface.removeColumn('properties', 'solar_energy');
    await queryInterface.removeColumn('properties', 'concierge');
    await queryInterface.removeColumn('properties', 'yard');
  },
};
