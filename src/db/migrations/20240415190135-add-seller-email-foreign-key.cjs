'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('properties', 'owner_email', {
      type: Sequelize.STRING,
      allowNull: true,
      references: { model: 'owners', key: 'email' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('properties', 'realtor_email', {
      type: Sequelize.STRING,
      allowNull: true,
      references: { model: 'realtors', key: 'email' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('properties', 'realstate_email', {
      type: Sequelize.STRING,
      allowNull: true,
      references: { model: 'realstates', key: 'email' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('properties', 'owner_email');
    await queryInterface.removeColumn('properties', 'realtor_email');
    await queryInterface.removeColumn('properties', 'realstate_email');
  },
};
