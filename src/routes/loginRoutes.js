import Express from 'express';

const router = Express.Router();

router.post('/login', (req, res) => {
  if (req.body.email !== '' && req.body.password !== '') {
    res.status(200).json({ message: 'Login successful' });
  }

  res.status(401).json({ message: 'Unauthorized ' }).end();
});

router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Logout successful' });
});

export default router;
