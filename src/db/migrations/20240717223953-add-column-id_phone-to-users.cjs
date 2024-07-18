'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'idPhone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('owners', 'idPhone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('realtors', 'idPhone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('realstates', 'idPhone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('admins', 'idPhone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'idPhone');
    await queryInterface.removeColumn('owners', 'idPhone');
    await queryInterface.removeColumn('realtors', 'idPhone');
    await queryInterface.removeColumn('realstates', 'idPhone');
    await queryInterface.removeColumn('admins', 'idPhone');
  }
};
