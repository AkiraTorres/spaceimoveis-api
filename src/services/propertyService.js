import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { Op } from 'sequelize';
import { v4 as uuid } from 'uuid';

import Photo from '../db/models/Photo.js';
import Property from '../db/models/Property.js';
import PropertyNotFound from '../errors/propertyErrors/propertyNotFound.js';
import {
  validateBoolean,
  validateEmail,
  validateInteger,
  validatePhone,
  validatePrice,
  validateString,
} from '../validators/inputValidators.js';
import { getPropertyTotalFavorites } from './favoriteService.js';
import { find } from './globalService.js';

import firebaseConfig from '../config/firebase.js';

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

async function checkHighlightLimit(email) {
  let highlighLimit;
  const { subscription, type } = await find(email);
  if (subscription === 'free') highlighLimit = 1;
  if (subscription === 'platinum') highlighLimit = 5;
  if (subscription === 'gold') highlighLimit = 9999;
  if (subscription === 'diamond') highlighLimit = 9999;

  const highlightedProperties = await Property.count({ where: { [`${type}_email`]: email, is_highlighted: true } });

  if (highlightedProperties >= highlighLimit) {
    const error = new Error('Limite de imóveis em destaque atingido');
    error.status = 400;
    throw error;
  }
}

async function checkAnnouncementLimit(email) {
  let highlighLimit;
  const { subscription, type } = await find(email);
  if (subscription === 'free') highlighLimit = 3;
  if (subscription === 'platinum') highlighLimit = 10;
  if (subscription === 'gold') highlighLimit = 9999;
  if (subscription === 'diamond') highlighLimit = 9999;

  const highlightedProperties = await Property.count({ where: { [`${type}_email`]: email, is_highlighted: true } });

  if (highlightedProperties >= highlighLimit) {
    const error = new Error('Limite de imóveis em destaque atingido');
    error.status = 400;
    throw error;
  }
}

export async function findAll(page = 1, isHighlighted = false, isPublished = true, limit = 6) {
  try {
    if (page < 1) {
      const error = new Error('A página deve ser maior que 0');
      error.status = 400;
      throw error;
    }

    const countTotal = await Property.count({
      where: { is_highlighted: isHighlighted, is_published: isPublished },
    });

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const props = await Property.findAll({
      where: { is_highlighted: isHighlighted, is_published: isPublished },
      order: [['updatedAt', 'DESC']],
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
      if (property.realstate_email) editedProperty.email = editedProperty.realstate_email;
      if (property.realtor_email) editedProperty.email = editedProperty.realtor_email;

      editedProperty.shared = property.owner_email !== property.email;

      const seller = await find(editedProperty.email);

      const totalFavorites = await getPropertyTotalFavorites(property.id);

      const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

      return { ...editedProperty, totalFavorites, pictures, seller };
    }));

    properties.sort((a, b) => {
      if (a.totalFavorites !== b.totalFavorites) return b.totalFavorites - a.totalFavorites;
      return b.times_seen - a.times_seen;
    });

    return { properties, pagination };
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

export async function recommendedProperties(page = 1, isHighlighted = true, limit = 6) {
  const offset = Number(limit * (page - 1));
  const where = { is_highlighted: isHighlighted, is_published: true };
  const order = [['updatedAt', 'DESC']];
  const total = await Property.count({ where });
  const lastPage = Math.ceil(total / limit);

  const pagination = {
    path: '/properties',
    page,
    prev_page_url: page - 1 >= 1 ? page - 1 : null,
    next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
    lastPage,
    total,
  };

  const props = await Property.findAll({ where, order, limit, offset });

  const properties = await Promise.all(props.map(async (property) => {
    const editedProperty = property.dataValues;
    if (property.owner_email) editedProperty.email = editedProperty.owner_email;
    if (property.realstate_email) editedProperty.email = editedProperty.realstate_email;
    if (property.realtor_email) editedProperty.email = editedProperty.realtor_email;

    editedProperty.shared = property.owner_email !== property.email;

    const seller = await find(editedProperty.email);

    const totalFavorites = await getPropertyTotalFavorites(property.id);

    const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

    return { ...editedProperty, totalFavorites, pictures, seller };
  }));

  properties.sort((a, b) => {
    if (a.totalFavorites !== b.totalFavorites) return b.totalFavorites - a.totalFavorites;
    return b.times_seen - a.times_seen;
  });

  return { properties, pagination };
}

export async function findByPk(id) {
  try {
    const validatedId = validateString(id);

    const property = await Property.findByPk(validatedId);

    if (!property) {
      throw new PropertyNotFound();
    }

    if (property.owner_email) property.email = property.owner_email;
    if (property.realstate_email) property.email = property.realstate_email;
    if (property.realtor_email) property.email = property.realtor_email;

    property.shared = property.owner_email !== property.email;

    const seller = await find(property.email);

    const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

    return { property, pictures, seller };
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

export async function findBySellerEmail(email, page = 1, limit = 6) {
  try {
    const validatedEmail = validateEmail(email);

    const user = await find(validatedEmail);

    if (!user) {
      const error = new Error('Usuário não encontrado');
      error.status = 404;
    }

    const total = await Property.count({ where: { [`${user.type}_email`]: validatedEmail } });
    const lastPage = Math.ceil(total / limit);
    const offset = Number(limit * (page - 1));

    const pagination = {
      path: '/properties',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    const props = await Property.findAll({
      where: { [`${user.type}_email`]: validatedEmail },
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
    });

    const properties = await Promise.all(props.map(async (property) => {
      const editedProperty = property.dataValues;
      if (property.owner_email === email) editedProperty.email = editedProperty.owner_email;
      if (property.realtor_email === email) editedProperty.email = editedProperty.realtor_email;
      if (property.realstate_email === email) editedProperty.email = editedProperty.realstate_email;

      editedProperty.shared = property.owner_email !== property.email;

      const seller = await find(editedProperty.email);

      const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

      return { ...editedProperty, pictures, seller };
    }));

    properties.sort((a, b) => {
      if (a.totalFavorites !== b.totalFavorites) return b.totalFavorites - a.totalFavorites;
      return b.times_seen - a.times_seen;
    });

    return { properties, pagination };
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    throw error;
  }
}

export async function getAllPropertiesIds(email) {
  const user = await find(validateEmail(email));
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  const properties = await Property.findAll({ where: { [`${user.type}_email`]: user.email }, attributes: ['id'] });

  return properties.map((property) => property.id);
}

export async function getAllPropertiesCities(email) {
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

export async function getTimesSeen(id) {
  const validatedId = validateString(id);
  const property = await Property.findByPk(validatedId);
  if (!property) {
    throw new PropertyNotFound();
  }

  return property.times_seen;
}

export async function addTimesSeen(id) {
  const validatedId = validateString(id);
  const property = await Property.findByPk(validatedId);
  if (!property) {
    throw new PropertyNotFound();
  }

  return Property.update({ times_seen: property.times_seen + 1 }, { where: { id: validatedId } });
}

export async function getMostSeenPropertiesBySeller(email, limit = 6) {
  const user = await find(validateEmail(email));
  if (!user) {
    const error = new Error('Usuário não encontrado');
    error.status = 404;
    throw error;
  }

  const props = await Property.findAll({
    where: { [`${user.type}_email`]: user.email },
    order: [['times_seen', 'DESC']],
    limit,
    raw: true,
  });

  const properties = await Promise.all(props.map(async (property) => {
    const editedProperty = property;

    if (property.owner_email === email) editedProperty.email = editedProperty.owner_email;
    if (property.realstate_email === email) editedProperty.email = editedProperty.realstate_email;
    if (property.realtor_email === email) editedProperty.email = editedProperty.realtor_email;

    editedProperty.shared = property.owner_email !== property.email;

    editedProperty.seller = await find(editedProperty.email);
    editedProperty.pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });
    return editedProperty;
  }));

  return properties;
}

export async function create(data, files) {
  try {
    const { sellerEmail } = data;
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
    };

    if (data.financiable) propertyData.financiable = validateBoolean(data.financiable);
    if (data.rentPrice) propertyData.rent_price = validatePrice(data.rentPrice, 'O campo "preço de aluguel" é obrigatório');
    if (data.sellPrice) propertyData.sell_price = validatePrice(data.sellPrice, 'O campo "preço de venda" é obrigatório');
    if (data.sellerType === 'owner') propertyData.owner_email = validateEmail(sellerEmail);
    if (data.sellerType === 'realtor') propertyData.realtor_email = validateEmail(sellerEmail);
    if (data.sellerType === 'realstate') propertyData.realstate_email = validateEmail(sellerEmail);
    if (data.complement) propertyData.complement = validateString(data.complement);
    if (data.floor) propertyData.floor = validateString(data.floor);
    if (data.iptu) propertyData.iptu = validatePrice(data.iptu);
    if (data.aditionalFees) propertyData.aditional_fees = validatePrice(data.aditionalFees);
    if (data.negotiable !== undefined) propertyData.negotiable = validateBoolean(data.negotiable);
    if (data.suites) propertyData.suites = validateInteger(data.suites);
    if (data.furnished !== undefined) propertyData.furnished = validateBoolean(data.furnished);
    if (data.gym !== undefined) propertyData.gym = validateBoolean(data.gym);
    if (data.balcony !== undefined) propertyData.balcony = validateBoolean(data.balcony);
    if (data.concierge !== undefined) propertyData.concierge = validateBoolean(data.concierge);
    if (data.yard !== undefined) propertyData.yard = validateBoolean(data.yard);

    if (data.solarEnergy !== undefined) {
      propertyData.solar_energy = validateBoolean(data.solarEnergy);
    }

    if (data.isHighlighted !== undefined) {
      propertyData.is_highlighted = validateBoolean(data.isHighlighted);
    }

    if (data.isPublished !== undefined) {
      propertyData.is_published = validateBoolean(data.isPublished);
    }

    if (!propertyData.sell_price && !propertyData.rent_price) {
      const error = new Error('É obrigatório o imóvel ter preço de venda ou preço de aluguel');
      error.status = 400;
      throw error;
    }

    const { subscription } = await find(sellerEmail);
    if (subscription === 'free' && subscription === 'platinum') {
      if (propertyData.is_highlighted) checkHighlightLimit(sellerEmail);
      else if (propertyData.is_published) checkAnnouncementLimit(sellerEmail);
    }

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

    return { ...newProperty.dataValues, photos };
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    error.status = error.status || 500;
    throw error;
  }
}

export async function update(id, data, files, sellerEmail) {
  try {
    const validatedId = validateString(id);
    let newCoverUrl;
    let oldPhotosUrls = [];

    const oldProperty = await Property.findByPk(validatedId, { raw: true }, { attributes: { excludes: ['password'] } });
    if (!oldProperty) {
      throw new PropertyNotFound();
    }

    if ((oldProperty.owner_email !== sellerEmail
      && oldProperty.realtor_email !== sellerEmail
      && oldProperty.realstate_email !== sellerEmail)
      || (oldProperty.owner_email && oldProperty.owner_email !== sellerEmail)) {
      const error = new Error('Você não tem permissão para alterar este imóvel');
      error.status = 401;
      throw error;
    }

    const property = oldProperty;

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
    if (data.pool !== undefined) property.pool = validateBoolean(data.pool, 'O campo "piscina" é obrigatório');
    if (data.grill !== undefined) property.grill = validateBoolean(data.grill, 'O campo "churrasqueira" é obrigatório');
    if (data.airConditioning !== undefined) property.air_conditioning = validateBoolean(data.airConditioning, 'O campo "ar condicionado" é obrigatório');
    if (data.playground !== undefined) property.playground = validateBoolean(data.playground, 'O campo "playground" é obrigatório');
    if (data.eventArea !== undefined) property.event_area = validateBoolean(data.eventArea, 'O campo "sala de eventos" é obrigatório');
    if (data.description) property.description = validateString(data.description, 'O campo "descrição" é obrigatório');
    if (data.contact) property.contact = validatePhone(data.contact, 'O campo "telefone" é obrigatório');
    if (data.financiable !== undefined) property.financiable = validateBoolean(data.financiable);
    if (data.ownerEmail) property.owner_email = validateEmail(data.ownerEmail);
    if (data.realtorEmail) property.realtor_email = validateEmail(data.realtorEmail);
    if (data.realstateEmail) property.realstate_email = validateEmail(data.realstateEmail);
    if (data.complement) property.complement = validateString(data.complement);
    if (data.iptu) property.iptu = validatePrice(data.iptu);
    if (data.aditionalFees) property.aditional_fees = validatePrice(data.aditionalFees);
    if (data.negotiable !== undefined) property.negotiable = validateBoolean(data.negotiable);
    if (data.suites) property.suites = validateInteger(data.suites);
    if (data.furnished !== undefined) property.furnished = validateBoolean(data.furnished);
    if (data.gym !== undefined) property.gym = validateBoolean(data.gym);
    if (data.balcony !== undefined) property.balcony = validateBoolean(data.balcony);
    if (data.solarEnergy !== undefined) property.solar_energy = validateBoolean(data.solarEnergy);
    if (data.concierge !== undefined) property.concierge = validateBoolean(data.concierge);
    if (data.yard !== undefined) property.yard = validateBoolean(data.yard);
    if (data.isPublished !== undefined) property.is_published = validateBoolean(data.isPublished);
    if (data.oldPhotos) oldPhotosUrls = data.oldPhotos;

    if (data.isHighlighted !== undefined) {
      property.is_highlighted = validateBoolean(data.isHighlighted);
    }

    if (data.sellerEmail && data.sellerType === 'owner') property.owner_email = validateEmail(data.sellerEmail);
    if (data.sellerEmail && data.sellerType === 'realtor') property.realtor_email = validateEmail(data.sellerEmail);
    if (data.sellerEmail && data.sellerType === 'realstate') property.realstate_email = validateEmail(data.sellerEmail);

    if (data.newCover) newCoverUrl = data.newCover;

    if (!property.sell_price && !property.rent_price) {
      const error = new Error('É obrigatório o imóvel ter preço de venda ou preço de aluguel');
      error.status = 400;
      throw error;
    }

    const { subscription } = await find(sellerEmail);
    if (subscription === 'free' && subscription === 'platinum') {
      if (property.is_highlighted && !oldProperty.is_highlighted) {
        await checkHighlightLimit(sellerEmail);
      } else if (!property.is_published && oldProperty.is_published) {
        await checkAnnouncementLimit(sellerEmail);
      }
    }

    await Property.update(property, { where: { id: validatedId } });

    const oldPhotos = await Photo.findAll({
      where: { property_id: validatedId, url: { [Op.not]: oldPhotosUrls } },
      raw: true,
    });

    // delete photos that the user didn't want to keep
    await Promise.all(oldPhotos.map(async (photo) => {
      try {
        const storageRef = ref(storage, `images/properties/${validatedId}/${photo.name}`);
        await deleteObject(storageRef);
      } catch (error) { /* do nothing */ }
      await Photo.destroy({ where: { id: photo.id } });
    }));

    if (newCoverUrl) {
      const oldCover = await Photo.findOne({
        where: { property_id: validatedId, type: 'cover' },
        raw: true,
      });
      const newCover = await Photo.findOne({
        where: { property_id: validatedId, url: newCoverUrl },
        raw: true,
      });

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

        const exists = await Photo.findOne({
          where: { property_id: validatedId, url: downloadURL },
          raw: true,
        });

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

export async function shelve(id, email) {
  const validatedId = validateString(id);
  const property = await Property.findByPk(validatedId);
  if (!property) {
    throw new PropertyNotFound();
  }

  if (property.owner_email !== email
    && property.realtor_email !== email
    && property.realstate_email !== email) {
    const error = new Error('Você não tem permissão para arquivar este imóvel');
    error.status = 401;
    throw error;
  }

  await Property.update({ is_published: false, is_highlighted: false }, {
    where: { id: validatedId },
  });

  return { message: 'Imóvel arquivado com sucesso' };
}

export async function publish(id, email) {
  const validatedId = validateString(id);
  const property = await Property.findByPk(validatedId);
  if (!property) {
    throw new PropertyNotFound();
  }

  if (property.owner_email !== email
    && property.realtor_email !== email
    && property.realstate_email !== email) {
    const error = new Error('Você não tem permissão para arquivar este imóvel');
    error.status = 401;
    throw error;
  }

  const { subscription } = await find(email);
  if (subscription === 'free' && subscription === 'platinum') {
    if (property.is_highlighted && !property.is_highlighted) await checkHighlightLimit(email);
    else if (!property.is_published && property.is_published) await checkAnnouncementLimit(email);
  }

  return { message: 'Imóvel publicado com sucesso' };
}

export async function filter(data, page = 1, isHighlighted = false, isPublished = true, limit = 6) {
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
    if (data.pool !== undefined) where.pool = validateBoolean(data.pool);
    if (data.grill !== undefined) where.grill = validateBoolean(data.grill);
    if (data.playground !== undefined) where.playground = validateBoolean(data.playground);
    if (data.eventArea !== undefined) where.event_area = validateBoolean(data.eventArea);
    if (data.financiable !== undefined) where.financiable = validateBoolean(data.financiable);
    if (data.negotiable !== undefined) where.negotiable = validateBoolean(data.negotiable);
    if (data.suites) where.suites = validateInteger(data.suites);
    if (data.furnished !== undefined) where.furnished = validateBoolean(data.furnished);
    if (data.gym !== undefined) where.gym = validateBoolean(data.gym);
    if (data.balcony !== undefined) where.balcony = validateBoolean(data.balcony);
    if (data.solarEnergy !== undefined) where.solar_energy = validateBoolean(data.solarEnergy);
    if (data.concierge !== undefined) where.concierge = validateBoolean(data.concierge);
    if (data.yard !== undefined) where.yard = validateBoolean(data.yard);

    if (data.airConditioning !== undefined) {
      where.air_conditioning = validateBoolean(data.airConditioning);
    }

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

  if (!data.allProperties) {
    where.is_highlighted = isHighlighted;
    where.is_published = isPublished;
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
    if (property.realstate_email) editedProperty.email = editedProperty.realstate_email;
    if (property.realtor_email) editedProperty.email = editedProperty.realtor_email;

    editedProperty.shared = property.owner_email !== property.email;

    const seller = await find(editedProperty.email);

    const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

    return { ...editedProperty, pictures, seller };
  }));

  return { properties, pagination };
}

export async function destroy(id, email) {
  try {
    const validatedId = validateString(id);

    const user = await find(email);

    const property = await Property.findByPk(validatedId);
    if (!property) {
      throw new PropertyNotFound();
    }

    if (property.owner_email && property.owner_email !== user.email) {
      const error = new Error('Você não tem permissão para deletar este imóvel');
      error.status = 401;
      throw error;
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
