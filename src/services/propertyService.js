import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';
import { Op } from 'sequelize';

import Property from '../db/models/Property.js';
import Photo from '../db/models/Photo.js';
import { find } from './globalService.js';
import PropertyNotFound from '../errors/propertyErrors/properyNotFound.js';
import {
  validateBoolean,
  validateEmail,
  validateInteger,
  validatePhone,
  validatePrice,
  validateString,
} from '../validators/inputValidators.js';

import firebaseConfig from '../config/firebase.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function findAll(page = 1, isHighlighted = false) {
  try {
    if (page < 1) {
      return await Property.findAll({
        where: { is_highlighted: isHighlighted },
        order: [['cep', 'ASC']],
      });
    }

    const limit = 6;
    const countTotal = await Property.count();

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const props = await Property.findAll({
      where: { is_highlighted: isHighlighted },
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
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
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
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
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

    return await Promise.all(props.map(async (property) => {
      const editedProperty = property.dataValues;
      if (property.owner_email) editedProperty.email = editedProperty.owner_email;
      if (property.realtor_email) editedProperty.email = editedProperty.realtor_email;
      if (property.realstate_email) editedProperty.email = editedProperty.realstate_email;

      const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

      return { ...editedProperty, pictures };
    }));
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
    if (data.iptu) propertyData.iptu = validatePrice(data.iptu);
    if (data.aditionalFees) propertyData.aditional_fees = validatePrice(data.aditionalFees);
    if (data.negotiable) propertyData.negotiable = validateBoolean(data.negotiable);
    if (data.suites) propertyData.suites = validateInteger(data.suites);
    if (data.furnished) propertyData.furnished = validateBoolean(data.furnished);
    if (data.gym) propertyData.gym = validateBoolean(data.gym);
    if (data.balcony) propertyData.balcony = validateBoolean(data.balcony);
    if (data.solarEnergy) propertyData.solar_energy = validateBoolean(data.solarEnergy);
    if (data.concierge) propertyData.concierge = validateBoolean(data.concierge);
    if (data.yard) propertyData.yard = validateBoolean(data.yard);

    const newProperty = await Property.create(propertyData);

    const photos = await Promise.all(files.map(async (picture) => {
      const storageRef = ref(storage, `images/properties/${newProperty.id}/${picture.originalname}`);
      const metadata = { contentType: picture.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, picture.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await Photo.create({
        id: uuid(),
        property_id: newProperty.id,
        url: downloadURL,
        name: `${picture.originalname}`,
        type: picture.fieldname,
      });

      return { name: `${picture.originalname}`, type: picture.mimetype, downloadURL };
    }));

    return { newProperty, photos };
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

async function update(id, data, files, sellerEmail) {
  try {
    const validatedId = validateString(id);
    let newCoverUrl;
    let oldPhotosUrls = [];

    const oldProperProperty = await Property.findByPk(validatedId, { raw: true }, { attributes: { excludes: ['password'] } });
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
    if (data.iptu) property.iptu = validatePrice(data.iptu);
    if (data.aditionalFees) property.aditional_fees = validatePrice(data.aditionalFees);
    if (data.negotiable) property.negotiable = validateBoolean(data.negotiable);
    if (data.suites) property.suites = validateInteger(data.suites);
    if (data.furnished) property.furnished = validateBoolean(data.furnished);
    if (data.gym) property.gym = validateBoolean(data.gym);
    if (data.balcony) property.balcony = validateBoolean(data.balcony);
    if (data.solarEnergy) property.solar_energy = validateBoolean(data.solarEnergy);
    if (data.concierge) property.concierge = validateBoolean(data.concierge);
    if (data.yard) property.yard = validateBoolean(data.yard);
    if (data.oldPhotos) oldPhotosUrls = data.oldPhotos;

    if (data.sellerEmail && data.sellerType === 'owner') property.owner_email = validateEmail(data.sellerEmail);
    if (data.sellerEmail && data.sellerType === 'realtor') property.realtor_email = validateEmail(data.sellerEmail);
    if (data.sellerEmail && data.sellerType === 'realstate') property.realstate_email = validateEmail(data.sellerEmail);

    if (data.newCover) newCoverUrl = data.newCover;

    await Property.update(property, { where: { id: validatedId } });

    const oldPhotos = await Photo.findAll({ where: { property_id: validatedId, url: { [Op.not]: oldPhotosUrls } }, raw: true });

    // delete photos that the user didn't want to keep
    await Promise.all(oldPhotos.map(async (photo) => {
      try {
        const storageRef = ref(storage, `images/properties/${validatedId}/${photo.name}`);
        await deleteObject(storageRef);
      } catch (error) { /* do nothing */ }
      await Photo.destroy({ where: { id: photo.id } });
    }));

    if (newCoverUrl) {
      const oldCover = await Photo.findOne({ where: { property_id: validatedId, type: 'cover' }, raw: true });
      const newCover = await Photo.findOne({ where: { property_id: validatedId, url: newCoverUrl }, raw: true });
      if (oldCover && !(oldCover.url === newCover.url)) {
        oldCover.type = 'photo';
        await Photo.update(oldCover, { where: { id: oldCover.id } });

        newCover.type = 'cover';
        await Photo.update(newCover, { where: { id: newCover.id } });
      } else if (!oldCover || oldCover === undefined) {
        newCover.type = 'cover';
        await Photo.update(newCover, { where: { id: newCover.id } });
      }
    }

    // add new photos send by user
    if (files.length > 0) {
      await Promise.all(files.map(async (picture) => {
        // change cover photo if send by user
        const storageRef = ref(storage, `images/properties/${validatedId}/${picture.originalname}`);
        const metadata = { contentType: picture.mimetype };
        const snapshot = await uploadBytesResumable(storageRef, picture.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const exists = await Photo.findOne({ where: { property_id: validatedId, url: downloadURL }, raw: true });
        if (!exists) {
          if (picture.fieldname === 'cover') {
            const oldCover = await Photo.findOne({ where: { property_id: validatedId, type: 'cover' }, raw: true });
            if (oldCover) {
              oldCover.type = 'photo';
              await Photo.update(oldCover, { where: { id: oldCover.id } });
            }
          }

          await Photo.create({
            id: uuid(),
            name: `${picture.originalname}`,
            property_id: validatedId,
            url: downloadURL,
            type: picture.fieldname,
          });
          return { name: `${picture.originalname}`, type: picture.mimetype, downloadURL };
        }

        return null;
      }));
    }

    const photos = await Photo.findAll({ where: { property_id: validatedId }, order: [['type', 'ASC']] });

    return { property, photos };
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

async function filter(data, page = 1, isHighlighted = false) {
  const limit = 6;
  const offset = Number(limit * (page - 1));
  const where = {};
  const order = [['updatedAt', 'DESC']];
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
    if (data.negotiable) where.negotiable = validateBoolean(data.negotiable);
    if (data.suites) where.suites = validateInteger(data.suites);
    if (data.furnished) where.furnished = validateBoolean(data.furnished);
    if (data.gym) where.gym = validateBoolean(data.gym);
    if (data.balcony) where.balcony = validateBoolean(data.balcony);
    if (data.solarEnergy) where.solar_energy = validateBoolean(data.solarEnergy);
    if (data.concierge) where.concierge = validateBoolean(data.concierge);
    if (data.yard) where.yard = validateBoolean(data.yard);

    if (data.order) order[0] = validateString(data.order);
    if (data.orderType) order[1] = validateString(data.orderType);

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

  where.is_highlighted = isHighlighted;

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
        const storageRef = ref(storage, `images/properties/${validatedId}/${photo.name}`);
        await deleteObject(storageRef);
      }));
    }

    await Photo.destroy({ where: { property_id: validatedId } });
    await Property.destroy({ where: { id: validatedId } });
    return { message: 'Propriedade apagada com sucesso' };
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

export { findAll, findByPk, findBySellerEmail, getAllPropertiesIds, getAllPropertiesCities, filter, create, update, destroy };
