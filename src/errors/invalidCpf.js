export default class InvalidCpf extends Error {
  status = 400;

  constructor(message = 'O cpf é obrigatório e deve ser um cpf válido') {
    super(message);
  }
}
