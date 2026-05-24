import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mediqueue/doctors',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const upload = multer({ storage: storage });

export default upload;
