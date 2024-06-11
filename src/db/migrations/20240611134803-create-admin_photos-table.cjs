'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('admins_pictures', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        autoIncrement: false,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'admins',
          key: 'email',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('admins_pictures');
  },
};
