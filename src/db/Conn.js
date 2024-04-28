import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

import { development, test, production } from './config/config.js';

dotenv.config();

let sequelizeConfig;
if (process.env.NODE_ENV === 'development') sequelizeConfig = development;
else if (process.env.NODE_ENV === 'test') sequelizeConfig = test;
else if (process.env.NODE_ENV === 'production') sequelizeConfig = production;

const sequelize = new Sequelize(sequelizeConfig);

async function connection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.log('Unable to connect to the database: ', error);
  }
}

export { connection, sequelize, DataTypes, Sequelize };
