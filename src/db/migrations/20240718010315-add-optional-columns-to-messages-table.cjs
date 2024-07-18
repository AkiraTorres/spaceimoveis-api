'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('messages', 'is_read', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('messages', 'file', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('messages', 'file_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn()
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
