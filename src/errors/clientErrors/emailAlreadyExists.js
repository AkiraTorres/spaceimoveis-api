export default class EmailAlreadyExists extends Error {
  status = 409;

  constructor(message = 'Já existe um cliente cadastrado com esse email') {
    super(message);
  }
}
