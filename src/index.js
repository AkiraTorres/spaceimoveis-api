import dotenv from "dotenv";

import { httpServer } from "./server.js";

import './websocket.js';

dotenv.config();
const port = Number(process.env.PORT) || 3000;

httpServer.listen(port, () => console.log('Server running on port ' + port));
