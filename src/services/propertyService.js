import { initializeApp } from 'firebase/app';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';

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
import { find } from './globalService.js';

import firebaseConfig from '../config/firebase.js';
import prisma from '../config/prisma.js';
import ConfigurableError from '../errors/ConfigurableError.js';
import UserService from './userService.js';

export default class PropertyService {
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.storage = getStorage(this.app);
    this.userService = new UserService();
    this.favoriteService = new FavoriteService();
  }

  static async checkHighlightLimit(email) {
    let highlightLimit;
    const { subscription } = await prisma.user.find(email);
    if (subscription === 'free') highlightLimit = 3;
    if (subscription === 'platinum') highlightLimit = 5;
    if (subscription === 'gold') highlightLimit = 9999;
    if (subscription === 'diamond') highlightLimit = 9999;

    const totalHighlightedProperties = await prisma.property.count({ where: { email, isHighlighted: true }, include: { SharedProperties: true } });

    if (totalHighlightedProperties >= highlightLimit) throw new ConfigurableError('Limite de destaques atingido', 400);
  }

  static async getPropertyDetails(property) {
    const editedProperty = property;

    editedProperty.shared = await prisma.sharedProperties.findFirst({ where: { propertyId: property.id, email: property.email } });

    const seller = await this.userService.find({ email: editedProperty.email });
    const totalFavorites = await this.favoriteService.getPropertyTotalFavorites(property.id);
    const pictures = await prisma.propertyPictures.findAll({ where: { propertyId: property.id }, orderBy: { type: 'asc' } });

    return { ...editedProperty, totalFavorites, pictures, seller };
  }

  static async findAll(page = 1, isHighlighted = false, isPublished = true, take = 6) {
    if (page < 1) throw new ConfigurableError('Página inválida', 400);

    const where = { isHighlighted, isPublished, verified: 'verified' };
    const countTotal = await prisma.property.count({ where });
    const lastPage = Math.ceil(countTotal / take);
    const skip = Number(take * (page - 1));

    const props = await prisma.property.findAll({
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

    const properties = await Promise.all(props.map(async (property) => this.getPropertyDetails(property)));

    properties.sort((a, b) => {
      if (a.totalFavorites !== b.totalFavorites) return b.totalFavorites - a.totalFavorites;
      return b.timesSeen - a.timesSeen;
    });

    return { properties, pagination };
  }

  static async recommendedProperties(isHighlighted = true) {
    const where = { isHighlighted, verified: 'verified' };
    const orderBy = { updatedAt: 'desc' };

    const props = await prisma.property.findAll({ where, orderBy });
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

    return this.propertyDetails(property);
  }

  static async findBySellerEmail(email, page = 1, take = 6) {
    const validatedEmail = validateEmail(email);

    const user = await this.userService.find(validatedEmail);

    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const total = await prisma.property.count({ where: { email: validatedEmail } });
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

    const props = await prisma.property.findAll({
      where: { email: validatedEmail },
      orderBy: { updatedAt: 'desc' },
      take,
      skip,
    });

    const properties = await Promise.all(props.map(async (property) => this.getPropertyDetails(property)));

    properties.sort((a, b) => {
      if (a.totalFavorites !== b.totalFavorites) return b.totalFavorites - a.totalFavorites;
      return b.timesSeen - a.timesSeen;
    });

    return { properties, pagination };
  }

  static async getAllPropertiesIds(email) {
    const user = await find(validateEmail(email));
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const properties = await prisma.property.findAll({ where: { email: user.email }, select: { id: true } });

    return properties.map((property) => property.id);
  }

  static async getAllPropertiesCities(email) {
    const user = await this.userService.find(validateEmail(email));
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const properties = await prisma.property.findAll({ where: { email: user.email }, attributes: { city: true } });
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

    return prisma.property.update({ where: { id: validatedId } }, { timesSeen: property.timesSeen + 1 });
  }

  static async getMostSeenPropertiesBySeller(email, take = 6) {
    const user = await find(validateEmail(email));
    if (!user) throw new ConfigurableError('Usuário não encontrado', 404);

    const props = await prisma.property.findAll({
      where: { email: user.email, verified: 'verified' },
      orderBy: { timesSeen: 'desc' },
      take,
    });

    return Promise.all(props.map(async (property) => this.getPropertyDetails(property)));
  }

  static async create(params, files) {
    const { sellerEmail } = params;
    const data = {
      id: uuid(),
      advertiserEmail: validateEmail(sellerEmail),
      announcementType: validateString(params.announcementType, 'O campo "tipo do anúncio" é obrigatório'),
      propertyType: validateString(params.propertyType, 'O campo "tipo do imóvel" é obrigatório'),
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
    };
    if (data.isHighlight) data.isPublished = true;

    const pricesData = {
      propertyId: data.id,
      rentPrince: params.rentPrice || data.announcementType !== 'sell' ? validatePrice(params.rentPrice, 'O campo "preço de aluguel" é obrigatório') : null,
      sellPrice: params.sellPrice || data.announcementType !== 'rent' ? validatePrice(params.sellPrice, 'O campo "preço de venda" é obrigatório') : null,
      iptu: params.iptu ? validatePrice(params.iptu) : null,
      aditionalFees: params.aditionalFees ? validatePrice(params.aditionalFees) : null,
    };

    const addressData = {
      propertyId: data.id,
      cep: validateString(params.cep, 'O campo "cep" é obrigatório'),
      address: validateString(params.address, 'O campo "rua" é obrigatório'),
      number: params.number ? validateString(params.number) : null,
      city: validateString(params.city, 'O campo "cidade" é obrigatório'),
      state: validateUF(params.state),
      neighborhood: validateString(params.neighborhood, 'O campo "bairro" é obrigatório'),
      complement: params.complement ? validateString(params.complement) : null,
    };

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

    const { subscription } = await this.userService.find(sellerEmail);
    if (subscription === 'free' || subscription === 'platinum') {
      if (data.isHighlighted) this.checkHighlightLimit(sellerEmail);
    }

    const property = await prisma.property.create(data);
    property.prices = await prisma.propertiesPrices.create(pricesData);
    property.address = await prisma.propertiesAddresses.create(addressData);

    const photos = await Promise.all(files.map(async (picture) => {
      const storageRef = ref(this.storage, `images/properties/${property.id}/${picture.originalname}`);
      const metadata = { contentType: picture.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, picture.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await prisma.propertyPictures.create({
        id: uuid(),
        propertyId: property.id,
        url: downloadURL,
        name: `${picture.originalname}`,
        type: picture.fieldname,
      });

      return { name: `${picture.originalname}`, type: picture.mimetype, downloadURL };
    }));

    return { ...property, photos };
  }

  static async update(id, params, files, sellerEmail) {
    const validatedId = validateString(id);
    const validatedSellerEmail = validateEmail(sellerEmail);
    let newCoverUrl;
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
    };

    const updatedAddress = {
      cep: params.cep ? validateCep(params.cep) : oldProperty.cep,
      address: params.address ? validateString(params.address) : oldProperty.address,
      number: params.number ? validateString(params.number) : oldProperty.number,
      city: params.city ? validateString(params.city) : oldProperty.city,
      state: params.state ? validateUF(params.state) : oldProperty.state,
      neighborhood: params.neighborhood ? validateString(params.neighborhood) : oldProperty.neighborhood,
      complement: params.complement ? validateString(params.complement) : oldProperty.complement,
    };

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

    if (updatedData.isHighlight && !oldProperty.isHighlight) {
      await this.checkHighlightLimit(validatedSellerEmail);
    }

    if (updatedData.description !== oldProperty.description || files.length > 0) updatedData.verified = 'pending';

    const property = await prisma.property.update({ where: { id: validatedId }, data: updatedData });
    property.prices = await prisma.propertiesPrices.update({ where: { propertyId: validatedId }, data: updatedPrices });
    property.address = await prisma.propertiesAddresses.update({ where: { propertyId: validatedId }, data: updatedAddress });
    property.commodities = await prisma.propertiesCommodities.update({ where: { propertyId: validatedId }, data: updatedCommodities });

    if (params.oldPhotosUrls) oldPhotosUrls = params.oldPhotosUrls;
    const oldPhotos = await prisma.propertyPictures.findAll({ where: { propertyId: validatedId, url: { not: { in: oldPhotosUrls } } } });

    // delete photos that the user didn't want to keep
    await Promise.all(oldPhotos.map(async (photo) => {
      try {
        const storageRef = ref(this.storage, `images/properties/${validatedId}/${photo.name}`);
        await deleteObject(storageRef);
      } catch (error) { /* do nothing */ }
      await prisma.propertyPictures.destroy({ where: { id: photo.id } });
    }));

    if (newCoverUrl) {
      const oldCover = await prisma.propertyPictures.findFirst({ where: { propertyId: validatedId, type: 'cover' } });
      const newCover = await prisma.propertyPictures.findFirst({ where: { propertyId: validatedId, url: newCoverUrl } });

      if (oldCover && !(oldCover.url === newCover.url)) {
        oldCover.type = 'photo';
        await prisma.propertyPictures.update({ where: { id: oldCover.id }, data: oldCover });

        newCover.type = 'cover';
        await prisma.propertyPictures.update({ where: { id: newCover.id }, data: newCover });
      } else if (!oldCover) {
        newCover.type = 'cover';
        await prisma.propertyPictures.update({ where: { id: newCover.id }, data: newCover });
      }
    }

    // add new photos send by user
    if (files.length > 0) {
      await Promise.all(files.map(async (picture) => {
        // change cover photo if send by user
        const storageRef = ref(this.storage, `images/properties/${validatedId}/${picture.originalname}`);
        const metadata = { contentType: picture.mimetype };
        const snapshot = await uploadBytesResumable(storageRef, picture.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const exists = await prisma.propertyPictures.findFirst({ where: { propertyId: validatedId, url: downloadURL } });

        if (!exists) {
          if (picture.fieldname === 'cover') {
            const oldCover = await prisma.propertyPictures.findFirst({ where: { propertyId: validatedId, type: 'cover' } });
            if (oldCover) {
              oldCover.type = 'photo';
              await prisma.propertyPictures.update(oldCover, { where: { id: oldCover.id } });
            }
          }

          await prisma.propertyPictures.create({
            id: uuid(),
            name: `${picture.originalname}`,
            propertyId: validatedId,
            url: downloadURL,
            type: picture.fieldname,
          });
          return { name: `${picture.originalname}`, type: picture.mimetype, downloadURL };
        }

        return null;
      }));
    }

    const photos = await prisma.propertyPictures.findAll({ where: { propertyId: validatedId }, orderBy: { type: 'asc' } });

    return { property, photos };
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

    const { subscription } = await find(email);
    if (subscription === 'free' && subscription === 'platinum') {
      if (property.isHighlight && !property.isHighlight) await this.checkHighlightLimit(email);
    }

    return { message: 'Imóvel publicado com sucesso' };
  }

  static async destroy(id, email) {
    const validatedId = validateString(id);

    const property = await prisma.property.findFirst({ where: { id: validatedId } });
    if (!property) throw new ConfigurableError('Imóvel não encontrado', 404);
    if (property.advertiserEmail !== email) throw new ConfigurableError('Você não tem permissão para arquivar este imóvel', 401);

    const photos = await prisma.propertyPictures.findAll({ where: { propertyId: validatedId } });

    if (photos.length > 0) {
      await Promise.all(photos.map(async (photo) => {
        const storageRef = ref(this.storage, `images/properties/${validatedId}/${photo.name}`);
        await deleteObject(storageRef);
      }));
    }

    await prisma.propertyPictures.destroy({ where: { propertyId: validatedId } });
    await prisma.property.destroy({ where: { id: validatedId } });
    return { message: 'Propriedade apagada com sucesso' };
  }

  static async filter(filters, page = 1, take = 6, path = '/properties/filter') {
    const properties = await prisma.property.findMany({
      where: {
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
          some: {
            city: filters.city ? validateString(filters.city) : undefined,
            state: filters.state ? validateUF(filters.state) : undefined,
            neighborhood: filters.neighborhood ? validateString(filters.neighborhood) : undefined,
          },
        },

        // Filter by prices, using related table PropertiesPrices
        PropertiesPrices: {
          some: {
            rentPrice: {
              gte: filters.minPrice ? validatePrice(filters.minPrice) : 0,
              lte: filters.maxPrice ? validatePrice(filters.maxPrice) : 999999999,
            },
            sellPrice: {
              gte: filters.minPrice ? validatePrice(filters.minPrice) : 0,
              lte: filters.maxPrice ? validatePrice(filters.maxPrice) : 999999999,
            },
          },
        },

        // Filter by property amenities, using related table PropertiesCommodities
        PropertiesCommodities: {
          some: {
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
            elevator: filters.elevator !== undefined ? validateBoolean(filters.elevator) : undefined,
          },
        },
      },

      orderBy: filters.orderBy ? filters.orderBy : { updatedAt: 'desc' },
      skip: take * (page - 1),
      take,
      include: {
        PropertiesAddresses: true,
        PropertiesPrices: true,
        PropertiesCommodities: true,
        PropertyPictures: true,
      },
    });

    const pagination = {
      path,
      page,
      prev_page_url: page - 1 >= 1 ? page - 1 : null,
      next_page_url: page + 1 <= Math.ceil(properties.length / take) ? page + 1 : null,
      lastPage: Math.ceil(properties.length / take),
      total: properties.length,
    };

    const result = properties.map((property) => ({
      ...property,
      address: property.PropertiesAddresses,
      prices: property.PropertiesPrices,
      commodities: property.PropertiesCommodities,
      pictures: property.PropertyPictures,
      PropertiesAddresses: undefined,
      PropertiesPrices: undefined,
      PropertiesCommodities: undefined,
      PropertyPictures: undefined,
    }));

    return { result, pagination };
  }
}
