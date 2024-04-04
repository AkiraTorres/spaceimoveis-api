'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('owners', 'cpf', {
      type: Sequelize.STRING(11),
      allowNull: true,
      unique: true,
    });
    await queryInterface.changeColumn('realtors', 'cpf', {
      type: Sequelize.STRING(11),
      allowNull: false,
      unique: true,
    });
    await queryInterface.changeColumn('owners', 'rg', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.changeColumn('realtors', 'rg', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
    await queryInterface.changeColumn('realtors', 'creci', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('owners', 'cpf', {
      type: Sequelize.STRING(11),
      allowNull: true,
    });
    await queryInterface.changeColumn('realtors', 'cpf', {
      type: Sequelize.STRING(11),
      allowNull: false,
    });
    await queryInterface.changeColumn('owners', 'rg', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('realtors', 'rg', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('realtors', 'creci', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
