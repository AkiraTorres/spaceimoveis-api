'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('admins_pictures', 'createdAt', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    });

    await queryInterface.addColumn('admins_pictures', 'updatedAt', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('admins_pictures', 'createdAt');
    await queryInterface.removeColumn('admins_pictures', 'updatedAt');
  },
};
