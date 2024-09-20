import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';

import firebaseConfig from '../config/firebase.js';
import prisma, { excludeFromObject } from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateBoolean, validateCnpj, validateCpf, validateCreci, validateEmail, validatePassword, validatePhone, validateString, validateUF, validateUserType } from '../validators/inputValidators.js';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default class UserService {
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.storage = getStorage(this.app);
  }

  static async userDetails(user) {
    const editedUser = user;

    editedUser.info = await prisma.userInfo.findUnique({ where: { email: user.email } });
    editedUser.address = await prisma.userAddress.findUnique({ where: { email: user.email } });
    editedUser.profile = await prisma.userPhoto.findUnique({ where: { email: user.email } });
    editedUser.favorites = await prisma.favorite.findMany({ where: { userEmail: user.email } });
    editedUser.followers = await prisma.follower.findMany({ where: { followedEmail: user.email } });
    editedUser.follow = await prisma.follower.findMany({ where: { followerEmail: user.email } });

    return excludeFromObject(editedUser, ['otp', 'otp_ttl', 'password']);
  }

  static async find(params, type = null) {
    const where = { active: true };

    if (!params.email && !params.cpf && !params.creci) throw new ConfigurableError('Deve ser fornecido email, cpf ou creci', 422);
    if (params.email) where.email = validateEmail(params.email);
    if (params.cpf) where.cpf = validateCpf(params.cpf);
    if (params.creci) where.creci = validateString(params.creci);
    if (type) where.type = validateUserType(type, "O campo 'tipo' é obrigatório");

    let user = null;

    user = await prisma.user.findUnique({ where });

    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    return this.userDetails(user);
  }

  static async findAll(page = 1, type = null, active = true) {
    const where = { active: validateBoolean(active) };

    if (page < 1 || !type) {
      const users = prisma.user.findMany({ where, orderBy: { name: 'asc' } });
      if (users.length === 0) throw new ConfigurableError(`Não existe nenhum ${type} cadastrado.`, 404);

      return Promise.all(users.map(async (user) => this.userDetails(user)));
    }

    const limit = 6;
    const total = await prisma.user.count({ where });
    where.type = validateUserType(type, "O campo 'tipo' é obrigatório");

    if (total === 0) throw new ConfigurableError(`Não existe nenhum ${type} cadastrado.`, 404);

    const lastPage = Math.ceil(total / limit);
    const offset = Number(limit * (page - 1));

    const users = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
      skip: offset,
    });

    if (users.length === 0) throw new ConfigurableError(`Não existe nenhum ${type} cadastrado.`, 404);

    const result = await Promise.all(users.map(async (user) => this.userDetails(user)));

    const pagination = {
      path: `/${type}`,
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    return { users: result, pagination };
  }

  static async create(params, photo) {
    const newUser = {
      email: validateEmail(params.email, "O campo 'email' é obrigatório"),
      name: validateString(params.name, "O campo 'nome' é obrigatório"),
      handler: validateString((params.email).split('@')[0], "O campo 'apelido' é obrigatório"),
      password: validatePassword(params.password, "O campo 'senha' é obrigatório"),
      type: validateUserType(params.type, "O campo 'tipo' é obrigatório"),
    };

    const newInfo = {
      email: newUser.email,
      cpf: params.type !== 'client' && params.cpf ? validateCpf(params.cpf, "O campo 'cpf' é obrigatório") : null,
      cnpj: params.cnpj && newUser.type === 'realstate' ? validateCnpj(params.cnpj, "O campo 'cnpj' é obrigatório") : null,
      rg: params.rg ? validateString(params.rg) : null,
      creci: params.creci && newUser.type in ['realtor', 'realstate'] ? validateString(params.creci, "O campo 'creci' é obrigatório") : null,
      phone: params.phone ? validatePhone(params.phone) : null,
      idPhone: params.idPhone ? validateString(params.idPhone) : null,
      bio: params.bio ? validateString(params.bio) : null,
      subscription: newUser.type !== 'admin' ? 'free' : null,
    };

    const newAddress = {
      email: newUser.email,
      street: params.street ? validateString(params.street) : null,
      cep: params.cep ? validateString(params.cep) : null,
      number: params.number ? validateString(params.number) : null,
      complement: params.complement ? validateString(params.complement) : null,
      neighborhood: params.neighborhood ? validateString(params.neighborhood) : null,
      city: params.city ? validateString(params.city) : null,
      state: params.state ? validateUF(params.state) : null,
    };

    const user = await prisma.user.create({ data: newUser });
    const info = await prisma.userInfo.create({ data: newInfo });
    const address = await prisma.userAddress.create({ data: newAddress });

    let profile = null;
    if (photo) {
      const storageRef = ref(this.storage, `images/${user.type}s/${user.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      profile = await prisma.userPhoto.create({
        data: {
          id: uuid(),
          email: user.email,
          url: downloadUrl,
          name: photo.originalname,
          type: 'profile',
        },
      });
    }

    return { ...user, info, address, profile };
  }

  async update(email, params, photo) {
    const validatedEmail = validateEmail(email);

    if ((!params && !photo) || (Object.keys(params).length === 0 && !photo)) throw new ConfigurableError('Nenhum dado foi fornecido', 422);

    const oldUser = await this.find({ email: validateEmail });
    if (!oldUser) throw new ConfigurableError('Usuário não encontrado', 404);

    let user = oldUser;
    let { info } = oldUser;
    let { address } = oldUser;

    if (params) {
      const updatedData = {
        email: params.email ? validateEmail(params.email) : oldUser.email,
        name: params.name ? validateString(params.name, 'O campo nome é obrigatório') : oldUser.name,
        handler: params.email ? validateString((params.email).split('@')[0]) : oldUser.handler,
      };
      user = await prisma.user.update({ where: { email: validatedEmail }, data: updatedData });

      if (params.info) {
        const updatedInfo = {
          cpf: params.info.cpf ? validateCpf(params.info.cpf) : oldUser.cpf,
          cnpj: params.info.cnpj ? validateCnpj(params.info.cnpj) : oldUser.cnpj,
          rg: params.info.rg ? validateString(params.info.rg) : oldUser.rg,
          creci: params.info.creci ? validateCreci(params.info.creci) : oldUser.creci,
          phone: params.info.phone ? validatePhone(params.info.phone) : oldUser.phone,
          idPhone: params.info.idPhone ? validateString(params.info.idPhone) : oldUser.idPhone,
          bio: params.info.bio ? validateString(params.info.bio) : oldUser.bio,
        };
        info = await prisma.userInfo.update({ where: { email: validatedEmail }, data: updatedInfo });
      }

      if (params.address) {
        const updatedAddress = {
          street: params.address.street ? validateString(params.address.street) : oldUser.street,
          cep: params.address.cep ? validateString(params.address.cep) : oldUser.cep,
          number: params.address.number ? validateString(params.address.number) : oldUser.number,
          complement: params.address.complement ? validateString(params.address.complement) : oldUser.complement,
          neighborhood: params.address.neighborhood ? validateString(params.address.neighborhood) : oldUser.neighborhood,
          city: params.address.city ? validateString(params.address.city) : oldUser.city,
          state: params.address.state ? validateUF(params.address.state) : oldUser.state,
        };
        address = await prisma.userAddress.update({ where: { email: validatedEmail }, data: updatedAddress });
      }
    }

    let profile = await prisma.userPhoto.findUnique({ where: { email: user.email } });
    if (photo) {
      if (profile) {
        const storageRef = ref(this.storage, `images/admins/${user.email}/${profile.name}`);
        await prisma.userPhoto.delete({ where: { email: user.email } });
        await deleteObject(storageRef);
      }

      const storageRef = ref(this.storage, `images/admins/${user.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      profile = await prisma.userPhoto.create({
        data: {
          id: uuid(),
          email: user.email,
          url: downloadUrl,
          name: photo.originalname,
          type: 'profile',
        },
      });
    }

    return { ...user, info, address, profile };
  }

  static async destroy(email) {
    const validatedEmail = validateEmail(email);

    const user = await prisma.user.findUnique({ where: { email: validatedEmail, active: true } });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    await prisma.user.update({ where: { email: validatedEmail }, data: { active: false, deletedAt: new Date() } });
    return { message: 'Usuário apagado com sucesso' };
  }

  static async changePassword(email, newPassword) {
    const validatedEmail = validateEmail(email);

    const user = await this.find(validatedEmail);
    if (!user) throw new Error('Email não encontrado');

    const validatedPassword = validatePassword(newPassword);
    if (user.password === validatedPassword) throw new ConfigurableError('A nova senha não pode ser igual à antiga', 422);

    user.password = validatedPassword;
    const result = await prisma.user.update({ where: { email: validatedEmail }, data: { password: validatedPassword } });
    if (result === undefined) throw new ConfigurableError('Erro ao atualizar a senha', 500);

    return this.userDetails(user);
  }

  static async rescuePassword(email) {
    const receiverEmail = validateEmail(email);

    const user = await this.find(receiverEmail);
    if (!user) return { message: 'Usuário não encontrado.' };

    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpTTL = new Date();
    otpTTL.setMinutes(otpTTL.getMinutes() + 6);

    await prisma.user.update({ where: { email: receiverEmail }, data: { otp: otp.toString(), otpTTL } });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: receiverEmail,
      subject: 'Redefinição de Senha',
      text: `Seu código para redefinição de senha é ${otp} e ele irá se espirar em 6 minutos`,
    };

    let response = 'Foi enviado um email para recuperar sua senha';

    sgMail
      .send(mailOptions)
      .catch(() => { response = 'Ocorreu um erro ao enviar o email, tente novamente mais tarde.'; });

    return { message: response };
  }

  static async resetPassword(email, password, otp) {
    const validatedEmail = validateEmail(email);
    const user = await this.find(validatedEmail, true, true);

    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    if (user.otp === otp && user.otp_ttl > new Date()) {
      return this.changePassword(email, password);
    }

    throw new ConfigurableError('Código de verificação inválido ou expirado', 422);
  }

  static async contact({ name, email, message, type }) {
    const newData = {
      id: uuid(),
      user_name: validateString(name, 'O campo nome é obrigatório'),
      user_email: validateEmail(email, 'O campo email é obrigatório'),
      user_type: type ? validateString(type) : null,
      message: validateString(message, 'O campo mensagem é obrigatório'),
    };
    await prisma.userMessages.create(newData);

    return { message: 'Mensagem enviada com sucesso!' };
  }
}
