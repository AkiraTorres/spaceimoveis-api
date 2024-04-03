export default class InvalidPhone extends Error {
  status = 400;

  constructor(message = 'O telefone está em um formato inválido, por favor, utilize o telefone com um formato brasileiro') {
    super(message);
  }
}
