import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import validator from 'validator';

import InvalidEmail from '../errors/invalidEmail.js';
import InvalidString from '../errors/invalidString.js';
import InsecurePassword from '../errors/insecurePassword.js';
import InvalidPhone from '../errors/invalidPhone.js';
import InvalidCpf from '../errors/invalidCpf.js';

dotenv.config();
const salt = process.env.CRYPT_SALT;

export function validateEmail(email) {
  const sanitizedEmail = validator.escape(email);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitizedEmail)) throw new InvalidEmail();

  return sanitizedEmail;
}

export function validateString(string, msg = '') {
  const sanitizedString = validator.escape(string);

  if (sanitizedString.length === 0 || sanitizedString === '' || sanitizedString === undefined) {
    if (msg !== '') {
      throw new InvalidString(msg);
    }
    throw new InvalidString();
  }

  return sanitizedString;
}

export function validatePassword(password) {
  const sanitizedPassword = validator.escape(password);

  if (sanitizedPassword.length === 0 || sanitizedPassword === '' || sanitizedPassword === undefined) {
    throw new InsecurePassword('O campo senha é obrigatório');
  }

  const sanitizedPasswordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[0-9a-zA-Z!@#$%^&*()_+]{8,}$/;

  if (!sanitizedPasswordRegex.test(sanitizedPassword)) {
    throw new InsecurePassword();
  }

  return bcrypt.hashSync(sanitizedPassword, salt);
}

export function validatePhone(phone) {
  const sanitizedPhone = validator.escape(phone);

  if (sanitizedPhone.length === 0 || sanitizedPhone === '' || sanitizedPhone === undefined) {
    throw new InvalidPhone('O campo telefone é obrigatório');
  }

  const brazilianPhoneNumberRegex = /^(?:\+|00)?(?:55)?(?:\s|-|\.)?(?:(?:\(?\d{2}\)?)(?:\s|-|\.)?)?(?:9\d{4}|\d{4})[-. ]?\d{4}$/;

  if (!brazilianPhoneNumberRegex.test(sanitizedPhone)) {
    throw new InvalidPhone();
  }

  return sanitizedPhone;
}

export function validateCpf(cpf) {
  const validatedCpf = cpf.replace(/[^\d]+/g, '');

  if (validatedCpf.length !== 11 || /^(\d)\1{10}$/.test(validatedCpf)) throw new InvalidCpf();

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) sum += parseInt(validatedCpf.substring(i - 1, i), 10) * (11 - i);
  remainder = (sum * 10) % 11;

  if ((remainder === 10) || (remainder === 11)) remainder = 0;

  if (remainder !== parseInt(validatedCpf.substring(9, 10), 10)) throw new InvalidCpf();

  sum = 0;

  for (let i = 1; i <= 10; i++) sum += parseInt(validatedCpf.substring(i - 1, i), 10) * (12 - i);
  remainder = (sum * 10) % 11;

  if ((remainder === 10) || (remainder === 11)) remainder = 0;

  if (remainder !== parseInt(validatedCpf.substring(10, 11), 10)) throw new InvalidCpf();

  return validatedCpf; // valid
}

export function validateCep(cep) {
  const sanitizedCep = validator.escape(cep);

  if (sanitizedCep.length === 0 || sanitizedCep === '' || sanitizedCep === undefined) {
    throw new InvalidString('O campo CEP é obrigatório');
  }

  const brazilianCepRegex = /^\d{5}-?\d{3}$/;

  if (!brazilianCepRegex.test(sanitizedCep)) {
    throw new InvalidString('CEP inválido');
  }

  return sanitizedCep;
}

export function validateUF(uf) {
  if (uf.length === 0 || uf === '' || uf === undefined) {
    throw new InvalidString('O campo estado é obrigatório');
  }

  const sanitizedUf = validator.escape(uf.toUpperCase().trim());

  const validUfs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO',
  ];

  if (!validUfs.includes(sanitizedUf)) {
    throw new InvalidString('Estado inválido');
  }

  return sanitizedUf;
}

export function validateCreci(creci) {
  const sanitizedCreci = validator.escape(creci);

  const creciRegex = /^CRECI-[A-Z]{2}\s?\d{5}$/;

  if (!creciRegex.test(sanitizedCreci)) {
    throw new InvalidString('CRECI inválido');
  }

  return sanitizedCreci;
}