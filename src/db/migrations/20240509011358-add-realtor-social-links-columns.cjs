'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('realtors', 'social_one', {
      type: Sequelize.STRING(512),
      allowNull: true,
    });

    await queryInterface.addColumn('realtors', 'social_two', {
      type: Sequelize.STRING(512),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('realtors', 'social_one');
    await queryInterface.removeColumn('realtors', 'social_two');
  },
};
