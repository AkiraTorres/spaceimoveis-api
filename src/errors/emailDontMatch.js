export default class emailDontMatch extends Error {
  status = 401;

  constructor(message = 'O email enviado não corresponde ao email autenticado') {
    super(message);
  }
}
