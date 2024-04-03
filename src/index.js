import Express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

import clientRoutes from './routes/clientRoutes.js';

dotenv.config();

const app = Express();
const port = Number(process.env.PORT) || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use('/clients', clientRoutes);

app.all('*', (req, res) => {
  res.status(404).send('Not Found');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`\u001B[32mServer is running on http://localhost:${port}\u001B[0m`);
});
