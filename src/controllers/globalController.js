import * as clientService from '../services/clientService.js';
import * as ownerService from '../services/ownerService.js';

export async function findAll(req, res) {
  try {
    const clients = await clientService.findAll(0);
    const owners = await ownerService.findAll(0);

    return res.send({ ...clients, ...owners });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
}

export async function find(req, res) {
  try {
    const { email } = req.params;

    if (email) {
      try {
        const client = await clientService.findByPk(email);
        if (client) {
          // const result = { client, type: 'client' };
          return res.send(client);
        }
      } catch (error) { /* empty */ }

      try {
        const owner = await ownerService.findByPk(email);
        if (owner) {
          // const result = { owner, type: 'owner' };
          return res.send(owner);
        }
      } catch (error) { /* empty */ }
    }

    return res.status(404).send({ message: 'Not Found' });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
}
