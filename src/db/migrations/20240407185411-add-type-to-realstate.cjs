'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('realstates', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'realstate',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('realstates', 'type');
  },
};
