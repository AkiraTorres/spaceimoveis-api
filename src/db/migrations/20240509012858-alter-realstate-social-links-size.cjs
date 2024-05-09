'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('realtors', 'social_one', {
      type: Sequelize.STRING(512),
      allowNull: true,
    });

    await queryInterface.changeColumn('realtors', 'social_two', {
      type: Sequelize.STRING(512),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('realtors', 'social_one', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('realtors', 'social_two', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
