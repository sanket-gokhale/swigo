import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

const storage = multer.memoryStorage();

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const cloudinaryUploadStream = (fileBuffer: Buffer, folder: string): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed with no result'));
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const uploadToCloudinary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filesToUpload: Express.Multer.File[] = [];
    if (req.files) {
      if (Array.isArray(req.files)) {
        filesToUpload.push(...req.files);
      } else {
        Object.values(req.files).forEach(fileArray => {
          filesToUpload.push(...fileArray);
        });
      }
    }
    if (req.file) {
      filesToUpload.push(req.file);
    }

    if (filesToUpload.length === 0) {
      return next();
    }

    for (const file of filesToUpload) {
      try {
        const result = await cloudinaryUploadStream(file.buffer, 'swigo-storage');
        // Map public URL to file.path so controllers work without modification
        (file as any).path = result.secure_url;
      } catch (uploadError: any) {
        console.warn('Cloudinary upload failed, falling back to base64 data URI:', uploadError.message);
        const base64Data = file.buffer.toString('base64');
        (file as any).path = `data:${file.mimetype};base64,${base64Data}`;
      }
    }

    next();
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ status: 500, message: error.message || 'Image upload failed' });
  }
};
