import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Set up local disk storage config for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter to restrict uploads to images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit size to 5MB
  }
});

// Controller endpoint to handle file upload and return public URL
export const handleUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = req.file.filename;
    const localUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Optional: Upload to Supabase Storage if credentials are provided
    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const localFilePath = path.join(UPLOADS_DIR, fileName);
        const fileBuffer = fs.readFileSync(localFilePath);

        const { data, error } = await supabase.storage
          .from('brotherhood-media')
          .upload(`uploads/${fileName}`, fileBuffer, {
            contentType: req.file.mimetype,
            cacheControl: '3600',
            upsert: true
          });

        if (error) {
          console.warn('Supabase storage upload failed, using local fallback:', error.message);
        } else {
          // Get public URL from Supabase
          const { data: publicUrlData } = supabase.storage
            .from('brotherhood-media')
            .getPublicUrl(`uploads/${fileName}`);

          // Delete the temporary local file
          fs.unlinkSync(localFilePath);

          return res.status(200).json({ url: publicUrlData.publicUrl });
        }
      } catch (err: any) {
        console.warn('Error during Supabase upload process, using local fallback:', err.message);
      }
    }

    // Default return local url fallback
    return res.status(200).json({ url: localUrl });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: 'Failed to process file upload', details: error.message });
  }
};
