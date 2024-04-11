import * as globalService from '../services/globalService.js';

export async function findAll(req, res) {
  try {
    const result = await globalService.findAll();

    return res.send(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
}

export async function find(req, res) {
  try {
    const { email } = req.params;

    const user = await globalService.find(email);

    return res.json(user);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
}

export async function changePassword(req, res) {
  try {
    const { email, password } = req.body;

    const result = await globalService.changePassword(email, password);

    return res.json(result);
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({ message: error.message });
  }
}
