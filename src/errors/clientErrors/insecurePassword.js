export default class InsecurePassword extends Error {
  status = 400;

  constructor(message = 'A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial') {
    super(message);
  }
}
