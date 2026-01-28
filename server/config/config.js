import dotenv from "dotenv";
dotenv.config();

// export const DATABASE_URL = process.env.
// DATABASE_URL
// console.log(DATABASE_URL);
// export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV;
export const CLOUDINARY_CLOUDNAME = process.env.CLOUDINARY_CLOUDNAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const JWT_SECRET = process.env.JWT_SECRET;