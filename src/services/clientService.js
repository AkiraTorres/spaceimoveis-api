import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';

import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import { validateEmail, validatePhone, validateString, validateUF, validateUserType } from '../validators/inputValidators.js';
import UserService from './userService.js';

export default class ClientService extends UserService {
  static async elevate(params, photo) {
    const validatedEmail = validateEmail(params.email);

    const oldUser = await this.find({ email: validatedEmail }, 'client');
    if (!oldUser) throw new ConfigurableError('Cliente não encontrado', 404);

    if (!(params.type in ['owner', 'realtor', 'realstate'])) throw new ConfigurableError('Tipo de usuário inválido para elevação', 400);

    if (params.type === 'owner' && !params.cpf) throw new ConfigurableError('CPF é obrigatório para elevar um cliente a proprietário', 400);
    if (params.type === 'realtor' && !params.creci && !params.cpf) throw new ConfigurableError('CRECI e CPF são obrigatórios para elevar um cliente a corretor', 400);
    if (params.type === 'realstate' && !params.cnpj) throw new ConfigurableError('CNPJ é obrigatório para elevar um cliente a imobiliária', 400);

    const data = {
      email: params.email ? validateEmail(params.email) : oldUser.email,
      name: params.name ? validateString(params.name, 'O campo nome é obrigatório') : oldUser.name,
      handler: params.email ? validateString((params.email).split('@')[0]) : oldUser.handler,
      type: validateUserType(params.type),
    };

    const info = {
      email: data.email,
      cpf: params.cpf ? validateString(params.cpf, 'O campo CPF é obrigatório') : oldUser.cpf,
      rg: params.rg ? validateString(params.rg, 'O campo RG é obrigatório') : oldUser.rg,
      creci: params.creci ? validateString(params.creci, 'O campo CRECI é obrigatório') : oldUser.creci,
      phone: params.info.phone ? validatePhone(params.info.phone) : oldUser.phone,
      idPhone: params.info.idPhone ? validateString(params.info.idPhone) : oldUser.idPhone,
      bio: params.info.bio ? validateString(params.info.bio) : oldUser.bio,
    };

    const updatedAddress = {
      street: params.address.street ? validateString(params.address.street) : oldUser.street,
      cep: params.address.cep ? validateString(params.address.cep) : oldUser.cep,
      number: params.address.number ? validateString(params.address.number) : oldUser.number,
      complement: params.address.complement ? validateString(params.address.complement) : oldUser.complement,
      neighborhood: params.address.neighborhood ? validateString(params.address.neighborhood) : oldUser.neighborhood,
      city: params.address.city ? validateString(params.address.city) : oldUser.city,
      state: params.address.state ? validateUF(params.address.state) : oldUser.state,
    };

    let profile = await prisma.userPhoto.findUnique({ where: { email: oldUser.email } });
    if (photo) {
      if (profile) {
        const storageRef = ref(this.storage, `images/admins/${oldUser.email}/${profile.name}`);
        await prisma.userPhoto.delete({ where: { email: oldUser.email } });
        await deleteObject(storageRef);
      }

      const storageRef = ref(this.storage, `images/admins/${data.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadUrl = await getDownloadURL(snapshot.ref);

      profile = await prisma.userPhoto.create({
        data: {
          id: uuid(),
          email: data.email,
          url: downloadUrl,
          name: photo.originalname,
          type: 'profile',
        },
      });
    }

    const user = prisma.user.update({ where: { email: validateEmail }, data });
    user.info = prisma.userInfo.update({ where: { email: validateEmail }, data: info });
    user.address = prisma.userAddress.update({ where: { email: validateEmail }, data: updatedAddress });
    user.profile = profile;

    return user;
  }
}
