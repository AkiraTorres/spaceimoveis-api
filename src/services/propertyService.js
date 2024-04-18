import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

import Property from '../db/models/Property.js';
import Photo from '../db/models/Photo.js';
import { find } from './globalService.js';
import NoPropertiesFound from '../errors/propertyErrors/noPropertyFound.js';
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
      editedProperty.rent_price = parseFloat((property.rent_price / 100)).toFixed(2);
      editedProperty.sell_price = parseFloat((property.sell_price / 100)).toFixed(2);

      const pictures = await Photo.findAll({ where: { property_id: property.id } });

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
    const validatedId = validateInteger(id);

    const property = await Property.findByPk(validatedId);

    if (!property) {
      throw new PropertyNotFound();
    }

    property.rent_price = parseFloat((property.rent_price / 100)).toFixed(2);
    property.sell_price = parseFloat((property.sell_price / 100)).toFixed(2);

    const pictures = await Photo.findAll({ where: { property_id: validatedId } });

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
      editedProperty.rent_price = parseFloat((property.rent_price / 100)).toFixed(2);
      editedProperty.sell_price = parseFloat((property.sell_price / 100)).toFixed(2);

      const pictures = await Photo.findAll({ where: { property_id: property.id } });

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
