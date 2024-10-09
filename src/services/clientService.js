import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';

import { initializeApp } from 'firebase/app';
import firebaseConfig from '../config/firebase.js';
import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateEmail, validatePassword, validatePhone, validateString, validateUF, validateUserType } from '../validators/inputValidators.js';
import UserService from './userService.js';

export default class ClientService extends UserService {
  static async elevate(userEmail, params, photos, type) {
    const validatedEmail = validateEmail(userEmail);

    const oldUser = await this.find({ email: validatedEmail }, 'client');
    if (!oldUser) throw new ConfigurableError('Cliente não encontrado', 404);

    if (!['owner', 'realtor', 'realstate'].includes(type)) throw new ConfigurableError('Tipo de usuário inválido para elevação', 400);

    if (type === 'owner' && !params.cpf) throw new ConfigurableError('CPF é obrigatório para elevar um cliente a proprietário', 400);
    if (type === 'realtor' && !params.creci && !params.cpf) throw new ConfigurableError('CRECI e CPF são obrigatórios para elevar um cliente a corretor', 400);
    if (type === 'realstate' && !params.cnpj) throw new ConfigurableError('CNPJ é obrigatório para elevar um cliente a imobiliária', 400);

    const data = {
      email: params.email ? validateEmail(params.email) : oldUser.email,
      name: params.name ? validateString(params.name, 'O campo nome é obrigatório') : oldUser.name,
      password: params.password ? validatePassword(params.password) : oldUser.password,
      handler: params.email ? validateString((params.email).split('@')[0]) : oldUser.handler,
      type: validateUserType(type),
    };

    const infoData = {
      email: data.email,
      cpf: params.cpf ? validateString(params.cpf, 'O campo CPF é obrigatório') : oldUser.cpf,
      cnpj: params.cnpj ? validateString(params.cnpj) : oldUser.cnpj,
      rg: params.rg ? validateString(params.rg, 'O campo RG é obrigatório') : oldUser.rg,
      creci: params.creci ? validateString(params.creci, 'O campo CRECI é obrigatório') : oldUser.creci,
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

    const transaction = [
      prisma.user.update({ where: { email: validatedEmail }, data }),
      prisma.userInfo.update({ where: { email: validatedEmail }, data: infoData }),
      prisma.userAddress.update({ where: { email: validatedEmail }, data: updatedAddress }),
    ];

    if (data.email !== oldUser.email && await prisma.userInfo.findUnique({ where: { email: data.email } })) throw new ConfigurableError('Email já cadastrado', 409);
    if (infoData.cpf !== oldUser.cpf && await prisma.userInfo.findUnique({ where: { cpf: infoData.cpf } })) throw new ConfigurableError('CPF já cadastrado', 409);
    if (infoData.cnpj !== oldUser.cnpj && await prisma.userInfo.findUnique({ where: { cnpj: infoData.cnpj } })) throw new ConfigurableError('CNPJ já cadastrado', 409);
    if (infoData.creci !== oldUser.creci && await prisma.userInfo.findUnique({ where: { creci: infoData.creci } })) throw new ConfigurableError('CRECI já cadastrado', 409);

    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);

    await Promise.all(photos.map(async (photo) => {
      if (!['profile', 'banner'].includes(photo.fieldname)) throw new ConfigurableError("As fotos de usuário devem possuir a tag 'profile' ou 'banner'", 422);

      const oldPhoto = await prisma.userPhoto.findFirst({ where: { email: data.email, type: photo.fieldname } });
      if (oldPhoto) {
        await prisma.userPhoto.delete({ where: { email: data.email, type: photo.fieldname } });
        const storageRef = ref(storage, `images/users/${data.email}/${oldPhoto.name}`);
        await deleteObject(storageRef);
      }

      const storageRef = ref(storage, `images/users/${data.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      const profileData = {
        id: uuid(),
        email: data.email,
        url: downloadUrl,
        name: photo.originalname,
        type: photo.fieldname,
      };

      transaction.push(prisma.userPhoto.create({ data: profileData }));
    }));

    await prisma.$transaction(transaction);

    return this.userDetails(data.email);
  }
}
