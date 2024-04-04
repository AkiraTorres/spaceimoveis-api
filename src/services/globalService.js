import * as clientService from './clientService.js';
import * as ownerService from './ownerService.js';

// eslint-disable-next-line import/prefer-default-export
export async function findAll() {
  try {
    const clients = await clientService.findAll(0);
    const owners = await ownerService.findAll(0);

    return { ...clients, ...owners };
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
