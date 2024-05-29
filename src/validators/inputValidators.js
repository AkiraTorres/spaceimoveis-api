import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import validator from 'validator';

import Client from '../db/models/Client.js';
import Owner from '../db/models/Owner.js';
import Realstate from '../db/models/Realstate.js';
import Realtor from '../db/models/Realtor.js';
import CnpjAlreadyExists from '../errors/cnpjAlreadyExists.js';
import CpfAlreadyExists from '../errors/cpfAlreadyExists.js';
import CreciAlreadyExists from '../errors/creciAlreadyExists.js';
import EmailAlreadyExists from '../errors/emailAlreadyExists.js';
import InsecurePassword from '../errors/insecurePassword.js';
import InvalidCpf from '../errors/invalidCpf.js';
import InvalidEmail from '../errors/invalidEmail.js';
import InvalidInteger from '../errors/invalidInteger.js';
import InvalidPhone from '../errors/invalidPhone.js';
import InvalidString from '../errors/invalidString.js';
import RgAlreadyExists from '../errors/rgAlreadyExists.js';

dotenv.config();
const salt = process.env.CRYPT_SALT;

export function validateEmail(email) {
  const sanitizedEmail = validator.escape(email);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitizedEmail)) throw new InvalidEmail();

  return sanitizedEmail;
}

export async function validateIfUniqueEmail(email) {
  if (
    await Client.findByPk(email)
    || await Owner.findByPk(email)
    || await Realtor.findByPk(email)
    || await Realstate.findByPk(email)) {
    throw new EmailAlreadyExists();
  }
}

export function validateString(string, msg = '') {
  if (string === undefined || string === '') throw new InvalidString(msg || 'O campo é obrigatório');

  const sanitizedString = validator.escape(string);

  if (sanitizedString.length === 0 || sanitizedString === '' || sanitizedString === undefined) {
    if (msg !== '') {
      throw new InvalidString(msg);
    }
    throw new InvalidString();
  }

  return sanitizedString;
}

export function validateInteger(integer, msg = '') {
  const int = typeof integer === 'string' ? integer.replace(/\./g, '') : integer;

  const sanitizedInteger = parseInt(int, 10);

  if (sanitizedInteger === undefined || !Number.isInteger(sanitizedInteger)) {
    if (msg !== '') {
      throw new InvalidInteger(msg);
    }
    throw new InvalidInteger();
  }

  return sanitizedInteger;
}

export function validatePrice(p, msg = '') {
  const price = typeof p === 'string' ? p.replace(/\./g, '') : p;

  const sanitizedPrice = parseInt(price, 10);

  if (!sanitizedPrice || !Number.isInteger(sanitizedPrice)) {
    if (msg !== '') {
      throw new InvalidInteger(msg);
    }
    throw new InvalidInteger();
  }

  return sanitizedPrice;
}

export function validateBoolean(bool, msg = '') {
  if (bool === false || bool === true) return bool;

  const sanitizedBool = validator.escape(bool);

  if (sanitizedBool === 'true') return true;
  if (sanitizedBool === 'false') return false;

  if (msg !== '') {
    throw new InvalidString(msg);
  }
  throw new InvalidString();
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

export async function validateIfUniqueCpf(cpf) {
  if (
    await Owner.findOne({ where: { cpf } })
    || await Realtor.findOne({ where: { cpf } })) {
    throw new CpfAlreadyExists();
  }
}

export async function validateIfUniqueRg(rg) {
  if (
    await Owner.findOne({ where: { rg } })
    || await Realtor.findOne({ where: { rg } })) {
    throw new RgAlreadyExists();
  }
}

export function validateCnpj(cnpj) {
  const validatedCnpj = validator.escape(cnpj).replace(/\D/g, '');

  const error = new Error('CNPJ Inválido');
  error.status = 400;

  if (validatedCnpj.length !== 14) throw error;

  if (/^(\d)\1{13}$/.test(validatedCnpj)) throw error;

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
  if (parseInt(validatedCnpj.charAt(12), 10) !== result) throw error;

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
  if (parseInt(validatedCnpj.charAt(13), 10) !== result) throw error;

  return validatedCnpj;
}

export async function validateIfUniqueCnpj(cnpj) {
  if (await Realstate.findOne({ where: { cnpj } })) {
    throw new CnpjAlreadyExists();
  }
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

  const creciRegex = /^(CRECI-)?([A-Z]{2}|)\s?\d{1,15}$/;

  if (!creciRegex.test(sanitizedCreci)) {
    throw new InvalidString('CRECI inválido');
  }

  return sanitizedCreci;
}

export async function validateIfUniqueCreci(creci) {
  if (
    await Realtor.findOne({ where: { creci } })
    || await Realstate.findOne({ where: { creci } })) {
    throw new CreciAlreadyExists();
  }
}

export async function validateFurnished(furnished) {
  const sanitizedFurnished = validator.escape(furnished);

  if (sanitizedFurnished === 'not-furnished' || sanitizedFurnished === 'semi-furnished' || sanitizedFurnished === 'furnished') return sanitizedFurnished;

  throw new InvalidString('Campo mobiliado inválido');
}
