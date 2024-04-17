export default class InvalidInteger extends Error {
  status = 400;

  constructor(message = 'O campo é obrigatório e deve ser um número inteiro válido') {
    super(message);
  }
}
