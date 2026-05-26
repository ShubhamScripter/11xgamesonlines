import multer from 'multer';

const memoryStorage = multer.memoryStorage();

const imageFileFilter = (_req, file, cb) => {
  if (!file.mimetype?.startsWith('image/')) {
    cb(new Error('Only image files are allowed.'));
    return;
  }
  cb(null, true);
};

const limits = { fileSize: 5 * 1024 * 1024 };

/** Memory upload — works with Cloudinary; falls back to disk middleware when needed. */
export const imageMemoryUpload = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits,
});
