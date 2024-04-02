export class EmailAlreadyExists extends Error {
  status = 409;
  constructor(message = 'Já existe um cliente cadastrado com esse email') {
    super(message);
  }
}

export class ClientNotFound extends Error {
  status = 404;
  constructor(message = 'Email não cadastrado') {
    super(message);
  }
}

export class InvalidEmail extends Error {
  status = 400;
  constructor(message = 'O campo email é obrigatório e deve ser um email válido') {
    super(message);
  }
}

export class InvalidName extends Error {
  status = 400;
  constructor(message = 'O campo nome é obrigatório') {
    super(message);
  }
}

export class InsecurePassword extends Error {
  status = 400;
  constructor(message = 'A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula, um número e um caractere especial') {
    super(message);
  }
}

export class InvalidPhone extends Error {
  status = 400;
  constructor(message = 'O telefone está em um formato inválido, por favor, utilize o telefone com um formato brasileiro') {
    super(message);
  }
}

export class NoClientsFound extends Error {
  status = 404;
  constructor(message = 'Nenhum cliente foi encontrado') {
    super(message);
  }
}