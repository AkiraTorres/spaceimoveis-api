export default class RealtorNotFound extends Error {
  status = 404;

  constructor(message = 'Email não cadastrado') {
    super(message);
  }
}
