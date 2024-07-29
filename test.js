// import fs from "fs/promises";
// import {getDownloadURL, getStorage, ref, uploadBytes} from "firebase/storage";
// import {initializeApp} from "firebase/app";
// import firebaseConfig from "./src/config/firebase.js";
//
//
// const imagePath = ''
//
// // console.log(imagePath);
// const buffer = Buffer.from(imagePath, 'base64');
// await fs.writeFile('./image', buffer);
//
// const img = await fs.readFile('./image');
// console.log(img);
//
// const app = initializeApp(firebaseConfig);
// const storage = getStorage(app);
//
// const storageRef = ref(storage, `test/test.jpeg`);
// const metadata = { contentType: 'image/jpeg' };
// const snapshot = await uploadBytes(storageRef, img, metadata);
// const downloadUrl = await getDownloadURL(snapshot.ref);
//
// console.log(downloadUrl);

import {fileURLToPath} from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);