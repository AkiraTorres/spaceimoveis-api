'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('owners', 'bio', {
      type: Sequelize.STRING(1024),
      allowNull: true,
      defaultValue: true,
    });

    await queryInterface.changeColumn('realtors', 'bio', {
      type: Sequelize.STRING(1024),
      allowNull: true,
      defaultValue: true,
    });

    await queryInterface.changeColumn('realstates', 'bio', {
      type: Sequelize.STRING(1024),
      allowNull: true,
      defaultValue: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('owners', 'bio', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: true,
    });

    await queryInterface.changeColumn('realtors', 'bio', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: true,
    });

    await queryInterface.changeColumn('realstates', 'bio', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: true,
    });
  },
};
