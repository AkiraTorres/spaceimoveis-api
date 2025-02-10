import bodyParser from 'body-parser';
import cors from 'cors';
import Express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { createPaymentPreference, paymentStatus } from './config/payment.js';
import { getValidAnnouncements } from './controllers/adminController.js';
import { findAllRealtorsAndRealstates } from './controllers/realtorController.js';
import adminRoutes from './routes/adminRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import followerRoutes from './routes/followerRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import postRoutes from './routes/postRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import realstateRoutes from './routes/realstateRoutes.js';
import realtorRoutes from './routes/realtorRoutes.js';
import sellerDashboardRoutes from './routes/sellerDashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';
import startDeactivationTask from './tasks/deactivateExpired.js';

const app = Express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    credentials: true,
    maxHttpBufferSize: 1e8,
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '250mb', extended: true }));

app.use('/', loginRoutes);
app.use('/client', clientRoutes);
app.use('/owner', ownerRoutes);
app.use('/realtor', realtorRoutes);
app.use('/realstate', realstateRoutes);
app.use('/properties', propertyRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/rating', ratingRoutes);
app.use('/chat', chatRoutes);
app.use('/message', messageRoutes);
app.use('/dashboard', sellerDashboardRoutes);
app.use('/follow', followerRoutes);
app.use('/posts', postRoutes);

app.get('/realtors-and-realstates', findAllRealtorsAndRealstates);
app.post('/criar-pix', createPaymentPreference);
app.get('/payment-status/:paymentId', paymentStatus);

app.get('/announcement', getValidAnnouncements);

app.use('/', userRoutes);

app.use('/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.all('*', (req, res) => {
  res.status(404).send('Not Found');
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.status !== 500 ? error.message || 'Internal Server Error' : 'Internal Server Error';
  // eslint-disable-next-line no-console
  console.error(error);
  res.status(status).json({ message });
});

startDeactivationTask();

export { httpServer, io };
