export default class OwnerNotFound extends Error {
  status = 404;

  constructor(message = 'Email não cadastrado') {
    super(message);
  }
}
