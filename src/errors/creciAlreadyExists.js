export default class CreciAlreadyExists extends Error {
  status = 409;

  constructor(message = 'Já existe um cliente cadastrado com esse creci') {
    super(message);
  }
}
