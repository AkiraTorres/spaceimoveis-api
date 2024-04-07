export default class NoRealstatesFound extends Error {
  status = 404;

  constructor(message = 'Nenhuma imobiliária foi encontrada') {
    super(message);
  }
}
