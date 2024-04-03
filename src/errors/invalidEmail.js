export default class InvalidEmail extends Error {
  status = 400;

  constructor(message = 'O campo email é obrigatório e deve ser um email válido') {
    super(message);
  }
}
