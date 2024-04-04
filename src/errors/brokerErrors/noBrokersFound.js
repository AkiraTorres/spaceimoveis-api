export default class NoBrokersFound extends Error {
  status = 404;

  constructor(message = 'Nenhum corretor foi encontrado') {
    super(message);
  }
}
