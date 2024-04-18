export default class NoPropertyFound extends Error {
  status = 404;

  constructor(message = 'Nenhuma propriedade foi encontrada') {
    super(message);
  }
}
