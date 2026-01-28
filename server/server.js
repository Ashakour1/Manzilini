import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from "./middlewares/error.handler.js";
import propertyRoutes from './routes/property.routes.js';
import landlordRoutes from './routes/landlord.routes.js';
import userRoutes from './routes/user.routes.js';
import fieldAgentsRoutes from './routes/field-agents.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import emailLogsRoutes from './routes/email-logs.routes.js';
import emailRoutes from './routes/email.routes.js';
import accountRoutes from './routes/account.routes.js';
import incomeRoutes from './routes/income.routes.js';
import expenseRoutes from './routes/expense.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

dotenv.config();

const PORT = process.env.PORT || 4000;

app.use(cors(
{
     origin:[ "http://localhost:3000" , "http://localhost:3001","https://panel.manzilini.com", "https://manzilini.com"],
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
// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/",(req,res)=>{
  res.send("Welcome to Manzilini HQ ");
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/landlords', landlordRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/field-agents', fieldAgentsRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/email-logs', emailLogsRoutes);
app.use('/api/v1/email', emailRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/incomes', incomeRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



