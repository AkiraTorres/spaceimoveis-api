import * as clientService from './clientService.js';
import * as ownerService from './ownerService.js';
import * as realtorService from './realtorService.js';
import * as realstateService from './realstateService.js';

import { validateEmail, validatePassword } from '../validators/inputValidators.js';

// eslint-disable-next-line import/prefer-default-export
export async function findAll() {
  try {
    const clients = await clientService.findAll(0);
    const owners = await ownerService.findAll(0);
    const realtors = await realtorService.findAll(0);
    const realstate = await realstateService.findAll(0);

    return { ...clients, ...owners, ...realtors, ...realstate };
  } catch (error) {
    error.status = error.status || 500;
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    throw error;
  }
}

export async function find(email, pass = false) {
  try {
    if (email) {
      try {
        const client = await clientService.findByPk(email, pass);
        if (client) {
          return client;
        }
      } catch (error) { /* empty */ }

      try {
        const owner = await ownerService.findByPk(email, pass);
        if (owner) {
          return owner;
        }
      } catch (error) { /* empty */ }

      try {
        const realtor = await realtorService.findByPk(email, pass);
        if (realtor) {
          return realtor;
        }
      } catch (error) { /* empty */ }

      try {
        const realstate = await realstateService.findByPk(email, pass);
        if (realstate) {
          return realstate;
        }
      } catch (error) { /* empty */ }
    }

    const error = new Error('Email não encontrado');
    error.status = 404;
    throw error;
  } catch (error) {
    error.status = error.status || 500;
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    throw error;
  }
}

export async function changePassword(email, newPassword) {
  try {
    const validatedEmail = validateEmail(email);

    const user = await find(validatedEmail, true);
    if (!user) throw new Error('Email não encontrado');

    const validatedPassword = validatePassword(newPassword);

    user.password = validatedPassword;
    await user.save();
    return user;
  } catch (error) {
    error.status = error.status || 500;
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    throw error;
  }
}
