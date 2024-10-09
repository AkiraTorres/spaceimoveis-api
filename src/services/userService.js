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

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

const generateUniqueHandler = async (handler) => {
  const user = await prisma.user.findFirst({ where: { handler } });
  if (!user) {
    return handler;
  }
  const random = Math.floor(1000 + Math.random() * 9000);
  return generateUniqueHandler(`${handler}${random}`);
};

export default class UserService {
  static async userDetails(userEmail) {
    const user = await prisma.user.findFirst({ where: { email: userEmail } });

    user.info = await prisma.userInfo.findFirst({ where: { email: userEmail } });
    user.address = await prisma.userAddress.findFirst({ where: { email: userEmail } });
    user.profile = await prisma.userPhoto.findFirst({ where: { email: userEmail, type: 'profile' } });
    user.banner = await prisma.userPhoto.findFirst({ where: { email: userEmail, type: 'banner' } });
    user.favorites = await prisma.favorite.findMany({ where: { userEmail } });
    user.followers = await prisma.follower.findMany({ where: { followedEmail: userEmail } });
    user.follow = await prisma.follower.findMany({ where: { followerEmail: userEmail } });
    user.socials = await prisma.userSocial.findMany({ where: { email: userEmail } });

    return excludeFromObject(user, ['otp', 'otp_ttl', 'password']);
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

    return this.userDetails(user.email);
  }

  static async findAll(page = 1, type = null, active = true) {
    const where = { active: validateBoolean(active) };

    if (page < 1 || !type) {
      const users = prisma.user.findMany({ where, orderBy: { name: 'asc' } });
      if (users.length === 0) throw new ConfigurableError(`Não existe nenhum ${type} cadastrado.`, 404);

      return Promise.all(users.map(async (user) => this.userDetails(user.email)));
    }

    const limit = 6;
    where.type = validateUserType(type, "O campo 'tipo' é obrigatório");
    const total = await prisma.user.count({ where });

    if (total === 0) throw new ConfigurableError(`Não existe nenhum ${type} cadastrado.`, 404);

    const lastPage = Math.ceil(total / limit);
    const offset = Number(limit * (page - 1));

    const users = await prisma.user.findMany({
      where,
      // orderBy: { name: 'asc' },
      take: limit,
      skip: offset,
    });

    if (users.length === 0) throw new ConfigurableError(`Não existe nenhum ${type} cadastrado.`, 404);

    const result = await Promise.all(users.map(async (user) => this.userDetails(user.email)));

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

  static async create(params, photos) {
    const newUser = {
      email: validateEmail(params.email, "O campo 'email' é obrigatório"),
      name: validateString(params.name, "O campo 'nome' é obrigatório"),
      handler: generateUniqueHandler(validateString((params.email).split('@')[0], "O campo 'apelido' é obrigatório")),
      password: params.password ? validatePassword(params.password, "O campo 'senha' é obrigatório") : null,
      type: validateUserType(params.type, "O campo 'tipo' é obrigatório"),
    };

    const newInfo = {
      email: newUser.email,
      cpf: params.type !== 'client' || params.cpf ? validateCpf(params.cpf, "O campo 'cpf' é obrigatório") : null,
      cnpj: newUser.type === 'realstate' || params.cnpj ? validateCnpj(params.cnpj, "O campo 'cnpj' é obrigatório") : null,
      rg: params.rg ? validateString(params.rg) : null,
      creci: newUser.type in ['realtor', 'realstate'] || params.creci ? validateString(params.creci, "O campo 'creci' é obrigatório") : null,
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

    if (await prisma.user.findFirst({ where: { email: newUser.email } })) throw new ConfigurableError('Email já cadastrado', 409);

    const transaction = [
      prisma.user.create({ data: newUser }),
      prisma.userInfo.create({ data: newInfo }),
      prisma.userAddress.create({ data: newAddress }),
    ];

    const socials = params.socials ? params.socials.map((social) => ({
      email: newUser.email,
      type: validateString(social.type),
      url: validateString(social.url),
    })) : null;

    if (socials) transaction.push(prisma.userSocial.createMany({ data: socials, skipDuplicates: true }));

    await Promise.all(photos.map(async (photo) => {
      if (!['profile', 'banner'].includes(photo.fieldname)) throw new ConfigurableError("As fotos de usuário devem possuir a tag 'profile' ou 'banner'", 422);

      const storageRef = ref(storage, `images/users/${newUser.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      const profileData = {
        id: uuid(),
        email: newUser.email,
        url: downloadUrl,
        name: photo.originalname,
        type: photo.fieldname,
      };

      transaction.push(prisma.userPhoto.create({ data: profileData }));
    }));

    await prisma.$transaction(transaction);

    return this.userDetails(newUser.email);
  }

  static async update(email, params, photos) {
    const validatedEmail = validateEmail(email);

    if ((!params && !photos) || (Object.keys(params).length === 0 && !photos)) throw new ConfigurableError('Nenhum dado foi fornecido', 422);

    const oldUser = await this.find({ email: validatedEmail });
    if (!oldUser) throw new ConfigurableError('Usuário não encontrado', 404);

    const user = oldUser;
    let transaction = [];

    if (params) {
      const updatedData = {
        email: params.email ? validateEmail(params.email) : oldUser.email,
        name: params.name ? validateString(params.name, 'O campo nome é obrigatório') : oldUser.name,
        handler: params.email ? validateString((params.email).split('@')[0]) : oldUser.handler,
      };

      const updatedInfo = {
        cpf: params.cpf ? validateCpf(params.cpf) : oldUser.cpf,
        cnpj: params.cnpj ? validateCnpj(params.cnpj) : oldUser.cnpj,
        rg: params.rg ? validateString(params.rg) : oldUser.rg,
        creci: params.creci ? validateCreci(params.creci) : oldUser.creci,
        phone: params.phone ? validatePhone(params.phone) : oldUser.phone,
        idPhone: params.idPhone ? validateString(params.idPhone) : oldUser.idPhone,
        bio: params.bio ? validateString(params.bio) : oldUser.bio,
      };

      const updatedAddress = {
        street: params.street ? validateString(params.street) : oldUser.street,
        cep: params.cep ? validateString(params.cep) : oldUser.cep,
        number: params.number ? validateString(params.number) : oldUser.number,
        complement: params.complement ? validateString(params.complement) : oldUser.complement,
        neighborhood: params.neighborhood ? validateString(params.neighborhood) : oldUser.neighborhood,
        city: params.city ? validateString(params.city) : oldUser.city,
        state: params.state ? validateUF(params.state) : oldUser.state,
      };

      const oldSocialsUrlsValidated = params.oldSocialsUrls ? params.oldSocialsUrls.map((socialUrl) => validateString(socialUrl)) : [];

      const socials = params.socials ? params.socials.map((social) => ({
        email: updatedData.email,
        type: validateString(social.type),
        url: validateString(social.url),
      })) : null;

      transaction = [
        prisma.user.update({ where: { email: validatedEmail }, data: updatedData }),
        prisma.userInfo.update({ where: { email: validatedEmail }, data: updatedInfo }),
        prisma.userAddress.update({ where: { email: validatedEmail }, data: updatedAddress }),
        prisma.userSocial.deleteMany({ where: { email: validatedEmail, NOT: { url: { in: oldSocialsUrlsValidated } } } }),
      ];

      if (socials) transaction.push(prisma.userSocial.createMany({ data: socials, skipDuplicates: true }));
    }

    await Promise.all(photos.map(async (photo) => {
      if (!['profile', 'banner'].includes(photo.fieldname)) throw new ConfigurableError("As fotos de usuário devem possuir a tag 'profile' ou 'banner'", 422);

      const oldPhoto = await prisma.userPhoto.findFirst({ where: { email: user.email, type: photo.fieldname } });
      if (oldPhoto) {
        await prisma.userPhoto.delete({ where: { email: user.email, type: photo.fieldname } });
        const storageRef = ref(storage, `images/users/${user.email}/${oldPhoto.name}`);
        await deleteObject(storageRef);
      }

      const storageRef = ref(storage, `images/users/${user.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      const profileData = {
        id: uuid(),
        email: user.email,
        url: downloadUrl,
        name: photo.originalname,
        type: photo.fieldname,
      };

      transaction.push(prisma.userPhoto.create({ data: profileData }));
    }));

    await prisma.$transaction(transaction);

    return this.userDetails(user.email);
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

    const user = await this.find({ email: validatedEmail });
    if (!user) throw new Error('Email não encontrado');

    const validatedPassword = validatePassword(newPassword);
    if (user.password === validatedPassword) throw new ConfigurableError('A nova senha não pode ser igual à antiga', 422);

    const result = await prisma.user.update({ where: { email: validatedEmail }, data: { password: validatedPassword } });
    if (result === undefined) throw new ConfigurableError('Erro ao atualizar a senha', 500);

    return this.userDetails(user.email);
  }

  static async rescuePassword({ email }) {
    const receiverEmail = validateEmail(email);

    const user = await this.find({ email: receiverEmail });
    if (!user) return { message: 'Usuário não encontrado.' };

    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpTtl = new Date();
    otpTtl.setMinutes(otpTtl.getMinutes() + 6);

    await prisma.user.update({ where: { email: receiverEmail }, data: { otp: otp.toString(), otpTtl } });

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

  static async resetPassword({ email, password, otp }) {
    const validatedEmail = validateEmail(email);
    const user = await prisma.user.findFirst({ where: { email: validatedEmail } });

    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    if (user.otp === otp && user.otpTtl > new Date()) {
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
