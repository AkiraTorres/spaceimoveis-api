import Express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

import clientRoutes from './routes/clientRoutes.js';
import ownerRoutes from './routes/ownerRoutes.js';
import loginRoutes from './routes/loginRoutes.js';
import realtorRoutes from './routes/realtorRoutes.js';
import realstateRoutes from './routes/realstateRoutes.js';
import * as globalController from './controllers/globalController.js';

dotenv.config();

const app = Express();
const port = Number(process.env.PORT) || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/', loginRoutes);
app.use('/clients', clientRoutes);
app.use('/owners', ownerRoutes);
app.use('/realtors', realtorRoutes);
app.use('/realstate', realstateRoutes);

app.get('/find/:email', globalController.find);
app.get('/find', globalController.findAll);
app.post('/change/password', globalController.changePassword);

app.all('*', (req, res) => {
  res.status(404).send('Not Found');
});

app.listen(port, () => {
  console.log(`\u001B[32mServer is running on http://localhost:${port}\u001B[0m`);
});
