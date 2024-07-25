import bodyParser from 'body-parser';
import cors from 'cors';
import Express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";

import * as globalController from './controllers/globalController.js';
import { verifyGoogleToken } from './middlewares/verifyGoogle.cjs';
import verifyJwt from './middlewares/verifyJwt.js';
import adminRoutes from './routes/adminRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import realstateRoutes from './routes/realstateRoutes.js';
import realtorRoutes from './routes/realtorRoutes.js';
import sellerDashboardRoutes from './routes/sellerDashboardRoutes.js';
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import followerRoutes from "./routes/followerRoutes.js";

const app = Express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
    maxHttpBufferSize: 1e8,
    // methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '250mb', extended: true }));

app.use('/', loginRoutes);
app.use('/clients', clientRoutes);
app.use('/owners', ownerRoutes);
app.use('/realtors', realtorRoutes);
app.use('/realstate', realstateRoutes);
app.use('/properties', propertyRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/rating', ratingRoutes);
app.use('/chat', chatRoutes);
app.use('/message', messageRoutes);
app.use('/dashboard', sellerDashboardRoutes);
app.use('/follow', followerRoutes);

app.get('/find/:email', globalController.find);
app.get('/find', globalController.findAll);
app.post('/change/password', verifyGoogleToken, verifyJwt, globalController.changePassword);

app.post('/rescue/password', globalController.rescuePassword);
app.post('/reset/password', globalController.resetPassword);

app.put('/share/:id', verifyGoogleToken, verifyJwt, globalController.shareProperty);
app.get('/shared/:id', verifyGoogleToken, verifyJwt, globalController.getSharedProperties);
app.get('/shared', verifyGoogleToken, verifyJwt, globalController.getSharedProperties);
app.post('/share/confirm/:id', verifyGoogleToken, verifyJwt, globalController.confirmSharedProperty);
app.post('/share/negate/:id', verifyGoogleToken, verifyJwt, globalController.negateSharedProperty);

app.post('/contact', globalController.contact);

app.use('/admin', adminRoutes);

app.all('*', (req, res) => {
  res.status(404).send('Not Found');
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.status !== 500 ? error.message || 'Internal Server Error' : 'Internal Server Error';
  res.status(status).json({ message });
});

export { httpServer, io }
