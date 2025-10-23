import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from "./middlewares/error.handler.js";
import propertyRoutes from './routes/property.routes.js';

const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



