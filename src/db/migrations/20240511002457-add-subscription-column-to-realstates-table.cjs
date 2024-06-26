'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('realstates', 'subscription', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'free',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('realstates', 'subscription');
  },
};
