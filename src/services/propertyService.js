import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';
import { Op } from 'sequelize';

import Property from '../db/models/Property.js';
import Photo from '../db/models/Photo.js';
import { find } from './globalService.js';
import PropertyNotFound from '../errors/propertyErrors/properyNotFound.js';
import { validateString, validateInteger, validateBoolean, validatePhone, validatePrice, validateEmail } from '../validators/inputValidators.js';

import firebaseConfig from '../config/firebase.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function findAll(page) {
  try {
    if (page < 1) {
      return await Property.findAll({
        order: [['cep', 'ASC']],
      });
    }

    const limit = 5;
    const countTotal = await Property.count();

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const props = await Property.findAll({
      order: [['cep', 'ASC']],
      offset,
      limit,
    });

    const pagination = {
      path: '/properties',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total: countTotal,
    };

    if (props.length === 0) return { properties: props, pagination };

    const properties = await Promise.all(props.map(async (property) => {
      const editedProperty = property.dataValues;
      if (property.owner_email) editedProperty.email = editedProperty.owner_email;
      if (property.realtor_email) editedProperty.email = editedProperty.realtor_email;
      if (property.realstate_email) editedProperty.email = editedProperty.realstate_email;

      const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

      return { ...editedProperty, pictures };
    }));

    return { properties, pagination };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findByPk(id) {
  try {
    const validatedId = validateString(id);

    const property = await Property.findByPk(validatedId);

    if (!property) {
      throw new PropertyNotFound();
    }

    if (property.owner_email) property.email = property.owner_email;
    if (property.realtor_email) property.email = property.realtor_email;
    if (property.realstate_email) property.email = property.realstate_email;

    const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

    return { property, pictures };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function findBySellerEmail(email) {
  try {
    const validatedEmail = validateEmail(email);

    const user = await find(validatedEmail);

    if (!user) {
      const error = new Error('Usuário não encontrado');
      error.status = 404;
    }

    const props = await Property.findAll({
      where: {
        [`${user.type}_email`]: validatedEmail,
      },
    });

    const properties = await Promise.all(props.map(async (property) => {
      const editedProperty = property.dataValues;
      if (property.owner_email) editedProperty.email = editedProperty.owner_email;
      if (property.realtor_email) editedProperty.email = editedProperty.realtor_email;
      if (property.realstate_email) editedProperty.email = editedProperty.realstate_email;

      const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

      return { ...editedProperty, pictures };
    }));

    return properties;
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    throw error;
  }
}

async function getAllPropertiesIds(email) {
  const user = await find(validateEmail(email));
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  const properties = await Property.findAll({ where: { [`${user.type}_email`]: user.email }, attributes: ['id'] });

  return properties.map((property) => property.id);
}

async function getAllPropertiesCities(email) {
  const user = await find(validateEmail(email));
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  const properties = await Property.findAll({ where: { [`${user.type}_email`]: user.email }, attributes: ['city'] });
  const cities = properties.map((property) => property.city);
  return [...new Set(cities)];
}

async function create(data, files) {
  try {
    const propertyData = {
      id: uuid(),
      announcement_type: validateString(data.announcementType, 'O campo "tipo do anúncio" é obrigatório'),
      property_type: validateString(data.propertyType, 'O campo "tipo do imóvel" é obrigatório'),
      cep: validateString(data.cep, 'O campo "cep" é obrigatório'),
      address: validateString(data.address, 'O campo "rua" é obrigatório'),
      house_number: validateString(data.houseNumber, 'O campo "numero" é obrigatório'),
      city: validateString(data.city, 'O campo "cidade" é obrigatório'),
      state: validateString(data.state, 'O campo "estado" é obrigatório'),
      district: validateString(data.district, 'O campo "bairro" é obrigatório'),
      size: validateInteger(data.size, 'O campo "tamanho do imóvel" é obrigatório'),
      bedrooms: validateInteger(data.bedrooms, 'O campo "quartos" é obrigatório'),
      bathrooms: validateInteger(data.bathrooms, 'O campo "banheiros" é obrigatório'),
      parking_spaces: validateInteger(data.parkingSpaces, 'O campo "vagas" é obrigatório'),
      pool: validateBoolean(data.pool, 'O campo "piscina" é obrigatório'),
      grill: validateBoolean(data.grill, 'O campo "churrasqueira" é obrigatório'),
      air_conditioning: validateBoolean(data.airConditioning, 'O campo "ar condicionado" é obrigatório'),
      playground: validateBoolean(data.playground, 'O campo "playground" é obrigatório'),
      event_area: validateBoolean(data.eventArea, 'O campo "sala de eventos" é obrigatório'),
      description: validateString(data.description, 'O campo "descrição" é obrigatório'),
      contact: validatePhone(data.contact, 'O campo "telefone" é obrigatório'),
      financiable: validateBoolean(data.financiable, 'O campo "aceita financiamento" é obrigatório'),
    };

    if (data.rentPrice) propertyData.rent_price = validatePrice(data.rentPrice, 'O campo "preço de aluguel" é obrigatório');
    if (data.sellPrice) propertyData.sell_price = validatePrice(data.sellPrice, 'O campo "preço de venda" é obrigatório');
    if (data.sellerType === 'owner') propertyData.owner_email = validateEmail(data.sellerEmail);
    if (data.sellerType === 'realtor') propertyData.realtor_email = validateEmail(data.sellerEmail);
    if (data.sellerType === 'realstate') propertyData.realstate_email = validateEmail(data.sellerEmail);
    if (data.complement) propertyData.complement = validateString(data.complement);
    if (data.floor) propertyData.floor = validateString(data.floor);

    const property = propertyData;
    const newProperty = await Property.create(property);

    const photos = await Promise.all(files.map(async (picture) => {
      const storageRef = ref(storage, `images/properties/${newProperty.id}/${picture.fieldname}-${picture.originalname}`);
      const metadata = { contentType: picture.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, picture.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await Photo.create({
        id: uuid(),
        property_id: newProperty.id,
        url: downloadURL,
        name: `${picture.fieldname}-${picture.originalname}`,
        type: picture.fieldname,
      });

      return { name: `${picture.fieldname}-${picture.originalname}`, type: picture.mimetype, downloadURL };
    }));

    return { newProperty, photos };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function update(id, data, files, sellerEmail) {
  try {
    const validatedId = validateString(id);

    console.log('id', id);
    console.log('validatedId', validatedId);

    // const oldProperProperty = await Property.findOne({ where: { id: validatedId } }, { raw: true }, { attributes: { excludes: ['createdAt', 'updatedAt'] } });
    const oldProperProperty = await Property.findByPk(validatedId, { raw: true });
    if (!oldProperProperty) {
      throw new PropertyNotFound();
    }

    if (oldProperProperty.owner_email !== sellerEmail && oldProperProperty.realtor_email !== sellerEmail && oldProperProperty.realstate_email !== sellerEmail) {
      const error = new Error('Você não tem permissão para alterar este imóvel');
      error.status = 401;
      throw error;
    }

    const property = oldProperProperty;

    if (data.announcementType) property.announcement_type = validateString(data.announcementType, 'O campo "tipo do anúncio" é obrigatório');
    if (data.propertyType) property.property_type = validateString(data.propertyType, 'O campo "tipo do imóvel" é obrigatório');
    if (data.rentPrice) property.rent_price = validatePrice(data.rentPrice, 'O campo "preço de aluguel" é obrigatório');
    if (data.sellPrice) property.sell_price = validatePrice(data.sellPrice, 'O campo "preço de venda" é obrigatório');
    if (data.cep) property.cep = validateString(data.cep, 'O campo "cep" é obrigatório');
    if (data.address) property.address = validateString(data.address, 'O campo "rua" é obrigatório');
    if (data.number) property.number = validateString(data.number, 'O campo "numero" é obrigatório');
    if (data.city) property.city = validateString(data.city, 'O campo "cidade" é obrigatório');
    if (data.state) property.state = validateString(data.state, 'O campo "estado" é obrigatório');
    if (data.neighborhood) property.neighborhood = validateString(data.neighborhood, 'O campo "bairro" é obrigatório');
    if (data.complement) property.complement = validateString(data.complement);
    if (data.floor) property.floor = validateString(data.floor, 'O campo "andar do imóvel" é obrigatório');
    if (data.size) property.size = validateInteger(data.size, 'O campo "tamanho do imóvel" é obrigatório');
    if (data.bedrooms) property.bedrooms = validateInteger(data.bedrooms, 'O campo "quartos" é obrigatório');
    if (data.bathrooms) property.bathrooms = validateInteger(data.bathrooms, 'O campo "banheiros" é obrigatório');
    if (data.parkingSpaces) property.parking_spaces = validateInteger(data.parkingSpaces, 'O campo "vagas" é obrigatório');
    if (data.pool) property.pool = validateBoolean(data.pool, 'O campo "piscina" é obrigatório');
    if (data.grill) property.grill = validateBoolean(data.grill, 'O campo "churrasqueira" é obrigatório');
    if (data.airConditioning) property.air_conditioning = validateBoolean(data.airConditioning, 'O campo "ar condicionado" é obrigatório');
    if (data.playground) property.playground = validateBoolean(data.playground, 'O campo "playground" é obrigatório');
    if (data.eventArea) property.event_area = validateBoolean(data.eventArea, 'O campo "sala de eventos" é obrigatório');
    if (data.description) property.description = validateString(data.description, 'O campo "descrição" é obrigatório');
    if (data.contact) property.contact = validatePhone(data.contact, 'O campo "telefone" é obrigatório');
    if (data.financiable) property.financiable = validateBoolean(data.financiable, 'O campo "aceita financiamento" é obrigatório');
    if (data.ownerEmail) property.owner_email = validateEmail(data.ownerEmail);
    if (data.realtorEmail) property.realtor_email = validateEmail(data.realtorEmail);
    if (data.realstateEmail) property.realstate_email = validateEmail(data.realstateEmail);
    if (data.complement) property.complement = validateString(data.complement);

    if (data.sellerEmail && data.sellerType === 'owner') property.owner_email = validateEmail(data.sellerEmail);
    if (data.sellerEmail && data.sellerType === 'realtor') property.realtor_email = validateEmail(data.sellerEmail);
    if (data.sellerEmail && data.sellerType === 'realstate') property.realstate_email = validateEmail(data.sellerEmail);

    await Property.update(property, { where: { id: validatedId } });
    let photos = await Photo.findAll({ where: { property_id: validatedId } });

    if (files.length > 0) {
      await Photo.destroy({ where: { property_id: validatedId } });

      photos = await Promise.all(files.map(async (picture) => {
        const storageRef = ref(storage, `images/properties/${validatedId}/${picture.fieldname}-${picture.originalname}`);
        const metadata = { contentType: picture.mimetype };
        const snapshot = await uploadBytesResumable(storageRef, picture.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        await Photo.create({ property_id: validatedId, url: downloadURL });

        return { name: `${picture.fieldname}-${picture.originalname}`, type: picture.mimetype, downloadURL };
      }));
    }

    return { property, photos };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function filter(data, page) {
  const limit = 5;
  const offset = Number(limit * (page - 1));
  const where = {};
  let order = [['updatedAt', 'DESC']];
  let minPrice = 0;
  let maxPrice = 999999999;
  let minSize = 0;
  let maxSize = 999999999;
  let user;

  if (data) {
    if (data.id) where.id = validateString(data.id);
    if (data.announcementType) where.announcement_type = validateString(data.announcementType);
    if (data.propertyType) where.property_type = validateString(data.propertyType);
    if (data.city) where.city = validateString(data.city);
    if (data.state) where.state = validateString(data.state);
    if (data.district) where.district = validateString(data.district);
    if (data.bedrooms) where.bedrooms = validateInteger(data.bedrooms);
    if (data.bathrooms) where.bathrooms = validateInteger(data.bathrooms);
    if (data.parkingSpaces) where.parking_spaces = validateInteger(data.parkingSpaces);
    if (data.pool) where.pool = validateBoolean(data.pool);
    if (data.grill) where.grill = validateBoolean(data.grill);
    if (data.airConditioning) where.air_conditioning = validateBoolean(data.airConditioning);
    if (data.playground) where.playground = validateBoolean(data.playground);
    if (data.eventArea) where.event_area = validateBoolean(data.eventArea);
    if (data.financiable) where.financiable = validateBoolean(data.financiable);

    if (data.order && data.orderType) order = [[`${data.order}`, `${data.orderType}`]];

    if (data.email) {
      user = await find(validateEmail(data.email));
      if (!user) {
        const error = new Error('Usuário não encontrado');
        error.status = 404;
        throw error;
      }

      where[`${user.type}_email`] = user.email;
    }

    if (data.minSize) minSize = validateInteger(data.minSize);
    if (data.maxSize) maxSize = validateInteger(data.maxSize);
    if (data.minPrice) minPrice = validatePrice(data.minPrice);
    if (data.maxPrice) maxPrice = validatePrice(data.maxPrice);
    if (data.announcementType === 'Aluguel') where.rent_price = { [Op.between]: [minPrice, maxPrice] };
    else if (data.announcementType === 'Venda') where.sell_price = { [Op.between]: [minPrice, maxPrice] };
    else if (data.announcementType === 'Ambas') {
      where[Op.or] = [
        { rent_price: { [Op.between]: [minPrice, maxPrice] } },
        { sell_price: { [Op.between]: [minPrice, maxPrice] } },
      ];
    }
  }

  where.size = { [Op.between]: [minSize, maxSize] };

  const total = await Property.count({ where });

  const lastPage = Math.ceil(total / limit);

  const pagination = {
    path: '/properties/filter',
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total,
  };

  const result = await Property.findAll({ where, order, limit, offset });

  if (total === 0) return { properties: result, pagination };

  const properties = await Promise.all(result.map(async (property) => {
    const editedProperty = property.dataValues;
    if (property.owner_email) editedProperty.email = editedProperty.owner_email;
    if (property.realtor_email) editedProperty.email = editedProperty.realtor_email;
    if (property.realstate_email) editedProperty.email = editedProperty.realstate_email;

    const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

    return { ...editedProperty, pictures };
  }));

  return { properties, pagination };
}

async function destroy(id) {
  try {
    const validatedId = validateString(id);

    if (!await Property.findByPk(validatedId)) {
      throw new PropertyNotFound();
    }

    const photos = await Photo.findAll({ where: { property_id: validatedId } });

    if (photos.length > 0) {
      await Promise.all(photos.map(async (photo) => {
        const storageRef = ref(storage, `images/properties/${validatedId}/${photo.type}-${photo.name}`);
        await storageRef.delete();
      }));
    }

    await Photo.destroy({ where: { property_id: validatedId } });
    await Property.destroy({ where: { id: validatedId } });
    return { message: 'Usuário apagado com sucesso' };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

export { findAll, findByPk, findBySellerEmail, getAllPropertiesIds, getAllPropertiesCities, filter, create, update, destroy };
