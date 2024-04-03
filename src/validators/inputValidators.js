import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import validator from 'validator';

import InvalidEmail from '../errors/invalidEmail.js';
import InvalidName from '../errors/invalidName.js';
import InsecurePassword from '../errors/insecurePassword.js';
import InvalidPhone from '../errors/invalidPhone.js';

dotenv.config();
const salt = process.env.CRYPT_SALT;

function validateEmail(email) {
  const sanitizedEmail = validator.escape(email);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitizedEmail)) throw new InvalidEmail();

  return sanitizedEmail;
}

function validateName(name) {
  const sanitizedName = validator.escape(name);

  if (sanitizedName.length === 0 || sanitizedName === '' || sanitizedName === undefined) {
    throw new InvalidName();
  }

  return sanitizedName;
}

function validatePassword(password) {
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

function validatePhone(phone) {
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

export { validateEmail, validateName, validatePassword, validatePhone };
