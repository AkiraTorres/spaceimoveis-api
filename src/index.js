import Express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

import clientRoutes from './routes/clientRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import realtorRoutes from './routes/realtorRoutes.js';
import realstateRoutes from './routes/realstateRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import * as globalController from './controllers/globalController.js';
import verifyJwt from './middlewares/verifyJwt.js';
import { verifyGoogleToken } from './middlewares/verifyGoogle.cjs';

dotenv.config();

const app = Express();
const port = Number(process.env.PORT) || 3000;

app.use(bodyParser.json({ limit: '250mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '250mb', extended: true }));
app.use(cors());

app.use('/', loginRoutes);
app.use('/clients', clientRoutes);
app.use('/owners', ownerRoutes);
app.use('/realtors', realtorRoutes);
app.use('/realstate', realstateRoutes);
app.use('/properties', propertyRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/rating/', ratingRoutes);

app.get('/find/:email', globalController.find);
app.get('/find', globalController.findAll);
app.post('/change/password', verifyGoogleToken, verifyJwt, globalController.changePassword);

app.post('/rescue/password', globalController.rescuePassword);
app.post('/reset/password', globalController.resetPassword);

app.all('*', (req, res) => {
  res.status(404).send('Not Found');
});

app.listen(port, () => {
  console.log(`\u001B[32mServer is running on http://localhost:${port}\u001B[0m`);
});
