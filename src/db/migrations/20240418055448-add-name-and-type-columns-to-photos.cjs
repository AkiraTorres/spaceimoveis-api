'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('photos', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('photos', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('photos', 'name');
    await queryInterface.removeColumn('photos', 'type');
  },
};
