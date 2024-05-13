'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn('realtors_ratings', 'sender_name', 'sender_email');
    await queryInterface.renameColumn('realstates_ratings', 'sender_name', 'sender_email');
  },

  async down(queryInterface) {
    await queryInterface.renameColumn('realtors_ratings', 'sender_email', 'sender_name');
    await queryInterface.renameColumn('realstates_ratings', 'sender_email', 'sender_name');
  },
};
