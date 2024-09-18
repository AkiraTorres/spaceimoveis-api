import AdminService from '../services/adminService.js';

export default async function verifyAdmin(req, res, next) {
  try {
    const { email } = req;
    const adminService = new AdminService();

    const admin = await adminService.find(email, 'admin');
    if (!admin) throw new Error('Unauthorized');

    next();
    return true;
  } catch (error) {
    const status = error.status || 401;
    const message = error.message || 'Unauthorized';
    return res.status(status).json(message).end();
  }
}
