import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import validator from 'validator';

import ConfigurableError from '../errors/ConfigurableError.js';

dotenv.config();
const salt = process.env.CRYPT_SALT;

export function validateEmail(email) {
  if (email === null || email === undefined) throw new ConfigurableError('O campo email é obrigatório', 422);
  if (!validator.isEmail(email)) throw new ConfigurableError('Email inválido', 422);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) throw new ConfigurableError('Email inválido', 422);

  return email.trim().toLowerCase();
}

export function validateString(string, msg = 'O campo é obrigatório') {
  if (typeof string !== 'string' || string.trim().length === 0) throw new ConfigurableError(msg, 422);

  const trimmedStr = string.trim();

  if (trimmedStr.length === 0 || !/[^\s]/.test(trimmedStr)) throw new ConfigurableError(msg, 422);

  return trimmedStr;
}

export function validateInteger(integer, msg = 'O campo é obrigatório e deve ser um número inteiro') {
  if (integer === null || integer === undefined) throw new ConfigurableError(msg, 422);
  const int = typeof integer === 'string' ? integer.replace(/\./g, '') : integer;

  const sanitizedInteger = parseInt(int, 10);

  if (sanitizedInteger === undefined || !Number.isInteger(sanitizedInteger)) {
    throw new ConfigurableError(msg, 422);
  }

  return sanitizedInteger;
}

export function validatePrice(p, msg = "O campo 'preço' é obrigatório e deve ser um número") {
  if (p === null || p === undefined) throw new ConfigurableError(msg, 422);
  const price = typeof p === 'string' ? p.replace(/\./g, '') : p;
  const sanitizedPrice = parseInt(price, 10);

  if (!sanitizedPrice || !Number.isInteger(sanitizedPrice)) {
    throw new ConfigurableError(msg, 422);
  }

  return sanitizedPrice;
}

export function validateFloat(float, msg = 'O campo é obrigatório e deve ser um número') {
  if (float === null || float === undefined) throw new ConfigurableError(msg, 422);
  const sanitizedFloat = parseFloat(float);

  if (sanitizedFloat === undefined || Number.isNaN(sanitizedFloat)) {
    throw new ConfigurableError(msg, 422);
  }

  return sanitizedFloat;
}

export function validateBoolean(bool, msg = 'O campo é obrigatório') {
  if (bool === null) throw new ConfigurableError(msg, 422);
  if (bool === false || bool === true) return bool;

  const sanitizedBool = validator.escape(bool);

  if (sanitizedBool in ['True', 'true']) return true;
  if (sanitizedBool in ['False', 'false']) return false;

  throw new ConfigurableError('O campo deve ser uma condicional válida (True/False)', 400);
}

export function validatePassword(password) {
  if (password === null || password === undefined) throw new ConfigurableError('O campo senha é obrigatório', 422);

  const trimmedPassword = password.trim();

  if (trimmedPassword.length === 0) throw new ConfigurableError('O campo senha é obrigatório', 422);

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[0-9a-zA-Z!@#$%^&*()_+]{8,}$/;

  if (!passwordRegex.test(trimmedPassword)) {
    throw new ConfigurableError(`A senha é muito fraca. Ela deve conter pelo menos 8 caracteres, incluindo ao menos um
                            dígito, uma letra minúscula, uma letra maiúscula e um caractere especial (!@#$%^&*()_+)`, 400);
  }

  return bcrypt.hashSync(trimmedPassword, salt);
}

export function validatePhone(phone) {
  if (phone === null || phone === undefined) throw new ConfigurableError('O campo telefone é obrigatório', 422);

  const trimmedPhone = phone.trim();

  if (trimmedPhone.length === 0 || trimmedPhone === undefined) throw new ConfigurableError('O campo telefone é obrigatório', 422);

  const brazilianPhoneNumberRegex = /^(?:\+|00)?(?:55)?(?:\s|-|\.)?(?:(?:\(?\d{2}\)?)(?:\s|-|\.)?)?(?:9\d{4}|\d{4})[-. ]?\d{4}$/;

  if (!brazilianPhoneNumberRegex.test(trimmedPhone)) throw new ConfigurableError('O telefone informado é inválido', 400);

  return trimmedPhone;
}

export function validateCpf(cpf) {
  if (cpf === null || cpf === undefined) throw new ConfigurableError('O campo CPF é obrigatório', 422);
  const validatedCpf = cpf.replace(/[^\d]+/g, '');

  if (validatedCpf.length !== 11 || /^(\d)\1{10}$/.test(validatedCpf)) throw new ConfigurableError('CPF inválido', 400);

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) sum += parseInt(validatedCpf.substring(i - 1, i), 10) * (11 - i);
  remainder = (sum * 10) % 11;

  if ((remainder === 10) || (remainder === 11)) remainder = 0;

  if (remainder !== parseInt(validatedCpf.substring(9, 10), 10)) throw new ConfigurableError('CPF inválido', 400);

  sum = 0;

  for (let i = 1; i <= 10; i++) sum += parseInt(validatedCpf.substring(i - 1, i), 10) * (12 - i);
  remainder = (sum * 10) % 11;

  if ((remainder === 10) || (remainder === 11)) remainder = 0;

  if (remainder !== parseInt(validatedCpf.substring(10, 11), 10)) throw new ConfigurableError('CPF inválido', 400);

  return validatedCpf;
}

export function validateCnpj(cnpj) {
  if (cnpj === null || cnpj === undefined) throw new ConfigurableError('O campo CNPJ é obrigatório', 422);
  const validatedCnpj = validator.escape(cnpj).replace(/\D/g, '');

  if (validatedCnpj.length !== 14) throw new ConfigurableError('CNPJ Inválido', 400);

  if (/^(\d)\1{13}$/.test(validatedCnpj)) throw new ConfigurableError('CNPJ Inválido', 400);

  let sum = 0;
  let position = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(validatedCnpj.charAt(i), 10) * position;
    position--;
    if (position < 2) {
      position = 9;
    }
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(validatedCnpj.charAt(12), 10) !== result) throw new ConfigurableError('CNPJ Inválido', 400);

  sum = 0;
  position = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(validatedCnpj.charAt(i), 10) * position;
    position--;
    if (position < 2) {
      position = 9;
    }
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (parseInt(validatedCnpj.charAt(13), 10) !== result) throw new ConfigurableError('CNPJ Inválido', 400);

  return validatedCnpj;
}

export function validateCep(cep) {
  if (cep === null || cep === undefined) throw new ConfigurableError('O campo CEP é obrigatório', 422);
  const sanitizedCep = validator.escape(cep);

  if (sanitizedCep.length === 0 || sanitizedCep === '' || sanitizedCep === undefined) {
    throw new ConfigurableError('O campo CEP é obrigatório', 422);
  }

  const brazilianCepRegex = /^\d{5}-?\d{3}$/;

  if (!brazilianCepRegex.test(sanitizedCep)) {
    throw new ConfigurableError('CEP inválido', 400);
  }

  return sanitizedCep;
}

export function validateUF(uf) {
  if (uf.length === 0 || uf === '' || uf === undefined) {
    throw new ConfigurableError('O campo estado é obrigatório', 422);
  }

  const sanitizedUf = validator.escape(uf.toUpperCase().trim());

  const validUfs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO',
  ];

  if (!validUfs.includes(sanitizedUf)) {
    throw new ConfigurableError('Estado inválido', 400);
  }

  return sanitizedUf;
}

export function validateCreci(creci, isRealstate = false) {
  if (creci === null || creci === undefined) throw new ConfigurableError('O campo CRECI é obrigatório', 422);
  const sanitizedCreci = validator.escape(creci);

  const creciRegex = isRealstate ? /^(CRECI-)?([A-Z]{2}\s?J\d{1,15}|J\d{1,15}\s?[A-Z]{2})$/ : /^(CRECI-)?([A-Z]{2}\s?\d{1,15}|\d{1,15}\s?[A-Z]{2})$/;

  if (!creciRegex.test(sanitizedCreci)) {
    throw new ConfigurableError('CRECI inválido', 400);
  }

  return sanitizedCreci;
}

export function validateFurnished(furnished, msg = "O campo 'mobiliado' é obrigatório'") {
  if (furnished === null || furnished === undefined) throw new ConfigurableError(msg, 422);

  if (furnished === 'yes' || furnished === 'no' || furnished === 'partial') return furnished;

  throw new ConfigurableError('O campo mobiliado deve ser um valor válido (yes/no/partial)', 400);
}

export function validateUserType(type) {
  if (type === null || type === undefined) throw new ConfigurableError("O campo 'tipo' é obrigatório", 422);

  if (type === 'client' || type === 'owner' || type === 'realtor' || type === 'realstate' || type === 'admin') return type;

  throw new ConfigurableError('Tipo de usuário inválido deve possuir um valor válido (client/owner/realtor/realstate/admin)', 400);
}

export function validateAnnouncementType(type) {
  if (type === null || type === undefined) throw new ConfigurableError("O campo 'tipo' é obrigatório", 422);

  if (type === 'rent' || type === 'sell' || type === 'both') return type;

  throw new ConfigurableError('Tipo de anúncio inválido deve possuir um valor válido (rent/sell/both)', 400);
}

export function validatePropertyType(type) {
  if (type === null || type === undefined) throw new ConfigurableError("O campo 'tipo' é obrigatório", 422);

  if (type === 'house' || type === 'apartment' || type === 'land' || type === 'farm') return type;

  throw new ConfigurableError('Tipo de propriedade inválido deve possuir um valor válido (house/apartment/land/farm)', 400);
}

export function validateMessageType(type) {
  if (type === null || type === undefined) throw new ConfigurableError("O campo 'tipo' é obrigatório", 422);

  if (type === 'text' || type === 'image' || type === 'audio' || type === 'video' || type === 'file') return type;

  throw new ConfigurableError('Tipo de mensagem inválido deve possuir um valor válido (text/image/audio/video/file)', 400);
}
