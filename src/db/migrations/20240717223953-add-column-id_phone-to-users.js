'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'id_phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('owners', 'id_phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('realtors', 'id_phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('realstates', 'id_phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('admins', 'id_phone', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'id_phone');
    await queryInterface.removeColumn('owners', 'id_phone');
    await queryInterface.removeColumn('realtors', 'id_phone');
    await queryInterface.removeColumn('realstates', 'id_phone');
    await queryInterface.removeColumn('admins', 'id_phone');
  }
};
