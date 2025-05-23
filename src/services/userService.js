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

const generateUniqueHandler = async (h) => {
  let user;
  let handler = h;
  do {
    handler = `${h}${Math.floor(1000 + Math.random() * 9000)}`;
    // eslint-disable-next-line no-await-in-loop
    user = await prisma.user.findFirst({ where: { handler } });
  } while (user);
  return handler;
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

  static async findAll(page = 1, limit = 6, type = null, active = true) {
    const where = { active: validateBoolean(active) };

    if (page < 1 || !type) {
      const users = prisma.user.findMany({ where, orderBy: { name: 'asc' } });
      if (users.length === 0) throw new ConfigurableError(`Não existe nenhum ${type} cadastrado.`, 404);

      return Promise.all(users.map(async (user) => this.userDetails(user.email)));
    }

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
      handler: await generateUniqueHandler(validateString((params.email).split('@')[0], "O campo 'apelido' é obrigatório")),
      password: params.password ? validatePassword(params.password, "O campo 'senha' é obrigatório") : null,
      type: validateUserType(params.type, "O campo 'tipo' é obrigatório"),
    };

    const newInfo = {
      email: newUser.email,
      cpf: !['client', 'realstate', 'admin'].includes(params.type) || params.cpf ? validateCpf(params.cpf, "O campo 'cpf' é obrigatório") : null,
      cnpj: newUser.type === 'realstate' || params.cnpj ? validateCnpj(params.cnpj, "O campo 'cnpj' é obrigatório") : null,
      rg: params.rg ? validateString(params.rg) : null,
      creci: ['realtor', 'realstate'].includes(newUser.type) || params.creci ? validateCreci(params.creci, newUser.type === 'realstate') : null,
      phone: params.phone ? validatePhone(params.phone) : null,
      idPhone: params.idPhone ? validateString(params.idPhone) : null,
      bio: params.bio ? validateString(params.bio) : null,
      subscription: newUser.type !== 'admin' ? 'free' : null,
    };

    if (['realtor', 'realstate'].includes(newUser.type)) {
      newInfo.highlightLimit = 30;
      newInfo.publishLimit = 2000;
    }

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

    if (newInfo.cpf && await prisma.userInfo.findFirst({ where: { cpf: newInfo.cpf } })) throw new ConfigurableError('CPF já cadastrado', 409);
    if (newInfo.cnpj && await prisma.userInfo.findFirst({ where: { cnpj: newInfo.cnpj } })) throw new ConfigurableError('CNPJ já cadastrado', 409);
    if (newInfo.rg && await prisma.userInfo.findFirst({ where: { rg: newInfo.rg } })) throw new ConfigurableError('rg já cadastrado', 409);
    if (newInfo.creci && await prisma.userInfo.findFirst({ where: { creci: newInfo.creci } })) throw new ConfigurableError('CRECI já cadastrado', 409);

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

    if (photos) {
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
    }

    await prisma.$transaction(transaction);

    return this.userDetails(newUser.email);
  }

  static async update(email, params, photos) {
    const validatedEmail = validateEmail(email);

    if ((!params && !photos) || (Object.keys(params).length === 0 && !photos)) throw new ConfigurableError('Nenhum dado foi fornecido', 422);

    const oldUser = await this.find({ email: validatedEmail });
    if (!oldUser) throw new ConfigurableError('Usuário não encontrado', 404);

    let transaction = [];

    if (params) {
      const updatedData = {
        // email: params.email ? validateEmail(params.email) : oldUser.email,
        name: params.name ? validateString(params.name, 'O campo nome é obrigatório') : oldUser.name,
        handler: params.handler ? await generateUniqueHandler(validateString(params.handler)) : oldUser.handler,
      };

      const updatedInfo = {
        cpf: params.cpf ? validateCpf(params.cpf) : oldUser.cpf,
        cnpj: params.cnpj ? validateCnpj(params.cnpj) : oldUser.cnpj,
        rg: params.rg ? validateString(params.rg) : oldUser.rg,
        creci: params.creci ? validateCreci(params.creci, oldUser.type === 'realstate') : oldUser.creci,
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
        email: validatedEmail,
        type: validateString(social.type),
        url: validateString(social.url),
      })) : null;

      if (params.cpf && params.cpf !== oldUser.cpf && await prisma.userInfo.findFirst({ where: { cpf: params.cpf } })) throw new ConfigurableError('CPF já cadastrado', 409);
      if (params.cnpj && params.cnpj !== oldUser.cnpj && await prisma.userInfo.findFirst({ where: { cnpj: params.cnpj } })) throw new ConfigurableError('CNPJ já cadastrado', 409);
      if (params.creci && params.creci !== oldUser.creci && await prisma.userInfo.findFirst({ where: { creci: params.creci } })) throw new ConfigurableError('CRECI já cadastrado', 409);
      if (params.email && params.email !== oldUser.email && await prisma.user.findFirst({ where: { email: params.email } })) throw new ConfigurableError('Email já cadastrado', 409);

      transaction = [
        prisma.user.update({ where: { email: validatedEmail }, data: updatedData }),
        prisma.userInfo.update({ where: { email: validatedEmail }, data: updatedInfo }),
        prisma.userAddress.update({ where: { email: validatedEmail }, data: updatedAddress }),
        prisma.userSocial.deleteMany({ where: { email: validatedEmail, NOT: { url: { in: oldSocialsUrlsValidated } } } }),
      ];

      if (socials) {
        // transaction.push(prisma.userSocial.deleteMany({ where: { email: validatedEmail } }));
        transaction.push(prisma.userSocial.createMany({ data: socials, skipDuplicates: true }));
      }
    }

    await Promise.all(photos.map(async (photo) => {
      if (!['profile', 'banner'].includes(photo.fieldname)) throw new ConfigurableError("As fotos de usuário devem possuir a tag 'profile' ou 'banner'", 422);

      const oldPhoto = await prisma.userPhoto.findFirst({ where: { email: validatedEmail, type: photo.fieldname } });
      if (oldPhoto) {
        transaction.push(prisma.userPhoto.delete({ where: { id: oldPhoto.id } }));
        await deleteObject(ref(storage, `images/users/${validatedEmail}/${oldPhoto.name}`));
      }

      const storageRef = ref(storage, `images/users/${validatedEmail}/${photo.originalname}`);
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, { contentType: photo.mimetype });
      const downloadUrl = await getDownloadURL(snapshot.ref);

      transaction.push(prisma.userPhoto.create({
        data: {
          id: uuid(),
          email: validatedEmail,
          url: downloadUrl,
          name: photo.originalname,
          type: photo.fieldname,
        },
      }));
    }));

    await prisma.$transaction(transaction);

    return this.userDetails(validatedEmail);
  }

  static async destroy(email) {
    const validatedEmail = validateEmail(email);

    const user = await prisma.user.findUnique({ where: { email: validatedEmail } }); // , active: true
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    // await prisma.user.update({ where: { email: validatedEmail }, data: { active: false, deletedAt: new Date() } });
    await prisma.user.delete({ where: { email: validatedEmail } });
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
      userName: validateString(name, 'O campo nome é obrigatório'),
      userEmail: validateEmail(email, 'O campo email é obrigatório'),
      userType: type ? validateUserType(type) : null,
      message: validateString(message, 'O campo mensagem é obrigatório'),
    };

    await prisma.userMessages.create({ data: newData });

    return { message: 'Mensagem enviada com sucesso!' };
  }

  static async findAllAppointments(email) {
    const validatedEmail = validateEmail(email);
    const user = await prisma.user.findFirst({ where: { email: validatedEmail } });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);
    // if (!['realtor', 'realstate'].includes(user.type)) throw new ConfigurableError('Usuário não é um corretor/imobiliária', 400);

    return prisma.appointment.findMany({
      where: {
        OR: [
          { advertiserEmail: validatedEmail },
          { solicitorEmail: validatedEmail },
        ],
      },
    });
  }

  static async findAppointmentById(appointmentId, email) {
    const validatedId = validateString(appointmentId);
    const validatedEmail = validateEmail(email);

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: validatedId,
        OR: [
          { advertiserEmail: validatedEmail },
          { solicitorEmail: validatedEmail },
        ],
      },
    });
    if (!appointment) throw new ConfigurableError('Agendamento não encontrado', 404);

    return appointment;
  }

  static translateDay(day) {
    const daysMap = {
      domingo: 'sunday',
      segunda: 'monday',
      terça: 'tuesday',
      quarta: 'wednesday',
      quinta: 'thursday',
      sexta: 'friday',
      sábado: 'saturday',
      sunday: 'domingo',
      monday: 'segunda',
      tuesday: 'terça',
      wednesday: 'quarta',
      thursday: 'quinta',
      friday: 'sexta',
      saturday: 'sábado',
    };

    return daysMap[day] || null;
  }
}
