export default class CpfAlreadyExists extends Error {
  status = 409;

  constructor(message = 'Já existe um cliente cadastrado com esse cpf') {
    super(message);
  }
}
