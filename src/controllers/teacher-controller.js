import { Router } from "express";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from "fs";
import Student from "../models/Student.js";
import Payment from "../models/Payment.js";
import News from "../models/News.js";
import TeacherShift from "../models/TeacherShift.js";
import Institution from "../models/Institution.js";
import Teacher from "../models/Teacher.js";

import Result from "../models/Result.js";
import { body, validationResult } from "express-validator";
import { fileURLToPath } from "url";
import Application from "../models/Application.js";
import { Op } from "sequelize";
import Class from "../models/Class.js";
import uploads from './image-upload.js';
const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import { Chapa } from 'chapa-nodejs';
import axios from 'axios';
import { SimpleConsoleLogger } from "typeorm";

const chapa = new Chapa({
  secretKey: process.env.CHAPA_SECRET_KEY,
});


function validateTeacher() {
  return [
    body("email").isEmail().withMessage("Invalid email format"),
    body("first_name").notEmpty().withMessage("First name is required"),
    body("second_name").notEmpty().withMessage("Second name is required"),
    body("last_name").notEmpty().withMessage("Last name is required"),
    body("level_of_teaching")
      .isIn(["grade 5-8", "grade 9-10", "college", "university", "masters"])
      .withMessage("Invalid level of teaching value"),
    body("region").notEmpty().withMessage("Region is required"),
    body("woreda").notEmpty().withMessage("Woreda is required"),
    body("sex").isIn(["male", "female"]).withMessage("Invalid sex value"),
    body("institution_id")
      .isInt()
      .withMessage("Institution ID must be an integer"),
  ];
}

router.get("/", (req, res) => {
  res.json({ message: "22Welcasdfome to the School Management System API" });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      console.log(req.body, 7777);
      if (!req.body || !req.body.email) {
        // return cb(new Error('Email is required'));
        console.log("Email is required", req, 222);
        return cb(null, path.join(__dirname, "..", "..", "cv"));
      }
      // function sanitizeEmailForFolder(email) {
      //   return email.replace(/[^a-zA-Z0-9]/g, "_");
      // }
      // const email = sanitizeEmailForFolder(req.body.email);
      const uploadPath = path.join(__dirname, "..", "..", "cv");
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    } catch (error) {
      console.error("Error creating directory:", error);
      cb(error);
    }
  }, 
  filename: (req, file, cb) => {
    const newFileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, newFileName); // Save file with this name
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Only .pdf, .doc, and .docx formats are allowed!");
    error.statusCode = 400; // Set a status code for the error
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Invalid token");
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    console.log("User verified:", user);
    next();
  });
};

router.post("/sign-up", (req, res, next) => {
  upload.single("cv")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req, res) => {
  const errors = validationResult(req);
  const cvPath = req.file ? req.file.filename : null;
  if (!cvPath) return res.status(400).json({ error: "CV is required" });
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try { 
    const { email, password, ...teacherData } = req.body;

    const existingTeacher = await Teacher.findOne({ where: { email } });
    if (existingTeacher) {
      if (cvPath) {
        const fullCvPath = path.join(__dirname, "..", "..", "cv", cvPath);
        fs.unlink(fullCvPath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log("File deleted successfully");
          }
        });
      }
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    const teacher = await Teacher.create({
      ...teacherData,
      password: hashedPassword,
      email,
      cv: cvPath,
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email,password)
    const teacher = await Teacher.findOne({ where: { email: email } });

    if (!teacher) {
      return res.status(404).json({ error: "incorrect password or username" });
    }

    const validPassword = await bcrypt.compare(password, teacher.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect password or username" });
    }
    const token = jwt.sign({ id: teacher.id, role: 'teacher' }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).json({ token, is_teacher: teacher.is_teacher,is_paid:teacher.paid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    let institutionName = null;
    if (teacher.institution_id) {
      const institution = await Institution.findByPk(teacher.institution_id, {
        attributes: ["name"],
      });
      institutionName = institution ? institution.name : null;
    }

    const teacherProfile = {
      ...teacher.toJSON(),
      institution_name: institutionName,
    };

    if (teacher.is_teacher) {
      teacherProfile.chosen_institution = teacher.chosen_institution;
      teacherProfile.campus = teacher.campus;
      teacherProfile.date = teacher.date;
    }
    const teacherShifts = await TeacherShift.findAll({
      where: { teacher_id: teacher.id },
      attributes: ['day', 'shift'],
    });

    const shifts = teacherShifts.map(shift => `${shift.day}:${shift.shift}`).join(' , ');
    teacherProfile.shift = shifts;
    console.log(teacherProfile)
    res.status(200).json(teacherProfile);

  } catch (error) {
    console.lo(error)
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/register", verifyToken,async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const { training_or_competition, chosen_institution, days, day_pairs } = req.body;
    console.log(req.body,'request body ',training_or_competition)

    if (!teacher_id || !training_or_competition || !chosen_institution  ) {
      return res.status(400).json({ error: "All fields are required" });
    }
  let parsedDays = [];

  if (req.body.days) {
    parsedDays = JSON.parse(req.body.days);
  }

  if (req.body.day_pairs) { 
    const dayPairs = JSON.parse(req.body.day_pairs);
    dayPairs.forEach(pair => {
      const days = pair.pair.split(" - ");
      days.forEach(day => {
        parsedDays.push({ day, shift: pair.shift });
      });
    });
  }

    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    teacher.training_or_competition = training_or_competition;
    teacher.chosen_institution = chosen_institution;

    await teacher.save();

    for (const day of parsedDays) {
      const a = await TeacherShift.create({
        teacher_id,
        day: day.day,
        shift: day.shift,
      });
      console.log(a,33)
    }

    res.status(201).json({ message: "Teacher registered successfully" });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});



router.get("/applicationstatus", verifyToken, async (req, res) => {
  const teacher_id = req.user.id;
  try {
    const application = await Application.findAll({ where: { teacher_id } });
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.status(200).json(application);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/submit-application", verifyToken, [
  body("application_letter").notEmpty().withMessage("Application letter is required"),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log(req.body,11)

  try {
    const teacher_id = req.user.id;
    const teacher = await Teacher.findByPk(teacher_id);

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const { application_letter } = req.body;
    const chosen_institution = teacher.chosen_institution;
    const shift = teacher.shift;

    const newApplication = await Application.create({ 
      teacher_id,
      application_letter,
      chosen_institution,
      shift,
    });

    res.status(201).json(newApplication);
  } catch (error) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});



router.get("/students", verifyToken, async (req, res) => {  

  try {
    const teacher_id = req.user.id;
    const { search = "", class_id } = req.query;
    console.log(req.query)
    const page = 1, limit = 30;
    const teacherShift = await TeacherShift.findOne({ where: { teacher_id, class_id } });
    if (!teacherShift) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    
    const offset = (page - 1) * limit;
    const { count, rows: students } = await Student.findAndCountAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { class_id: class_id },
              { class2: class_id },
            ],
          },
          {
            [Op.or]: [
              { first_name: { [Op.like]: `%${search}%` } },
              { last_name: { [Op.like]: `%${search}%` } },
              { email: { [Op.like]: `%${search}%` } },
            ],
          },
        ],
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      students,
      totalItems: count,
      totalPages,
      currentPage: parseInt(page),
    });
    console.log(students, 1111);
  } catch (error) {
    console.log(error.message, "from teacher students");
    res.status(500).json({ error: "Internal server error" });
  }
});





router.post("/updatesingleresult", verifyToken, async (req, res) => {
  // updated
  const { student_id, exam_name, score,class_id } = req.body;
  const teacher_id = req.user.id;
  const class_ = await Class.findByPk(class_id);
  const student_class = await Student.findOne({ where: { id: student_id } });
  const teacher = await Teacher.findByPk(teacher_id);
  if (!teacher || !teacher.is_teacher  || teacher.class_id !== class_id) {
    console.log(teacher);
    return res.status(403).json({ error: "Forbidden" });
  }

  if (!student_class) {
    return res.status(404).json({ error: " student not found" });
  }
  if (!class_) {
    return res.status(404).json({ error: " class not found" });
  }
  if (student_class && student_class.class_id != class_.class_id) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    let result = await Result.findOne({
      where: {
        student_id: student_id,
        exam_name: exam_name,
      },
    });

    if (result) {
      result.score = score;
      await result.save();
      res.status(200).json({ message: "Result updated successfully" });
    } else {
      result = await Result.create({
        student_id: student_id,
        exam_name: exam_name,
        score: score,
      });
      res.status(201).json({ message: "Result created successfully" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", error: error.message });
  }
});

router.post("/updateStudentsresult", verifyToken, async (req, res) => {
  const teacher_id = req.user.id;
  // updated
  const { results,exam_name,class_id } = req.body;
  console.log(req.body)
  try {
    const class_ = await Class.findByPk(class_id);
    if (!class_ || class_.teacher_id !== teacher_id) {
      return res
        .status(404)
        .json({ error: "you are not assigned to teach yet " });
    }

    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher || !teacher.is_teacher) {
      console.log(teacher);
      return res.status(403).json({ error: "Forbidden" });
    }

    for (const resultData of results) {
      const { student_id, score, date } = resultData;

      const student_class = await Student.findOne({
        where: { id: student_id },
      });
      if (!student_class) {
        return res
          .status(404)
          .json({ error: `Student with ID ${student_id} not found` });
      }
      if (!((student_class.class_id === class_.id) || (student_class.class2 === class_.id))) {
        return res
          .status(403)
          .json({
        error: `Student with ID ${student_id} does not belong to the class`,
          });
      }

      await Result.create({
        student_id: student_id,
        exam_name: exam_name,
        score: score,
      });
    }

    res.status(201).json({ message: "Results created successfully" });
  } catch (error) {
    console.log(error.message)
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});


router.post("/changecv", verifyToken, upload.single("cv"), async (req, res) => {
  try {
    const cvFileName = req.file ? req.file.filename : null;
    const teacher_id = req.user.id;

    if (!cvFileName) {
      return res.status(400).json({ error: "CV is required" });
    }

    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    } 

    const cvPath = teacher.cv;
    teacher.cv = cvFileName;
    await teacher.save();

    res.status(200).json({ message: "CV updated successfully" });
    console.log(cvPath,teacher.cv)
    if (cvPath) {
      const fullCvPath = path.join(__dirname, "..", "..", "cv", cvPath);
      fs.unlink(fullCvPath, (err) => { 
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("File deleted successfully");
        }
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }

});




router.get('/profile', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user.id;
    let teacher = await Teacher.findByPk(teacherId, {
      attributes: { exclude: ['password', 'cv'] }
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    let institutionName = null;
    if (teacher.institution_id) {
      const institution = await Institution.findByPk(teacher.institution_id, {
        attributes: ['name']
      });
      institutionName = institution ? institution.name : null;
    }

    const teacherProfile = {
      ...teacher.toJSON(),
      institution_name: institutionName
    };

    res.status(200).json(teacherProfile);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get('/classes',verifyToken, async (req, res) => {
  try {
    const teacher_id = req.user.id;
    const classes = await Class.findAll({ where: { teacher_id } });
    res.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.get("/news/:id", verifyToken, async (req, res) => { 

  try {
    const news = await News.findByPk(req.params.id);
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    if (news.image) {
      const imagePath = path.resolve(__dirname, "..", "..", "news", news.image);
      console.log(imagePath,11) 
      try {
        await fs.promises.access(imagePath, fs.constants.F_OK);
        const imageBuffer = fs.readFileSync(imagePath);
        console.log(imageBuffer)
        const mimeType =
          path.extname(news.image).toLowerCase() === ".png"
            ? "image/png"
            : path.extname(news.image).toLowerCase() === ".gif"
            ? "image/gif"
            : "image/jpeg";
            res.status(200).json({
              ...news.toJSON(),
              image: `data:${mimeType};base64,${imageBuffer.toString("base64")}`,
            });
        
      } catch (err) {
        return news;
      }
    } else {
      res.status(200).json(news);
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});



router.get("/news", verifyToken, async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;
  try {
    const searchCondition = search
      ? {
          [Op.or]: [
            { main_content: { [Op.like]: `%${search}%` } },
            { title: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows: newsItems } = await News.findAndCountAll({
      where: searchCondition,
      order: [["date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const newsWithImages = await Promise.all(
      newsItems.map(async (news) => {
        if (news.image) {
          const imagePath = path.resolve(
            __dirname,
            "..",
            "..",
            "news",
            news.image
          );
          try {
            await fs.promises.access(imagePath, fs.constants.F_OK);
            const imageBuffer = fs.readFileSync(imagePath);
            const mimeType =
              path.extname(news.image).toLowerCase() === ".png"
                ? "image/png"
                : path.extname(news.image).toLowerCase() === ".gif"
                ? "image/gif"
                : "image/jpeg";
            return {
              ...news.toJSON(),
              image: `data:${mimeType};base64,${imageBuffer.toString(
                "base64"
              )}`,
            };
          } catch (err) {
            return news;
          }
        } else {
          return news;
        }
      })
    );

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      news: newsWithImages,
    });

  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});



router.post("/upload-profile", verifyToken, uploads.single('profile'), async (req, res) => {
  try {
    const teacherId = req.user.id;
    const profilePath = req.file ?req.file.filename: null;

    if (!profilePath) { 
      return res.status(400).json({ error: "Error uploading image" });
    }

    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    teacher.profile = profilePath;
    await teacher.save();

    res.status(200).json({ success: true, profile: profilePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/profile-image/", verifyToken, async (req, res) => {
  try {
    console.log(111,'yes')
    const teacherId = req.user.id;
    const teacher = await Teacher.findByPk(teacherId);

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const imagePath = teacher.profile
    ? path.join(__dirname, "..", "..", "profile", teacherId.toString(), teacher.profile)
    : null;

    if (!imagePath || !fs.existsSync(imagePath)) {
      console.log(1)
      return res.status(404).json({ error: "Profile image not found" });
    }

    const imageBuffer = fs.readFileSync(imagePath);
    res.setHeader("Content-Type", "image/jpeg");
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/payfee', verifyToken, async (req, res) => {
  try {
    const teacherId = req.user.id;
    const teacher = await Teacher.findByPk(teacherId);

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    let tx_ref;
    if (teacher.tx_ref) {
      console.log(teacher.tx_ref)
      try { 
        tx_ref = teacher.tx_ref;
        const url = `https://api.chapa.co/v1/transaction/verify/${tx_ref}`;
        const headers = { 
          'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        };

        const response = await axios.get(url, { headers });

        const data = response.data;

        if (data.status === 'success' && data.data.status === 'success') {
          if (response.status === 'success') {
            return res.status(200).json({ message: 'Transaction already verified', tx_ref: teacher.tx_ref });
          }
        }
      } catch (error) { 
        console.log(error.message);
      }
    }

    tx_ref = await chapa.genTxRef();
    teacher.tx_ref = tx_ref;
    await teacher.save();

    res.status(200).json({ tx_ref }); 
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify', verifyToken, async (req, res) => {
  const { payment_id } = req.body;
  const id = payment_id;
  const teacher = await Teacher.findByPk(id);
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  if (teacher.id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden access' });
  }
  const tx_ref = teacher.tx_ref;
  try {

    const url = `https://api.chapa.co/v1/transaction/verify/${tx_ref}`;
    const headers = {
      'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.get(url, { headers });
    const data = response.data;

    if (data.status === 'success' && data.data.status === 'success') {
      teacher.paid = true;
      await teacher.save();
      return res.status(200).json({ message: 'Transaction verified successfully', data: response });
    } else {
      return res.status(400).json({ error: 'Transaction verification failed', data: response });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.get('/payment-status', verifyToken, async (req, res) => { 
  const teacherId = req.user.id;
  const teacher = await Teacher.findByPk(teacherId);
  const tx_ref = teacher.tx_ref;
  const paid = teacher.paid;
  console.log(teacher)
  if (paid) return res.status(200).json({ paid: teacher.paid });

  try {
    const url = `https://api.chapa.co/v1/transaction/verify/${tx_ref}`;
    const headers = {
      'Authorization': `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.get(url, { headers });
    const data = response.data;

    if (data.status === 'success' && data.data.status === 'success') {
      teacher.paid = true;
      await teacher.save();
      return res.status(200).json({ paid: teacher.paid });
    } else {
      return res.status(400).json({ paid: false });
    }
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;
