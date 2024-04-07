export default class CnpjAlreadyExists extends Error {
  status = 409;

  constructor(message = 'Já existe um cliente cadastrado com esse cnpj') {
    super(message);
  }
}
