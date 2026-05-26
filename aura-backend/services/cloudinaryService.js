import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let configured = false;

export const isCloudinaryEnabled = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

const ensureConfigured = () => {
  if (!isCloudinaryEnabled()) return false;
  if (!configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    configured = true;
  }
  return true;
};

const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `bajilive/${folder}`,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });

/**
 * Upload multer file to Cloudinary (free tier) or fall back to local `/uploads/...` path.
 * @param {Express.Multer.File} file
 * @param {'deposit-accounts'|'deposits'} folder
 * @returns {Promise<string>} Public image URL or local path
 */
export async function persistUploadedImage(file, folder) {
  if (!file) return '';

  const useCloudinary = ensureConfigured();

  if (useCloudinary) {
    let result;
    if (file.buffer?.length) {
      result = await uploadBuffer(file.buffer, folder);
    } else if (file.path) {
      result = await cloudinary.uploader.upload(file.path, {
        folder: `bajilive/${folder}`,
        resource_type: 'image',
      });
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* ignore cleanup errors */
      }
    } else {
      throw new Error('No file buffer or path on upload.');
    }

    const url = result?.secure_url || '';
    if (!url) {
      throw new Error('Cloudinary returned no secure_url');
    }
    console.log('[Cloudinary] uploaded:', url);
    return url;
  }

  console.warn(
    '[Uploads] Cloudinary not configured — saving to local /uploads (set CLOUDINARY_* in .env)'
  );

  if (file.filename) {
    return `/uploads/${folder}/${file.filename}`;
  }

  if (file.buffer?.length) {
    const ext = path.extname(file.originalname || '') || '.jpg';
    const filename = `local-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const dir = path.join(__dirname, `../uploads/${folder}`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, filename), file.buffer);
    return `/uploads/${folder}/${filename}`;
  }

  return '';
}
