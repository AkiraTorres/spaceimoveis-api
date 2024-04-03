export default class InvalidName extends Error {
  status = 400;

  constructor(message = 'O campo nome é obrigatório') {
    super(message);
  }
}
