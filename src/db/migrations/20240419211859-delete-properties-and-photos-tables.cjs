'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable('photos');
    await queryInterface.dropTable('properties');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('properties', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'property',
      },
      owner_email: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: 'owners', key: 'email' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      realtor_email: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: 'realtors', key: 'email' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      realstate_email: {
        type: Sequelize.STRING,
        allowNull: true,
        references: { model: 'realstate', key: 'email' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      announcement_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      property_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      rent_price: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      sell_price: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      cep: {
        type: Sequelize.STRING(9),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      house_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING(2),
        allowNull: false,
      },
      district: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      complement: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      floor: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      bathrooms: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      bedrooms: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      parking_spaces: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      pool: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      grill: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      air_conditioning: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      playground: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      event_area: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      contact: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      financiable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    });

    await queryInterface.createTable('photos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      property_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id',
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
};
