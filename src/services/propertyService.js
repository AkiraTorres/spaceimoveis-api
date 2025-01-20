import sgMail from '@sendgrid/mail';
import axios from 'axios';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';

import firebaseConfig from '../config/firebase.js';
import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import {
  validateAnnouncementType,
  validateBoolean,
  validateCep,
  validateEmail,
  validateFurnished,
  validateInteger,
  validatePhone,
  validatePrice,
  validatePropertyType,
  validateString,
  validateUF,
} from '../validators/inputValidators.js';
import FavoriteService from './favoriteService.js';
import UserService from './userService.js';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const apiKey = process.env.API_KEY;

export default class PropertyService {
  static async checkHighlightLimit(email) {
    let highlightLimit;
    const { subscription } = await prisma.user.find(email);
    if (subscription === 'free') highlightLimit = 1;
    if (subscription === 'platinum') highlightLimit = 3;
    if (subscription === 'gold') highlightLimit = 9999;
    if (subscription === 'diamond') highlightLimit = 9999;

    const totalHighlightedProperties = await prisma.property.count({ where: { email, isHighlighted: true }, include: { SharedProperties: true } });

    if (totalHighlightedProperties >= highlightLimit) throw new ConfigurableError('Limite de destaques atingido', 400);
  }

  static async checkPublishLimit(email) {
    let limit;
    const { subscription } = await prisma.user.find(email);
    if (subscription === 'free') limit = 3;
    if (subscription === 'platinum') limit = 5;
    if (subscription === 'gold') limit = 9999;
    if (subscription === 'diamond') limit = 9999;

    const totalProperties = await prisma.property.count({ where: { email, isHighlighted: false, isPublished: true }, include: { SharedProperties: true } });

    if (totalProperties >= limit) throw new ConfigurableError('Limite de destaques atingido', 400);
  }

  static async checkLimits(email) {
    const validatedEmail = validateEmail(email);

    // const { subscription } = await UserService.find({ email: validatedEmail });

    const totalPublishProperties = await prisma.property.count({ where: { advertiserEmail: validatedEmail, isHighlight: false, isPublished: true } });
    const totalHighlightedProperties = await prisma.property.count({ where: { advertiserEmail: validatedEmail, isHighlight: true } });

    const userInfo = await prisma.userInfo.findFirst({ where: { email: validatedEmail } });

    return { totalPublishProperties, totalHighlightedProperties, publishLimit: userInfo.publishLimit, highlightLimit: userInfo.highlightLimit };
  }

  static async getPropertyDetails(propertyId) {
    const property = await prisma.property.findFirst({ where: { id: propertyId } });

    property.address = await prisma.propertiesAddresses.findFirst({ where: { propertyId: property.id } });
    property.commodities = await prisma.propertiesCommodities.findFirst({ where: { propertyId: property.id } });
    property.prices = await prisma.propertiesPrices.findFirst({ where: { propertyId: property.id } });
    property.shared = await prisma.sharedProperties.findFirst({ where: { propertyId: property.id, email: property.advertiserEmail } }) || false;
    property.totalFavorites = await FavoriteService.getPropertyTotalFavorites(property.id);
    property.pictures = await prisma.propertyPictures.findMany({ where: { propertyId: property.id }, orderBy: { type: 'asc' } });
    property.seller = await UserService.find({ email: property.advertiserEmail });

    return property;
  }

  static async getCoordinates(address) {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    const response = await axios.get(url);
    if (response.data.status === 'OK') {
      const { location } = response.data.results[0].geometry;
      return location;
    }
    throw new ConfigurableError('Erro ao buscar coordenadas', 500);
  }

  static async findAll(page = 1, isHighlight = false, isPublished = true, take = 6) {
    if (page < 1) throw new ConfigurableError('Página inválida', 400);

    const where = { isHighlight, isPublished, verified: 'verified' };
    const countTotal = await prisma.property.count({ where });
    const lastPage = Math.ceil(countTotal / take);
    const skip = Number(take * (page - 1));

    const props = await prisma.property.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip,
      take,
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

    const properties = await Promise.all(props.map(async (property) => this.getPropertyDetails(property.id)));

    properties.sort((a, b) => {
      if (a.totalFavorites !== b.totalFavorites) return b.totalFavorites - a.totalFavorites;
      return b.timesSeen - a.timesSeen;
    });

    return { properties, pagination };
  }

  static async recommendedProperties(isHighlighted = true) {
    const where = { isHighlighted, verified: 'verified' };
    const orderBy = { updatedAt: 'desc' };

    const props = await prisma.property.findMany({ where, orderBy });
    let properties = await Promise.all(props.map(async (property) => this.propertyDetails(property)));

    const d = new Date();
    const fifteenDaysInMilliseconds = 15 * 24 * 60 * 60 * 1000;
    properties = properties.filter((property) => {
      if (properties.length <= 6) return true;
      return !((d - property.updatedAt >= fifteenDaysInMilliseconds)
      && (Math.abs(d.getDate() - property.updatedAt.getDate())) % 2 === 0);
    });

    properties.sort((a, b) => {
      if (a.totalFavorites !== b.totalFavorites) return b.totalFavorites - a.totalFavorites;
      return b.timesSeen - a.timesSeen;
    });

    return properties.slice(0, 6);
  }

  static async findByPk(id) {
    const validatedId = validateString(id);

    const property = await prisma.property.findFirst({ where: { id: validatedId } });
    if (!property) throw new ConfigurableError('Imóvel não encontrado', 404);

    return this.getPropertyDetails(property.id);
  }

  static async findBySellerEmail(email, page = 1, take = 6) {
    const validatedEmail = validateEmail(email);

    const user = await UserService.find({ email: validatedEmail });

    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const total = await prisma.property.count({ where: { advertiserEmail: validatedEmail } });
    const lastPage = Math.ceil(total / take);
    const skip = Number(take * (page - 1));

    const pagination = {
      path: '/properties',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= lastPage ? Number(page) + 1 : null,
      lastPage,
      total,
    };

    const props = await prisma.property.findMany({
      where: { advertiserEmail: validatedEmail },
      orderBy: [{ updatedAt: 'desc' }],
      take,
      skip,
    });

    const properties = await Promise.all(props.map(async (property) => this.getPropertyDetails(property.id)));

    properties.sort((a, b) => {
      if (a.totalFavorites !== b.totalFavorites) return b.totalFavorites - a.totalFavorites;
      return b.timesSeen - a.timesSeen;
    });

    return { properties, pagination };
  }

  static async getAllPropertiesIds(email) {
    const user = await this.find(validateEmail(email));
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const properties = await prisma.property.findMany({ where: { email: user.email }, select: { id: true } });

    return properties.map((property) => property.id);
  }

  static async getAllPropertiesCities(email) {
    const user = await UserService.find({ email: validateEmail(email) });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const properties = await prisma.property.findMany({ where: { email: user.email }, attributes: { city: true } });
    const cities = properties.map((property) => property.city);
    return [...new Set(cities)];
  }

  static async getTimesSeen(id) {
    const validatedId = validateString(id);
    const property = await prisma.property.findFirst({ where: { id: validatedId } });
    if (!property) throw new ConfigurableError('Imóvel não encontrado', 404);

    return property.timesSeen;
  }

  static async addTimesSeen(id) {
    const validatedId = validateString(id);
    const property = await prisma.property.findFirst({ where: { id: validatedId } });
    if (!property) throw new ConfigurableError('Imóvel não encontrado', 404);

    await prisma.visualization.create({ data: { propertyId: validatedId } });

    return prisma.property.update({ where: { id: validatedId }, data: { timesSeen: (property.timesSeen + 1) } });
    // await prisma.sharedProperties.update({ where: { id: sharedProperty.id, email: validatedEmail }, data: { accepted: true } });
  }

  static async getMostSeenPropertiesBySeller(email, take = 6) {
    const user = await UserService.find({ email: validateEmail(email) });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const props = await prisma.property.findMany({
      where: { email: user.email, verified: 'verified' },
      orderBy: { timesSeen: 'desc' },
      take,
    });

    return Promise.all(props.map(async (property) => this.getPropertyDetails(property.id)));
  }

  static async create(params, files) {
    const { sellerEmail } = params;
    const data = {
      id: uuid(),
      advertiserEmail: validateEmail(sellerEmail),
      announcementType: validateAnnouncementType(params.announcementType, 'O campo "tipo do anúncio" é obrigatório'),
      propertyType: validatePropertyType(params.propertyType, 'O campo "tipo do imóvel" é obrigatório'),
      isHighlight: params.isHighlight ? validateBoolean(params.isHighlight) : false,
      isPublished: params.isPublished ? validateBoolean(params.isPublished) : false,
      floor: params.floor ? validateInteger(params.floor) : 1,
      size: validateInteger(params.size),
      bathrooms: params.bathrooms ? validateInteger(params.bathrooms) : 0,
      bedrooms: params.bedrooms ? validateInteger(params.bedrooms) : 0,
      parkingSpaces: params.parkingSpaces ? validateInteger(params.parkingSpaces) : 0,
      description: validateString(params.description, 'O campo "descrição" é obrigatório'),
      contact: validatePhone(params.contact, 'O campo "telefone" é obrigatório'),
      financiable: params.financiable ? validateBoolean(params.financiable) : false,
      negotiable: params.negotiable ? validateBoolean(params.negotiable) : false,
      suites: params.suites ? validateInteger(params.suites) : 0,
      furnished: params.furnished ? validateFurnished(params.furnished) : 'no',
      verified: 'verified', // TODO: change to 'pending' when moving to production
    };
    if (data.isHighlight) data.isPublished = true;

    const pricesData = {
      propertyId: data.id,
      rentPrice: params.rentPrice || data.announcementType !== 'sell' ? validatePrice(params.rentPrice, 'O campo "preço de aluguel" é obrigatório') : null,
      sellPrice: params.sellPrice || data.announcementType !== 'rent' ? validatePrice(params.sellPrice, 'O campo "preço de venda" é obrigatório') : null,
      iptu: params.iptu ? validatePrice(params.iptu) : null,
      aditionalFees: params.aditionalFees ? validatePrice(params.aditionalFees) : null,
      deposit: params.deposit ? validatePrice(params.deposit) : null,
      timesDeposit: params.timesDeposit ? validateInteger(params.timesDeposit) : null,
      depositInstallments: params.depositInstallments ? validateInteger(params.depositInstallments) : null,
    };

    if (pricesData.deposit === -1) pricesData.deposit = null;
    if (pricesData.timesDeposit === -1) pricesData.timesDeposit = null;
    if (pricesData.depositInstallments === -1) pricesData.depositInstallments = null;

    const addressData = {
      propertyId: data.id,
      cep: validateString(params.cep, 'O campo "cep" é obrigatório'),
      street: validateString(params.street, 'O campo "rua" é obrigatório'),
      number: params.number ? validateString(params.number) : null,
      city: validateString(params.city, 'O campo "cidade" é obrigatório'),
      state: validateUF(params.state),
      neighborhood: validateString(params.neighborhood, 'O campo "bairro" é obrigatório'),
      complement: params.complement ? validateString(params.complement) : null,
    };

    const location = `${addressData.street}, ${addressData.street} - ${addressData.neighborhood}, ${addressData.city} - ${addressData.state}, ${addressData.cep}`;
    const addressLocation = await this.getCoordinates(location);
    addressData.latitude = addressLocation.lat.toString();
    addressData.longitude = addressLocation.lng.toString();

    const commoditiesData = { propertyId: data.id };
    if (params.pool !== undefined) commoditiesData.pool = validateBoolean(params.pool);
    if (params.grill !== undefined) commoditiesData.grill = validateBoolean(params.grill);
    if (params.airConditioning !== undefined) commoditiesData.airConditioning = validateBoolean(params.airConditioning);
    if (params.playground !== undefined) commoditiesData.playground = validateBoolean(params.playground);
    if (params.eventArea !== undefined) commoditiesData.eventArea = validateBoolean(params.eventArea);
    if (params.gourmetArea !== undefined) commoditiesData.gourmetArea = validateBoolean(params.gourmetArea);
    if (params.garden !== undefined) commoditiesData.garden = validateBoolean(params.garden);
    if (params.porch !== undefined) commoditiesData.porch = validateBoolean(params.porch);
    if (params.slab !== undefined) commoditiesData.slab = validateBoolean(params.slab);
    if (params.gatedCommunity !== undefined) commoditiesData.gatedCommunity = validateBoolean(params.gatedCommunity);
    if (params.gym !== undefined) commoditiesData.gym = validateBoolean(params.gym);
    if (params.balcony !== undefined) commoditiesData.balcony = validateBoolean(params.balcony);
    if (params.solarEnergy !== undefined) commoditiesData.solarEnergy = validateBoolean(params.solarEnergy);
    if (params.concierge !== undefined) commoditiesData.concierge = validateBoolean(params.concierge);
    if (params.yard !== undefined) commoditiesData.yard = validateBoolean(params.yard);
    if (params.elevator !== undefined) commoditiesData.elevator = validateBoolean(params.elevator);

    const { subscription } = await UserService.find({ email: sellerEmail });
    if (subscription === 'free' || subscription === 'platinum') {
      if (data.isHighlight) this.checkHighlightLimit(sellerEmail);
      else this.checkPublishLimit(sellerEmail);
    }

    await prisma.$transaction(async (p) => {
      const createdProperty = await p.property.create({ data });

      await p.propertiesPrices.create({ data: pricesData });

      await p.propertiesAddresses.create({ data: addressData });

      await p.propertiesCommodities.create({ data: commoditiesData });

      await Promise.all(files.map(async (picture) => {
        const storageRef = ref(storage, `images/properties/${data.id}/${picture.originalname}`);
        const metadata = { contentType: picture.mimetype };
        const snapshot = await uploadBytesResumable(storageRef, picture.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const pictureData = {
          id: uuid(),
          propertyId: data.id,
          url: downloadURL,
          name: `${picture.originalname}`,
          type: picture.fieldname,
        };

        await p.propertyPictures.create({ data: pictureData });

        return { name: `${picture.originalname}`, type: picture.mimetype, downloadURL };
      }));

      return createdProperty;
    });

    return this.getPropertyDetails(data.id);
  }

  static async update(id, params, files, sellerEmail) {
    const validatedId = validateString(id);
    const validatedSellerEmail = validateEmail(sellerEmail);
    let oldPhotosUrls = [];

    const oldProperty = await prisma.property.findFirst({ where: { id: validatedId } });
    if (!oldProperty) throw new ConfigurableError('Imóvel não encontrado', 404);

    if (validatedSellerEmail !== oldProperty.advertiserEmail) throw new ConfigurableError('Você não tem permissão para editar este imóvel', 401);

    const updatedData = {
      advertiserEmail: params.advertiserEmail ? validateEmail(params.advertiserEmail) : oldProperty.advertiserEmail,
      announcementType: params.announcementType ? validateAnnouncementType(params.announcementType) : oldProperty.announcementType,
      propertyType: params.propertyType ? validatePropertyType(params.propertyType) : oldProperty.propertyType,
      isHighlight: params.isHighlight ? validateBoolean(params.isHighlight) : oldProperty.isHighlight,
      isPublished: params.isPublished ? validateBoolean(params.isPublished) : oldProperty.isPublished,
      floor: params.floor ? validateInteger(params.floor) : oldProperty.floor,
      size: params.size ? validateInteger(params.size) : oldProperty.size,
      bathrooms: params.bathrooms ? validateInteger(params.bathrooms) : oldProperty.bathrooms,
      bedrooms: params.bedrooms ? validateInteger(params.bedrooms) : oldProperty.bedrooms,
      parkingSpaces: params.parkingSpaces ? validateInteger(params.parkingSpaces) : oldProperty.parkingSpaces,
      description: params.description ? validateString(params.description) : oldProperty.description,
      contact: params.contact ? validatePhone(params.contact) : oldProperty.contact,
      financiable: params.financiable ? validateBoolean(params.financiable) : oldProperty.financiable,
      negotiable: params.negotiable ? validateBoolean(params.negotiable) : oldProperty.negotiable,
      suites: params.suites ? validateInteger(params.suites) : oldProperty.suites,
      furnished: params.furnished ? validateFurnished(params.furnished) : oldProperty.furnished,
    };
    if (updatedData.isHighlight) updatedData.isPublished = true;

    const updatedPrices = {
      rentPrice: params.rentPrice && updatedData.announcementType !== 'sell' ? validatePrice(params.rentPrice) : oldProperty.rentPrice,
      sellPrice: params.sellPrice && updatedData.announcementType !== 'rent' ? validatePrice(params.sellPrice) : oldProperty.sellPrice,
      iptu: params.iptu ? validatePrice(params.iptu) : oldProperty.iptu,
      aditionalFees: params.aditionalFees ? validatePrice(params.aditionalFees) : oldProperty.aditionalFees,
      deposit: params.deposit ? validatePrice(params.deposit) : oldProperty.deposit,
      timesDeposit: params.timesDeposit ? validateInteger(params.timesDeposit) : oldProperty.timesDeposit,
      depositInstallments: params.depositInstallments ? validateInteger(params.depositInstallments) : oldProperty.depositInstallments,
    };

    if (updatedPrices.deposit === -1) updatedPrices.deposit = null;
    if (updatedPrices.timesDeposit === -1) updatedPrices.timesDeposit = null;
    if (updatedPrices.depositInstallments === -1) updatedPrices.depositInstallments = null;

    const updatedAddress = {
      cep: params.cep ? validateCep(params.cep) : oldProperty.cep,
      number: params.number ? validateString(params.number) : oldProperty.number,
      city: params.city ? validateString(params.city) : oldProperty.city,
      state: params.state ? validateUF(params.state) : oldProperty.state,
      neighborhood: params.neighborhood ? validateString(params.neighborhood) : oldProperty.neighborhood,
      complement: params.complement ? validateString(params.complement) : oldProperty.complement,
    };

    // const location = `${updatedAddress.street}, ${updatedAddress.street} - ${updatedAddress.neighborhood}, ${updatedAddress.city} - ${updatedAddress.state}, ${updatedAddress.cep}`;
    // const addressLocation = await this.getCoordinates(location);
    // updatedAddress.latitude = addressLocation.lat.toString() || oldProperty.latitude;
    // updatedAddress.longitude = addressLocation.lng.toString() || oldProperty.longitude;

    const updatedCommodities = {
      pool: params.pool ? validateBoolean(params.pool) : oldProperty.pool,
      grill: params.grill ? validateBoolean(params.grill) : oldProperty.grill,
      airConditioning: params.airConditioning ? validateBoolean(params.airConditioning) : oldProperty.airConditioning,
      playground: params.playground ? validateBoolean(params.playground) : oldProperty.playground,
      eventArea: params.eventArea ? validateBoolean(params.eventArea) : oldProperty.eventArea,
      gourmetArea: params.gourmetArea ? validateBoolean(params.gourmetArea) : oldProperty.gourmetArea,
      garden: params.garden ? validateBoolean(params.garden) : oldProperty.garden,
      porch: params.porch ? validateBoolean(params.porch) : oldProperty.porch,
      slab: params.slab ? validateBoolean(params.slab) : oldProperty.slab,
      gatedCommunity: params.gatedCommunity ? validateBoolean(params.gatedCommunity) : oldProperty.gatedCommunity,
      gym: params.gym ? validateBoolean(params.gym) : oldProperty.gym,
      balcony: params.balcony ? validateBoolean(params.balcony) : oldProperty.balcony,
      solarEnergy: params.solarEnergy ? validateBoolean(params.solarEnergy) : oldProperty.solarEnergy,
      concierge: params.concierge ? validateBoolean(params.concierge) : oldProperty.concierge,
      yard: params.yard ? validateBoolean(params.yard) : oldProperty.yard,
      elevator: params.elevator ? validateBoolean(params.elevator) : oldProperty.elevator,
    };

    if (updatedData.isHighlight && !oldProperty.isHighlight) await this.checkHighlightLimit(validatedSellerEmail);
    if (updatedData.isPublished && !oldProperty.isPublished) await this.checkPublishLimit(validatedSellerEmail);

    // TODO: enable this line again when in production
    // if (updatedData.description !== oldProperty.description || files.length > 0) updatedData.verified = 'pending';

    const property = await prisma.property.update({ where: { id: validatedId }, data: updatedData });
    property.prices = await prisma.propertiesPrices.update({ where: { propertyId: validatedId }, data: updatedPrices });
    property.address = await prisma.propertiesAddresses.update({ where: { propertyId: validatedId }, data: updatedAddress });
    property.commodities = await prisma.propertiesCommodities.update({ where: { propertyId: validatedId }, data: updatedCommodities });

    if (params.oldPhotos) oldPhotosUrls = params.oldPhotos;
    const oldPhotos = await prisma.propertyPictures.findMany({ where: { propertyId: validatedId, url: { not: { in: oldPhotosUrls } } } });

    // delete photos that the user didn't want to keep
    await Promise.all(oldPhotos.map(async (photo) => {
      try {
        const storageRef = ref(storage, `images/properties/${validatedId}/${photo.name}`);
        await deleteObject(storageRef);
      } catch (error) { /* do nothing */ }
      await prisma.propertyPictures.delete({ where: { id: photo.id } });
    }));

    if (params.newCover) {
      const oldCover = await prisma.propertyPictures.findFirst({ where: { propertyId: validatedId, type: 'cover' } });
      const newCover = await prisma.propertyPictures.findFirst({ where: { propertyId: validatedId, url: params.newCover } });
      // TODO: needs to validate params.newCover without breaking the string

      if (oldCover && newCover && !(oldCover.url === newCover.url)) {
        await prisma.propertyPictures.update({ where: { id: oldCover.id }, data: { type: 'photo' } });
        await prisma.propertyPictures.update({ where: { id: newCover.id }, data: { type: 'cover' } });
      } else if (!oldCover && newCover) {
        await prisma.propertyPictures.update({ where: { id: newCover.id }, data: { type: 'cover' } });
      } else if (!newCover) throw new ConfigurableError('Nova foto de capa não encontrada', 404);
    }

    // add new photos send by user
    if (files.length > 0) {
      await Promise.all(files.map(async (picture) => {
        // change cover photo if send by user
        const storageRef = ref(storage, `images/properties/${validatedId}/${picture.originalname}`);
        const metadata = { contentType: picture.mimetype };
        const snapshot = await uploadBytesResumable(storageRef, picture.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const exists = await prisma.propertyPictures.findFirst({ where: { propertyId: validatedId, url: downloadURL } });

        if (!exists) {
          if (picture.fieldname === 'cover') {
            const oldCover = await prisma.propertyPictures.findFirst({ where: { propertyId: validatedId, type: 'cover' } });
            if (oldCover) await prisma.propertyPictures.update({ where: { id: oldCover.id }, data: { type: 'photo' } });
          }

          const pictureData = {
            id: uuid(),
            name: `${picture.originalname}`,
            propertyId: validatedId,
            url: downloadURL,
            type: picture.fieldname,
          };

          await prisma.propertyPictures.create({ data: pictureData });
          return { name: `${picture.originalname}`, type: picture.mimetype, downloadURL };
        }

        return null;
      }));
    }

    await prisma.propertyPictures.findMany({ where: { propertyId: validatedId }, orderBy: { type: 'asc' } });

    return this.getPropertyDetails(validatedId);
  }

  static async shelve(id, email) {
    const validatedId = validateString(id);
    const property = await prisma.property.findFirst({ where: { id: validatedId } });
    if (!property) throw new ConfigurableError('Imóvel não encontrado', 404);

    if (property.advertiserEmail !== email) throw new ConfigurableError('Você não tem permissão para arquivar este imóvel', 401);

    await prisma.property.update({ where: { id: validatedId }, data: { isPublished: false, isHighlight: false } });

    return { message: 'Imóvel arquivado com sucesso' };
  }

  static async publish(id, email) {
    const validatedId = validateString(id);
    const property = await prisma.property.findFirst({ where: { id: validatedId } });
    if (!property) throw new ConfigurableError('Imóvel não encontrado', 404);

    if (property.advertiserEmail !== email) throw new ConfigurableError('Você não tem permissão para arquivar este imóvel', 401);

    const { subscription } = await this.find(email);
    if (subscription === 'free' && subscription === 'platinum') {
      if (property.isHighlight && !property.isHighlight) await this.checkHighlightLimit(email);
    }

    return { message: 'Imóvel publicado com sucesso' };
  }

  static async destroy(id, email) {
    const validatedId = validateString(id);

    const property = await prisma.property.findFirst({ where: { id: validatedId } });
    if (!property) throw new ConfigurableError('Imóvel não encontrado', 404);
    if (property.advertiserEmail !== email) throw new ConfigurableError('Você não tem permissão para deletar este imóvel', 401);

    const photos = await prisma.propertyPictures.findMany({ where: { propertyId: validatedId } });
    await prisma.property.delete({ where: { id: validatedId } });

    if (photos.length > 0) {
      await Promise.all(photos.map(async (photo) => {
        const storageRef = ref(storage, `images/properties/${validatedId}/${photo.name}`);
        await deleteObject(storageRef);
      }));
    }

    return { message: 'Propriedade apagada com sucesso' };
  }

  static async filter(filters, verified, page = 1, take = 6, path = '/properties/filter') {
    const where = {
      // Filter based on default properties fields
      advertiserEmail: filters.advertiserEmail ? validateEmail(filters.advertiserEmail) : undefined,
      announcementType: filters.announcementType ? validateAnnouncementType(filters.announcementType) : undefined,
      propertyType: filters.propertyType ? validatePropertyType(filters.propertyType) : undefined,
      isHighlight: filters.isHighlight ? validateBoolean(filters.isHighlight) : undefined,
      isPublished: filters.isPublished ? validateBoolean(filters.isPublished) : undefined,
      size: {
        gte: filters.minSize ? validatePrice(filters.minSize) : 0,
        lte: filters.maxSize ? validatePrice(filters.maxSize) : 999999999,
      },
      bathrooms: filters.bathrooms ? filters.bathrooms : undefined,
      bedrooms: filters.bedrooms ? filters.bedrooms : undefined,
      parkingSpaces: filters.parkingSpaces ? filters.parkingSpaces : undefined,
      financiable: filters.financiable ? validateBoolean(filters.financiable) : undefined,
      negotiable: filters.negotiable ? validateBoolean(filters.negotiable) : undefined,
      suites: filters.suites ? validateInteger(filters.suites) : undefined,
      furnished: filters.furnished ? validateFurnished(filters.furnished) : undefined,

      // Filter by location, using related table PropertiesAddresses
      PropertiesAddresses: {
        city: filters.city ? validateString(filters.city) : undefined,
        state: filters.state ? validateUF(filters.state) : undefined,
        neighborhood: filters.neighborhood ? validateString(filters.neighborhood) : undefined,
        latitude: filters.latitude ? validateString(filters.latitude) : undefined,
        longitude: filters.longitude ? validateString(filters.longitude) : undefined,
      },

      // Filter by prices, using related table PropertiesPrices
      // Prices with OR condition
      OR: [
        filters.announcementType !== 'sell' && {
          PropertiesPrices: {
            rentPrice: {
              gte: filters.minPrice ? validatePrice(filters.minPrice) : 0,
              lte: filters.maxPrice ? validatePrice(filters.maxPrice) : 999999999,
            },
          },
        },
        filters.announcementType !== 'rent' && {
          PropertiesPrices: {
            sellPrice: {
              gte: filters.minPrice ? validatePrice(filters.minPrice) : 0,
              lte: filters.maxPrice ? validatePrice(filters.maxPrice) : 999999999,
            },
          },
        },
      ].filter(Boolean), // Remove any `false` or `undefined` from the array

      // Filter by property amenities, using related table PropertiesCommodities
      PropertiesCommodities: {
        pool: filters.pool !== undefined ? validateBoolean(filters.pool) : undefined,
        grill: filters.grill !== undefined ? validateBoolean(filters.grill) : undefined,
        airConditioner: filters.airConditioner !== undefined ? validateBoolean(filters.airConditioner) : undefined,
        playground: filters.playground !== undefined ? validateBoolean(filters.playground) : undefined,
        eventArea: filters.eventArea !== undefined ? validateBoolean(filters.eventArea) : undefined,
        gourmetArea: filters.gourmetArea !== undefined ? validateBoolean(filters.gourmetArea) : undefined,
        garden: filters.garden !== undefined ? validateBoolean(filters.garden) : undefined,
        porch: filters.porch !== undefined ? validateBoolean(filters.porch) : undefined,
        slab: filters.slab !== undefined ? validateBoolean(filters.slab) : undefined,
        gatedCommunity: filters.gatedCommunity !== undefined ? validateBoolean(filters.gatedCommunity) : undefined,
        gym: filters.gym !== undefined ? validateBoolean(filters.gym) : undefined,
        balcony: filters.balcony !== undefined ? validateBoolean(filters.balcony) : undefined,
        solarEnergy: filters.solarEnergy !== undefined ? validateBoolean(filters.solarEnergy) : undefined,
        concierge: filters.concierge !== undefined ? validateBoolean(filters.concierge) : undefined,
        yard: filters.yard !== undefined ? validateBoolean(filters.yard) : undefined,
        // elevator: filters.elevator !== undefined ? validateBoolean(filters.elevator) : undefined,
      },
    };
    if (verified) where.verified = 'verified';

    const properties = await prisma.property.findMany({
      where,
      // orderBy: filters.orderBy ? filters.orderBy : { updatedAt: 'desc' },
      skip: Number(take * (page - 1)),
      take: Number(take),
      include: {
        PropertiesPrices: true,
        PropertiesAddresses: true,
        PropertiesCommodities: true,
        PropertyPictures: true,
      },
    });

    const total = await prisma.property.count({ where });

    const pagination = {
      path,
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: page + 1 <= Math.ceil(total / take) ? page + 1 : null,
      lastPage: Math.ceil(total / take),
      total,
    };

    const result = await Promise.all(properties.map((property) => this.getPropertyDetails(property.id)));

    return { result, pagination };
  }

  static async shareProperty(propertyId, ownerEmail, guestEmail) {
    const validatedPropertyId = validateString(propertyId);
    const validatedOwnerEmail = validateEmail(ownerEmail);
    const validatedGuestEmail = validateEmail(guestEmail);

    const owner = await UserService.find({ email: validatedOwnerEmail }, 'owner');
    if (!owner) throw new ConfigurableError('Dono do imóvel não encontrado', 404);

    const guest = await UserService.find({ email: validatedGuestEmail });
    if (!guest) throw new ConfigurableError('O usuário que você tentou compartilhar o imóvel não encontrado', 404);

    const property = await prisma.property.findFirst(validatedPropertyId);
    if (!property) throw new ConfigurableError('Imóvel não encontrado', 404);

    const shared = prisma.sharedProperties.findFirst({ where: { email: validatedGuestEmail, propertyId: validatedPropertyId } });
    if (shared) throw new ConfigurableError('Imóvel já compartilhado com este usuário', 400);

    await prisma.sharedProperties.create({ id: uuid(), email: validatedGuestEmail, propertyId: validatedPropertyId });

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: validatedGuestEmail,
      subject: 'Compartilhamento de Imóvel',
      text: `O proprietário ${owner.name}, dono de uma casa na cidade de ${property.city}-${property.state} compartilhou um imóvel com você. Para mais informações acesse o site.`,
    };

    let response = 'O compartilhamento foi compartilhado com sucesso!';

    sgMail
      .send(mailOptions)
      .catch(() => { response += ' Mas o email não pode ser enviado.'; });

    return { message: response };
  }

  static async getSharedProperties(email, page = 1, take = 6) {
    const validatedEmail = validateEmail(email);
    const user = await this.find(validatedEmail);
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const shared = await prisma.sharedProperties.findMany({
      where: { email: validatedEmail, accepted: false },
      orderBy: { createdAt: 'desc' },
      take,
    });

    if (shared.length === 0) throw new ConfigurableError('Nenhum imóvel compartilhado com você', 404);

    const pagination = {
      path: '/clients',
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: Number(page) + 1 <= Math.ceil(shared.length / take) ? Number(page) + 1 : null,
      lastPage: Math.ceil(shared.length / take),
      total: shared.length,
    };

    const properties = await Promise.all(shared.map(async (sharedProperty) => {
      const property = await prisma.property.findOne({ where: { id: sharedProperty.propertyId } });
      return this.getPropertyDetails(property.id);
    }));

    return { properties, pagination };
  }

  static async getSharedProperty(email, propertyId) {
    const validatedEmail = validateEmail(email);
    const validatedPropertyId = validateString(propertyId);

    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const p = await prisma.sharedProperties.findFirst({ where: { propertyId: validatedPropertyId, accepted: false } });
    if (!p) throw new ConfigurableError('Imóvel compartilhado não encontrado', 404);

    const property = await prisma.property.findOne({ where: { id: p.propertyId } });
    return this.getPropertyDetails(property.id);
  }

  static async confirmSharedProperty(propertyId, email) {
    const validatedEmail = validateEmail(email);
    const validatedPropertyId = validateString(propertyId);
    let emailBody;

    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const sharedProperty = await prisma.sharedProperties.findFirst({ where: { propertyId: validatedPropertyId, email: validatedEmail } });
    if (!sharedProperty) throw new ConfigurableError('Imóvel compartilhado não encontrado', 404);

    const property = await prisma.property.findFirst(validatedPropertyId);

    await prisma.sharedProperties.update({ where: { id: sharedProperty.id, email: validatedEmail }, data: { accepted: true } });
    await prisma.sharedProperties.deleteMany({ where: { propertyId: validatedPropertyId, email: { not: validatedEmail } } });

    if (user.type === 'realtor') {
      emailBody = `O corretor ${user.name} aceitou o compartilhamento do imóvel com o id ${sharedProperty.property_id}!`;
    } else if (user.type === 'realstate') {
      emailBody = `A imobiliária ${user.name} aceitou o compartilhamento do imóvel com o id ${sharedProperty.property_id}!`;
    }

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: property.owner_email,
      subject: 'Aceito o compartilhamento do imóvel!',
      text: emailBody,
    };

    let response = 'O compartilhamento foi aceito com sucesso!';
    sgMail
      .send(mailOptions)
      .catch(() => { response += ' Mas o email não pode ser enviado.'; });

    return { message: response };
  }

  static async negateSharedProperty(propertyId, email, reason) {
    const validatedEmail = validateEmail(email);
    const validatedPropertyId = validateString(propertyId);
    const validatedReason = reason ? ` \nMotivo: ${validateString(reason)}.` : '';
    let emailBody;

    const user = await UserService.find({ email: validatedEmail });
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const sharedProperty = await prisma.sharedProperties.findFirst({ where: { propertyId: validatedPropertyId, email: validatedEmail } });
    if (!sharedProperty) throw new ConfigurableError('Imóvel compartilhado não encontrado', 404);

    await prisma.sharedProperties.delete({ where: { id: sharedProperty.id, email: validatedEmail } });
    if (user.type === 'realtor') {
      emailBody = `Infelizmente, o corretor ${user.name} negou o compartilhamento do imóvel com o id ${sharedProperty.property_id}.`;
    } else if (user.type === 'realstate') {
      emailBody = `Infelizmente, a imobiliária ${user.name} negou o compartilhamento do imóvel com o id ${sharedProperty.property_id}.`;
    }

    emailBody += validatedReason;

    const property = await prisma.property.findFirst(validatedPropertyId);

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: property.advertiserEmail,
      subject: 'Compartilhamento de imóvel negado.',
      text: emailBody,
    };
    let response = 'O compartilhamento foi negado com sucesso!';

    sgMail
      .send(mailOptions)
      .catch(() => { response += ' Mas o email não pode ser enviado.'; });

    return { message: response };
  }
}
