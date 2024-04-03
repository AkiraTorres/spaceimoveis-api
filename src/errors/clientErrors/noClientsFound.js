export default class NoClientsFound extends Error {
  status = 404;

  constructor(message = 'Nenhum cliente foi encontrado') {
    super(message);
  }
}
