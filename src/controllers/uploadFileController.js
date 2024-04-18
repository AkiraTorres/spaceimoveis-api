import express from 'express';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import multer from 'multer';

import firebaseConfig from '../config/firebase.js';

const router = express.Router();
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const upload = multer({ storage: multer.memoryStorage() });

// array([{ name: 'cover', maxCount: 1 }, { name: 'photo', maxCount: 9 }])
router.post('/', upload.any(), async (req, res) => {
  try {
    const id = 1462;

    const { files } = req;
    const { data } = req.body;

    console.log('data', data);

    if (!req.files) {
      console.error('req.file', req.files);
      return res.status(400).send({ message: 'No file uploaded' });
    }

    const result = await Promise.all(files.map(async (picture) => {
      const storageRef = ref(storage, `images/properties/${id}/${picture.fieldname}-${picture.originalname}`);
      const metadata = { contentType: picture.mimetype };
      const snapshot = await uploadBytesResumable(storageRef, picture.buffer, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return { name: `${picture.fieldname}-${picture.originalname}`, type: picture.mimetype, downloadURL };
    }));

    return res.send({ message: 'files uploaded', result });
  } catch (error) {
    const message = error.message || `Erro ao se conectar com o banco de dados: ${error}`;
    console.error(message);
    throw error;
  }
});

export default router;
