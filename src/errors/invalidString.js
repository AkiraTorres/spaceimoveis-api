export default class InvalidString extends Error {
  status = 400;

  constructor(message = 'O campo é obrigatório') {
    super(message);
  }
}
