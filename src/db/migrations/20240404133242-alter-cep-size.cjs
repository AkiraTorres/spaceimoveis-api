'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('owners', 'cep', {
      type: Sequelize.STRING(9),
      allowNull: true,
    });
    await queryInterface.changeColumn('brokers', 'cep', {
      type: Sequelize.STRING(9),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('owners', 'cep', {
      type: Sequelize.STRING(8),
      allowNull: true,
    });
    await queryInterface.changeColumn('brokers', 'cep', {
      type: Sequelize.STRING(8),
      allowNull: false,
    });
  },
};
