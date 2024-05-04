'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('photos', 'url', {
      type: Sequelize.STRING(2048),
      allowNull: false,
    });

    await queryInterface.changeColumn('owners_pictures', 'url', {
      type: Sequelize.STRING(2048),
      allowNull: false,
    });

    await queryInterface.changeColumn('realtors_pictures', 'url', {
      type: Sequelize.STRING(2048),
      allowNull: false,
    });

    await queryInterface.changeColumn('realstates_pictures', 'url', {
      type: Sequelize.STRING(2048),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('photos', 'url', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });

    await queryInterface.changeColumn('owners_pictures', 'url', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });

    await queryInterface.changeColumn('realtors_pictures', 'url', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });

    await queryInterface.changeColumn('realstates_pictures', 'url', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },
};
