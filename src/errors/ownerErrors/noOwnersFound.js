export default class NoOwnersFound extends Error {
  status = 404;

  constructor(message = 'Nenhum proprietário foi encontrado') {
    super(message);
  }
}
