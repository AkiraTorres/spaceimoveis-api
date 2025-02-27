import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'API documentation for the application',
  },
  components: {
    schemas: {
      // User Schema
      User: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          handler: { type: 'string', maxLength: 32 },
          password: { type: 'string' },
          type: { type: 'string', enum: ['client', 'owner', 'realtor', 'realstate', 'admin', 'property'] },
          otp: { type: 'string', maxLength: 6 },
          otpTtl: { type: 'string', format: 'date-time' },
          active: { type: 'boolean', default: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time' },
        },
        required: ['email', 'name', 'handler'],
      },

      // UserInfo Schema
      UserInfo: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          cpf: { type: 'string', maxLength: 11 },
          cnpj: { type: 'string', maxLength: 15 },
          rg: { type: 'string' },
          creci: { type: 'string' },
          phone: { type: 'string', maxLength: 25 },
          idPhone: { type: 'string' },
          bio: { type: 'string', maxLength: 1024 },
          subscription: { type: 'string', default: 'free' },
          highlightLimit: { type: 'integer', default: 1 },
          publishLimit: { type: 'integer', default: 3 },
        },
        required: ['email'],
      },

      // UserAddress Schema
      UserAddress: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          street: { type: 'string' },
          cep: { type: 'string' },
          number: { type: 'string' },
          complement: { type: 'string' },
          neighborhood: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string', maxLength: 2 },
        },
        required: ['email'],
      },

      // UserPhoto Schema
      UserPhoto: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          url: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'email', 'url', 'name', 'type'],
      },

      // UserRating Schema
      UserRating: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          rating: { type: 'integer' },
          comment: { type: 'string' },
          receiverEmail: { type: 'string', format: 'email' },
          senderEmail: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'rating', 'receiverEmail', 'senderEmail'],
      },

      // UserSocial Schema
      UserSocial: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          type: { type: 'string' },
          url: { type: 'string' },
        },
        required: ['id', 'email'],
      },

      // UserPosts Schema
      UserPosts: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          text: { type: 'string' },
          likes: { type: 'integer', default: 0 },
          active: { type: 'boolean', default: true },
          createdAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'email'],
      },

      // PostMedia Schema
      PostMedia: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          postId: { type: 'string', format: 'uuid' },
          url: { type: 'string' },
          type: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'postId', 'url'],
      },

      // PostComments Schema
      PostComments: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          postId: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          text: { type: 'string' },
          likes: { type: 'integer', default: 0 },
          active: { type: 'boolean', default: true },
          createdAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'postId', 'email', 'text'],
      },

      // PostLikes Schema
      PostLikes: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          postId: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'postId', 'email'],
      },

      // CommentLikes Schema
      CommentLikes: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          commentId: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'commentId', 'email'],
      },

      // SharedProperties Schema
      SharedProperties: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          propertyId: { type: 'string', format: 'uuid' },
          cut: { type: 'number', default: 0.03 },
          status: { type: 'string', enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'email', 'propertyId'],
      },

      // Chat Schema
      Chat: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          user1Email: { type: 'string', format: 'email' },
          user2Email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id'],
      },

      // Favorite Schema
      Favorite: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          propertyId: { type: 'string', format: 'uuid' },
          userEmail: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'propertyId', 'userEmail'],
      },

      // Visualization Schema
      Visualization: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          propertyId: { type: 'string', format: 'uuid' },
          userLatitude: { type: 'string' },
          userLongitude: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'propertyId'],
      },

      // Follower Schema
      Follower: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          followerEmail: { type: 'string', format: 'email' },
          followedEmail: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'followerEmail', 'followedEmail'],
      },

      // Message Schema
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          chatId: { type: 'string', format: 'uuid' },
          senderEmail: { type: 'string', format: 'email' },
          text: { type: 'string' },
          url: { type: 'string', maxLength: 2048 },
          filename: { type: 'string', maxLength: 255 },
          isDeleted: { type: 'boolean', default: false },
          isRead: { type: 'boolean', default: false },
          type: { type: 'string', enum: ['text', 'image', 'video', 'audio', 'file'], default: 'text' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'chatId', 'text'],
      },

      // Property Schema
      Property: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['property'], default: 'property' },
          advertiserEmail: { type: 'string', format: 'email' },
          announcementType: { type: 'string', enum: ['rent', 'sell', 'both'] },
          propertyType: { type: 'string', enum: ['house', 'apartment', 'land', 'farm'] },
          isHighlight: { type: 'boolean', default: false },
          isPublished: { type: 'boolean', default: false },
          floor: { type: 'integer', default: 1 },
          size: { type: 'integer' },
          bathrooms: { type: 'integer', default: 0 },
          bedrooms: { type: 'integer', default: 0 },
          parkingSpaces: { type: 'integer', default: 0 },
          description: { type: 'string', maxLength: 2048 },
          contact: { type: 'string' },
          financiable: { type: 'boolean', default: false },
          negotiable: { type: 'boolean', default: false },
          suites: { type: 'integer', default: 0 },
          furnished: { type: 'string', enum: ['yes', 'no', 'partial'] },
          verified: { type: 'string', enum: ['pending', 'verified', 'rejected'], default: 'pending' },
          timesSeen: { type: 'integer', default: 0 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'advertiserEmail', 'announcementType', 'propertyType'],
      },

      // PropertiesPrices Schema
      PropertiesPrices: {
        type: 'object',
        properties: {
          propertyId: { type: 'string', format: 'uuid' },
          rentPrice: { type: 'integer' },
          sellPrice: { type: 'integer' },
          iptu: { type: 'integer' },
          aditionalFees: { type: 'integer' },
          deposit: { type: 'integer' },
          timesDeposit: { type: 'integer' },
          depositInstallments: { type: 'integer' },
        },
        required: ['propertyId'],
      },

      // PropertiesAddresses Schema
      PropertiesAddresses: {
        type: 'object',
        properties: {
          propertyId: { type: 'string', format: 'uuid' },
          cep: { type: 'string', maxLength: 9 },
          street: { type: 'string' },
          number: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string', maxLength: 2 },
          neighborhood: { type: 'string' },
          complement: { type: 'string' },
          latitude: { type: 'string' },
          longitude: { type: 'string' },
        },
        required: ['propertyId', 'cep', 'street', 'city', 'state', 'neighborhood'],
      },

      // PropertiesCommodities Schema
      PropertiesCommodities: {
        type: 'object',
        properties: {
          propertyId: { type: 'string', format: 'uuid' },
          pool: { type: 'boolean', default: false },
          grill: { type: 'boolean', default: false },
          airConditioning: { type: 'boolean', default: false },
          playground: { type: 'boolean', default: false },
          eventArea: { type: 'boolean', default: false },
          gourmetArea: { type: 'boolean', default: false },
          garden: { type: 'boolean', default: false },
          porch: { type: 'boolean', default: false },
          slab: { type: 'boolean', default: false },
          gatedCommunity: { type: 'boolean', default: false },
          gym: { type: 'boolean', default: false },
          balcony: { type: 'boolean', default: false },
          solarEnergy: { type: 'boolean', default: false },
          concierge: { type: 'boolean', default: false },
          yard: { type: 'boolean', default: false },
          elevator: { type: 'boolean', default: false },
        },
        required: ['propertyId'],
      },

      // PropertyPictures Schema
      PropertyPictures: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          propertyId: { type: 'string', format: 'uuid' },
          url: { type: 'string', maxLength: 2048 },
          name: { type: 'string' },
          type: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'propertyId', 'url', 'name'],
      },

      // ReasonRejectedProperty Schema
      ReasonRejectedProperty: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          propertyId: { type: 'string', format: 'uuid' },
          reason: { type: 'string' },
          sharingRejected: { type: 'boolean', default: false },
        },
        required: ['id', 'propertyId', 'reason'],
      },

      // UserMessages Schema
      UserMessages: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userName: { type: 'string', maxLength: 25 },
          userEmail: { type: 'string', maxLength: 25 },
          userType: { type: 'string', maxLength: 25 },
          message: { type: 'string', maxLength: 4096 },
          answered: { type: 'boolean', default: false },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'userName', 'userEmail', 'message'],
      },

      // Appointment Schema
      Appointment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          propertyId: { type: 'string', format: 'uuid' },
          solicitorEmail: { type: 'string', format: 'email' },
          advertiserEmail: { type: 'string', format: 'email' },
          start: { type: 'string', format: 'date-time' },
          end: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'title', 'propertyId', 'solicitorEmail', 'advertiserEmail', 'start', 'end'],
      },

      // AvailableTime Schema
      AvailableTime: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          advertiserEmail: { type: 'string', format: 'email' },
          weekDay: { type: 'string', enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
          start: { type: 'string' },
          end: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'advertiserEmail', 'weekDay', 'start', 'end'],
      },

      // Announcement Schema
      Announcement: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          announcerName: { type: 'string' },
          announcerEmail: { type: 'string', format: 'email' },
          announcerCpf: { type: 'string' },
          photoUrl: { type: 'string', maxLength: 1024 },
          siteUrl: { type: 'string' },
          type: { type: 'string' },
          paymentType: { type: 'string' },
          paymentId: { type: 'string' },
          paymentStatus: { type: 'string' },
          transactionAmount: { type: 'number' },
          totalViews: { type: 'integer', default: 0 },
          active: { type: 'boolean', default: false },
          validUntil: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'announcerName', 'announcerEmail', 'announcerCpf', 'photoUrl', 'siteUrl', 'type'],
      },
    },
  },
};

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // Path to your route files
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;
