import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';

import Property from '../db/models/Property.js';
import Photo from '../db/models/Photo.js';
import { find } from './globalService.js';
import NoPropertiesFound from '../errors/propertyErrors/noPropertyFound.js';
import PropertyNotFound from '../errors/propertyErrors/properyNotFound.js';
import { validateString, validateInteger, validateBoolean, validatePhone, validatePrice, validateEmail, validateCep, validateUF } from '../validators/inputValidators.js';

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

    if (countTotal === 0) {
      throw new NoPropertiesFound();
    }

    const lastPage = Math.ceil(countTotal / limit);
    const offset = Number(limit * (page - 1));

    const props = await Property.findAll({
      order: [['cep', 'ASC']],
      offset,
      limit,
    });

    if (props.length === 0) {
      throw new NoPropertiesFound();
    }

    const properties = await Promise.all(props.map(async (property) => {
      const editedProperty = property;
      if (property.owner_email) editedProperty.email = editedProperty.owner_email;
      if (property.realtor_email) editedProperty.email = editedProperty.realtor_email;
      if (property.realstate_email) editedProperty.email = editedProperty.realstate_email;

      editedProperty.rent_price = parseFloat((property.rent_price / 100)).toFixed(2);
      editedProperty.sell_price = parseFloat((property.sell_price / 100)).toFixed(2);

      const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

      return { property: editedProperty, pictures };
    }));

    const pagination = {
      path: '/properties',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total: countTotal,
    };

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

    property.rent_price = parseFloat((property.rent_price / 100)).toFixed(2);
    property.sell_price = parseFloat((property.sell_price / 100)).toFixed(2);

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
      const editedProperty = property;
      if (property.owner_email) editedProperty.email = editedProperty.owner_email;
      if (property.realtor_email) editedProperty.email = editedProperty.realtor_email;
      if (property.realstate_email) editedProperty.email = editedProperty.realstate_email;

      editedProperty.rent_price = parseFloat((property.rent_price / 100)).toFixed(2);
      editedProperty.sell_price = parseFloat((property.sell_price / 100)).toFixed(2);

      const pictures = await Photo.findAll({ where: { property_id: property.id }, order: [['type', 'ASC']] });

      return { property: editedProperty, pictures };
    }));

    return properties;
  } catch (error) {
    error.message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    throw error;
  }
}

async function create(data, files) {
  try {
    const propertyData = {
      id: uuid(),
      announcement_type: validateString(data.announcementType, 'O campo "tipo do anúncio" é obrigatório'),
      property_type: validateString(data.propertyType, 'O campo "tipo do imóvel" é obrigatório'),
      cep: validateCep(data.cep),
      address: validateString(data.address, 'O campo "rua" é obrigatório'),
      house_number: validateString(data.houseNumber, 'O campo "numero" é obrigatório'),
      city: validateString(data.city, 'O campo "cidade" é obrigatório'),
      state: validateUF(data.state, 'O campo "estado" é obrigatório'),
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
      rent_price: data.rentPrice ? validatePrice(data.rentPrice) : null,
      sell_price: data.sellPrice ? validatePrice(data.sellPrice) : null,
      owner_email: data.sellerEmail && data.sellerType === 'owner' ? validateEmail(data.sellerEmail) : null,
      realtor_email: data.sellerEmail && data.sellerType === 'realtor' ? validateEmail(data.sellerEmail) : null,
      realstate_email: data.sellerEmail && data.sellerType === 'realstate' ? validateEmail(data.sellerEmail) : null,
      complement: data.complement ? validateString(data.complement) : null,
      floor: data.floor ? validateString(data.floor) : null,
      latitude: data.latitude ? validateString(data.latitude) : null,
      longitude: data.longitude ? validateString(data.longitude) : null,
    };

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

async function update(id, data, files) {
  try {
    const validatedId = validateInteger(id);

    const oldProperProperty = await Property.findByPk(validatedId);
    if (!oldProperProperty) {
      throw new PropertyNotFound();
    }

    const property = {
      announcement_type: data.announcementType ? validateString(data.announcementType) : oldProperProperty.announcement_type,
      property_type: data.propertyType ? validateString(data.propertyType) : oldProperProperty.property_type,
      cep: data.cep ? validateCep(data.cep) : oldProperProperty.cep,
      address: data.address ? validateString(data.address) : oldProperProperty.address,
      house_number: data.houseNumber ? validateString(data.houseNumber) : oldProperProperty.house_number,
      city: data.city ? validateString(data.city) : oldProperProperty.city,
      state: data.state ? validateUF(data.state) : oldProperProperty.state,
      district: data.district ? validateString(data.district) : oldProperProperty.district,
      size: data.size ? validateInteger(data.size) : oldProperProperty.size,
      bedrooms: data.bedrooms ? validateInteger(data.bedrooms) : oldProperProperty.bedrooms,
      bathrooms: data.bathrooms ? validateInteger(data.bathrooms) : oldProperProperty.bathrooms,
      parking_spaces: data.parkingSpaces ? validateInteger(data.parkingSpaces) : oldProperProperty.parking_spaces,
      pool: data.pool ? validateBoolean(data.pool) : oldProperProperty.pool,
      grill: data.grill ? validateBoolean(data.grill) : oldProperProperty.grill,
      air_conditioning: data.airConditioning ? validateBoolean(data.airConditioning) : oldProperProperty.air_conditioning,
      playground: data.playground ? validateBoolean(data.playground) : oldProperProperty.playground,
      event_area: data.eventArea ? validateBoolean(data.eventArea) : oldProperProperty.event_area,
      description: data.description ? validateString(data.description) : oldProperProperty.description,
      contact: data.contact ? validatePhone(data.contact) : oldProperProperty.contact,
      financiable: data.financiable ? validateBoolean(data.financiable) : oldProperProperty.financiable,
      rent_price: data.rentPrice ? validatePrice(data.rentPrice) : oldProperProperty.rent_price,
      sell_price: data.sellPrice ? validatePrice(data.sellPrice) : oldProperProperty.sell_price,
      owner_email: data.sellerEmail && data.sellerType === 'owner' ? validateEmail(data.sellerEmail) : oldProperProperty.owner_email,
      realtor_email: data.sellerEmail && data.sellerType === 'realtor' ? validateEmail(data.sellerEmail) : oldProperProperty.realtor_email,
      realstate_email: data.sellerEmail && data.sellerType === 'realstate' ? validateEmail(data.sellerEmail) : oldProperProperty.realstate_email,
      complement: data.complement ? validateString(data.complement) : oldProperProperty.complement,
      floor: data.floor ? validateString(data.floor) : oldProperProperty.floor,
      latitude: data.latitude ? validateString(data.latitude) : oldProperProperty.latitude,
      longitude: data.longitude ? validateString(data.longitude) : oldProperProperty.longitude,
    };

    const updatedProperty = await Property.create(property);

    await Photo.destroy({ where: { property_id: updatedProperty.id } });

    const photos = await Promise.all(files.map(async (picture) => {
      const storageRef = ref(storage, `images/properties/${updatedProperty.id}/${picture.fieldname}-${picture.originalname}`);
      const metadata = { contentType: picture.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, picture.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      await Photo.create({ property_id: updatedProperty.id, url: downloadURL });

      return { name: `${picture.fieldname}-${picture.originalname}`, type: picture.mimetype, downloadURL };
    }));

    return { updatedProperty, photos };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

async function destroy(id) {
  try {
    const validatedId = validateInteger(id);

    if (!await Property.findByPk(validatedId)) {
      throw new PropertyNotFound();
    }
    await Property.destroy({ where: { id: validatedId } });
    return { message: 'Usuário apagado com sucesso' };
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
}

export { findAll, findByPk, findBySellerEmail, create, update, destroy };
