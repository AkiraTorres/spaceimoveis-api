'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('share_to_realstate', {
      id: {
        type: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      realstate_email: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'realstate',
          key: 'email',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      property_id: {
        type: Sequelize.UUIDV4,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('share_to_realstate');
  },
};
