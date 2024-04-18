'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('properties', 'rent_price', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.changeColumn('properties', 'sell_price', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });
    await queryInterface.changeColumn('properties', 'owner_email', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.changeColumn('properties', 'realtor_email', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.changeColumn('properties', 'realstate_email', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
    await queryInterface.changeColumn('properties', 'complement', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('properties', 'owner_email', {
      type: Sequelize.STRING,
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.changeColumn('properties', 'realtor_email', {
      type: Sequelize.STRING,
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.changeColumn('properties', 'realstate_email', {
      type: Sequelize.STRING,
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};
