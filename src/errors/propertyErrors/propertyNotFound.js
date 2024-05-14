export default class PropertyNotFound extends Error {
  status = 404;

  constructor(message = 'Propriedade não cadastrada') {
    super(message);
  }
}
