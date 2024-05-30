'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('properties', 'pool', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.changeColumn('properties', 'grill', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.changeColumn('properties', 'air_conditioning', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.changeColumn('properties', 'playground', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.changeColumn('properties', 'event_area', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.changeColumn('properties', 'gourmet_area', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.changeColumn('properties', 'garden', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.changeColumn('properties', 'porch', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.changeColumn('properties', 'slab', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.changeColumn('properties', 'gated_community', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('properties', 'pool', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.changeColumn('properties', 'grill', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.changeColumn('properties', 'air_conditioning', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.changeColumn('properties', 'playground', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.changeColumn('properties', 'event_area', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.changeColumn('properties', 'gourmet_area', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.changeColumn('properties', 'garden', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.changeColumn('properties', 'porch', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.changeColumn('properties', 'slab', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    await queryInterface.changeColumn('properties', 'gated_community', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
  },
};
