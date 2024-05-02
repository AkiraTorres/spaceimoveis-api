'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'otp', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('clients', 'otp_ttl', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('owners', 'otp', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('owners', 'otp_ttl', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('realtors', 'otp', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('realtors', 'otp_ttl', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('realstates', 'otp', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('realstates', 'otp_ttl', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('clients', 'otp');
    await queryInterface.removeColumn('clients', 'otp_ttl');

    await queryInterface.removeColumn('owners', 'otp');
    await queryInterface.removeColumn('owners', 'otp_ttl');

    await queryInterface.removeColumn('realtors', 'otp');
    await queryInterface.removeColumn('realtors', 'otp_ttl');

    await queryInterface.removeColumn('realstates', 'otp');
    await queryInterface.removeColumn('realstates', 'otp_ttl');
  },
};
