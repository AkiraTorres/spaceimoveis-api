export default class RgAlreadyExists extends Error {
  status = 409;

  constructor(message = 'Já existe um cliente cadastrado com esse rg') {
    super(message);
  }
}
