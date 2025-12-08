import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from "./middlewares/error.handler.js";
import propertyRoutes from './routes/property.routes.js';
import landlordRoutes from './routes/landlord.routes.js';
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

dotenv.config();

const PORT = process.env.PORT || 4000;

app.use(cors(
{
     origin:[ "http://localhost:3000" , "http://localhost:3001"],
     credentials: true,
      allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Allow-Credentials",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    
    maxAge: 86400, // 24 hours
  })


    
);


app.use(express.json());
app.use(cookieParser())
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/landlords', landlordRoutes);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



