import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { v4 as uuid } from 'uuid';

import Client from '../db/models/Client.js';
import Owner from '../db/models/Owner.js';
import OwnerPhoto from '../db/models/OwnerPhoto.js';

import OwnerNotFound from '../errors/ownerErrors/ownerNotFound.js';
import NoOwnersFound from '../errors/ownerErrors/noOwnersFound.js';
import ClientNotFound from '../errors/clientErrors/clientNotFound.js';
import {
  validateEmail, validateString, validatePassword, validatePhone, validateCpf, validateCep,
  validateUF, validateIfUniqueEmail, validateIfUniqueCpf, validateIfUniqueRg,
} from '../validators/inputValidators.js';

import firebaseConfig from '../config/firebase.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function findAll(page) {
  try {
    if (page < 1) {
      return await Owner.findAll({
        attributes: ['email', 'name', 'phone', 'cpf', 'rg', 'address', 'house_number', 'cep', 'district', 'city', 'state', 'type', 'bio'],
        order: [['name', 'ASC']],
      });
    }

    const limit = 5;
    const countTotal = await Owner.count();

    if (countTotal === 0) {
      throw new NoOwnersFound();
    }

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const owners = await Owner.findAll({
      attributes: ['email', 'name', 'phone', 'cpf', 'rg', 'address', 'house_number', 'cep', 'district', 'city', 'state', 'type', 'bio'],
      order: [['name', 'ASC']],
      offset,
      limit,
    });

    if (owners.length === 0) {
      throw new NoOwnersFound();
    }

    const result = await Promise.all(owners.map(async (owner) => {
      const profile = await OwnerPhoto.findOne({ where: { email: owner.email } });
      return { ...owner.dataValues, profile };
    }));

    const pagination = {
      path: '/owners',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total: countTotal,
    };

    return { result, pagination };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByPk(email, password) {
  try {
    const validatedEmail = validateEmail(email);
    const attributes = ['email', 'name', 'phone', 'cpf', 'rg', 'address', 'house_number', 'cep', 'district', 'city', 'state', 'type', 'bio'];
    if (password) attributes.push('password');

    const owner = await Owner.findByPk(validatedEmail, {
      attributes,
    });

    if (!owner) {
      throw new OwnerNotFound();
    }

    const profile = await OwnerPhoto.findOne({ where: { email: owner.email } });
    return { ...owner.dataValues, profile };
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

async function findByCpf(cpf, password = false) {
  try {
    const validatedCpf = validateCpf(cpf);
    const attributes = ['email', 'name', 'phone', 'cpf', 'rg', 'address', 'house_number', 'cep', 'district', 'city', 'state', 'type', 'bio'];
    if (password) attributes.push('password');

    const realtor = await Owner.findOne({ where: { cpf: validatedCpf } }, {
      attributes,
    });

    if (!realtor) {
      throw new OwnerNotFound();
    }

    const profile = await OwnerPhoto.findOne({ where: { email: realtor.email } });
    return { ...realtor.dataValues, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByRg(rg, password = false) {
  try {
    const validatedRg = validateString(rg);
    const attributes = ['email', 'name', 'phone', 'cpf', 'rg', 'address', 'house_number', 'cep', 'district', 'city', 'state', 'type', 'bio'];
    if (password) attributes.push('password');

    const realtor = await Owner.findOne({ where: { rg: validatedRg } }, {
      attributes,
    });

    if (!realtor) {
      throw new OwnerNotFound();
    }

    const profile = await OwnerPhoto.findOne({ where: { email: realtor.email } });
    return { ...realtor.dataValues, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function create(data, photo) {
  try {
    const userData = {
      email: validateEmail(data.email),
      name: validateString(data.name, 'O campo nome é obrigatório'),
      password: validatePassword(data.password),
      phone: validatePhone(data.phone),
      cpf: validateCpf(data.cpf),
      rg: validateString(data.rg, 'O campo RG é obrigatório'),
      address: validateString(data.address, 'O campo endereço é obrigatório'),
      house_number: validateString(data.house_number, 'O campo número é obrigatório'),
      cep: validateCep(data.cep),
      district: validateString(data.district, 'O campo bairro é obrigatório'),
      city: validateString(data.city, 'O campo cidade é obrigatório'),
      state: validateUF(data.state),
      bio: data.bio ? validateString(data.bio) : null,
    };

    const owner = userData;
    await validateIfUniqueEmail(owner.email);
    await validateIfUniqueCpf(owner.cpf);
    await validateIfUniqueRg(owner.rg);

    const newOwner = await Owner.create(owner);
    let profile = null;

    if (photo) {
      const storageRef = ref(storage, `images/owners/${newOwner.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      profile = await OwnerPhoto.create({
        id: uuid(),
        email: newOwner.email,
        url: downloadURL,
        name: photo.originalname,
        type: 'profile',
      });
    }

    return { ...newOwner.dataValues, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function update(email, data, photo) {
  try {
    const validatedEmail = validateEmail(email);

    if ((!data && !photo) || (Object.keys(data).length === 0 && !photo)) {
      throw new Error('Nenhum dado foi informado para atualização');
    }

    const oldOwner = await Owner.findByPk(validatedEmail);
    if (!oldOwner) {
      throw new OwnerNotFound();
    }

    let updatedOwner = oldOwner;
    if (data) {
      const owner = {
        email: data.email ? validateEmail(oldOwner.email) : oldOwner.email,
        name: data.name ? validateString(oldOwner.name, 'O campo nome é obrigatório') : oldOwner.name,
        phone: data.phone ? validatePhone(oldOwner.phone) : oldOwner.phone,
        cpf: data.cpf ? validateCpf(oldOwner.cpf) : oldOwner.cpf,
        rg: data.rg ? validateString(oldOwner.rg, 'O campo RG é obrigatório') : oldOwner.rg,
        address: data.address ? validateString(oldOwner.address, 'O campo endereço é obrigatório') : oldOwner.address,
        house_number: data.house_number ? validateString(oldOwner.house_number, 'O campo número é obrigatório') : oldOwner.house_number,
        cep: data.cep ? validateCep(oldOwner.cep) : oldOwner.cep,
        district: data.district ? validateString(oldOwner.district, 'O campo bairro é obrigatório') : oldOwner.district,
        city: data.city ? validateString(oldOwner.city, 'O campo cidade é obrigatório') : oldOwner.city,
        state: data.state ? validateUF(oldOwner.state) : oldOwner.state,
        bio: data.bio ? validateString(data.bio) : oldOwner.bio,
      };

      if (owner.email !== validatedEmail) await validateIfUniqueEmail(owner.email);
      if (owner.rg !== oldOwner.rg) await validateIfUniqueRg(owner.rg);
      if (owner.cpf !== oldOwner.cpf) await validateIfUniqueCpf(owner.cpf);

      await Owner.update(owner, { where: { email: validatedEmail } });
      updatedOwner = owner;
    }

    let profile = await OwnerPhoto.findOne({ where: { email: updatedOwner.email } });
    if (photo) {
      if (profile) {
        const storageRef = ref(storage, `images/owners/${updatedOwner.email}/${profile.name}`);
        await OwnerPhoto.destroy({ where: { email: updatedOwner.email } });
        await deleteObject(storageRef);
      }

      const storageRef = ref(storage, `images/owners/${updatedOwner.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      profile = await OwnerPhoto.create({
        id: uuid(),
        email: updatedOwner.email,
        url: downloadURL,
        name: photo.originalname,
        type: 'profile',
      });
    }

    return { ...updatedOwner, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function elevate(email, data, photo) {
  try {
    const validatedEmail = validateEmail(email);

    const client = await Client.findByPk(validatedEmail);
    if (!client) {
      throw new ClientNotFound();
    }

    const owner = {
      email: validateEmail(client.email),
      name: validateString(client.name, 'O campo nome é obrigatório'),
      phone: validatePhone(client.phone || data.phone),
      password: validatePassword(data.password),
      cpf: validateCpf(data.cpf),
      rg: validateString(data.rg, 'O campo RG é obrigatório'),
      cep: validateCep(data.cep),
      address: validateString(data.address, 'O campo endereço é obrigatório'),
      district: validateString(data.district, 'O campo bairro é obrigatório'),
      house_number: validateString(data.house_number, 'O campo número é obrigatório'),
      city: validateString(data.city, 'O campo cidade é obrigatório'),
      state: validateUF(data.state),
      bio: data.bio ? validateString(data.bio) : null,
    };

    await validateIfUniqueRg(owner.rg);
    await validateIfUniqueCpf(owner.cpf);

    await Client.destroy({ where: { email: validatedEmail } });
    const newOwner = await Owner.update(owner, { where: { email: validatedEmail } });

    let profile = null;
    if (photo) {
      const storageRef = ref(storage, `images/owners/${newOwner.email}/${photo.originalname}`);
      const metadata = { contentType: photo.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, photo.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      profile = await OwnerPhoto.create({
        id: uuid(),
        email: newOwner.email,
        url: downloadURL,
        name: photo.originalname,
        type: 'profile',
      });
    }

    return { ...newOwner.dataValues, profile };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function destroy(email) {
  try {
    const validatedEmail = validateEmail(email);

    if (!await Owner.findByPk(validatedEmail)) {
      throw new OwnerNotFound();
    }

    const profile = await OwnerPhoto.findOne({ where: { email: validatedEmail } });
    if (profile) {
      const storageRef = ref(storage, `images/owners/${validatedEmail}/${profile.name}`);
      await deleteObject(storageRef);
      await OwnerPhoto.destroy({ where: { email: validatedEmail } });
    }

    await Owner.destroy({ where: { email: validatedEmail } });
    return { message: 'Usuário apagado com sucesso' };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

export { findAll, findByPk, findByCpf, findByRg, create, update, elevate, destroy };
