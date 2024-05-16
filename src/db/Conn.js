/* eslint-disable no-console */
import dotenv from 'dotenv';
import { DataTypes, Sequelize } from 'sequelize';

import config from './config/config.js';

dotenv.config();

let sequelizeConfig;
if (process.env.NODE_ENV === 'development') sequelizeConfig = config.development;
else if (process.env.NODE_ENV === 'test') sequelizeConfig = config.test;
else if (process.env.NODE_ENV === 'production') { sequelizeConfig = config.production; }

const sequelize = new Sequelize(sequelizeConfig);

async function connection() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.log('Unable to connect to the database: ', error);
  }
}

export { DataTypes, Sequelize, connection, sequelize };
