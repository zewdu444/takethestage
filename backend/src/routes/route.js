import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';
import studentRouter from '../controllers/student-controller.js'; 
import teacherRouter from '../controllers/teacher-controller.js'; 
import adminRouter from '../controllers/admin-controller.js'; 
import superadminRouter from '../controllers/super-admin-controller.js'; 
import {verifyToken} from '../controllers/admin-controller.js'; 
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';


const app = express();
app.use(cors())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

app .use(limiter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/receipts',verifyToken, express.static(path.join(__dirname, '../../receipts')));
app.use('/cv', express.static(path.join(__dirname, '../../cv')));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/students', studentRouter); 
app.use('/teachers', teacherRouter);
app.use('/admins', adminRouter); 
app.use('/superadmin', superadminRouter); 



app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the School Management System API' });
});


export default app;
