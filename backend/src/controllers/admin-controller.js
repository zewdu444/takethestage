import { application, Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Student from "../models/Student.js";
import Payment from "../models/Payment.js";
import Institution from "../models/Institution.js";
import Teacher from "../models/Teacher.js";
import Region from "../models/Region.js";
import City from "../models/City.js";

import PublicNews from "../models/PublicNews.js";
import TeacherShift from "../models/TeacherShift.js";

import Admin from "../models/Admin.js";
import Class from "../models/Class.js";
import News from "../models/News.js";
import express from "express";
import path from "path";
import { promisify } from "util";
import fs from "fs";
const fileAccess = promisify(fs.access);
import upload from "../util.js";

import { body, validationResult } from "express-validator";
import Application from "../models/Application.js";

import { Op } from "sequelize";
import { fileURLToPath } from "url";
import { dirname } from "path";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err && err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

router.get("/", (req, res) => {
  return res.json({ message: "Welcome to the School Management System API" });
});

router.get("/students", verifyToken, async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    const searchCondition = search
      ? {
          [Op.or]: [
            { email: { [Op.like]: `%${search}%` } },
            { first_name: { [Op.like]: `%${search}%` } },
            { last_name: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows: students } = await Student.findAndCountAll({
      where: searchCondition,
      attributes: { exclude: ["password"] },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json({
      totalItems: count, // Total number of students in the database
      totalPages: Math.ceil(count / limit), // Total number of pages
      currentPage: parseInt(page), // Current page number
      students, // Current page's student records
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/teacherInInstitution", verifyToken, async (req, res) => {
  const { institution_id } = req.query;
  if (!institution_id) {
    return res.status(400).json({ error: "Institution ID is required" });
  }

  try {
    const teachers = await Teacher.findAll({
      where: {
        institution_id: institution_id,
        is_teacher: true,
      },
      attributes: { exclude: ["password"] },
    });

    const teacherIds = teachers.map((teacher) => teacher.id);
    const classes = await Class.findAll({
      where: {
        teacher_id: teacherIds,
      },
    });
    // console.log(classes)
    const classMap = classes.reduce((map, cls) => {
      map[cls.teacher_id] = cls.name;
      return map;
    }, {});

    const teachersWithAllocationStatus = teachers.map((teacher) => {
      const classNames =
        classes
          .filter((cls) => cls.teacher_id === teacher.id)
          .map((cls) => cls.name)
          .join(", ") || "Not Allocated";

      const shifts =
        classes
          .filter((cls) => cls.teacher_id === teacher.id)
          .map((cls) => cls.shift)
          .join(", ") || "No Shift Assigned";

      return {
        trainingOrCompetition: teacher.training_or_competition,
        id: teacher.id,
        name: `${teacher.first_name} ${teacher.second_name} ${teacher.last_name}`,
        email: teacher.email,
        alreadyAllocated: classNames !== "Not Allocated",
        className: classNames,
        shift: shifts,
      };
    });

    res.status(200).json(teachersWithAllocationStatus);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/assignClass", verifyToken, async (req, res) => {
  const { teacher_id, class_id, teacher_shift_id } = req.body;

  if (!teacher_id || !class_id) {
    return res
      .status(400)
      .json({ error: "Teacher ID and Class ID are required" });
  }

  try {
    // Check if the teacher exists
    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Check if the class exists
    const classInstance = await Class.findByPk(class_id);
    if (!classInstance) {
      return res.status(404).json({ error: "Class not found" });
    }

    const teacherShift = await TeacherShift.findByPk(teacher_shift_id);
    if (!teacherShift) {
      return res.status(404).json({ error: "Teacher Shift not found" });
    }

    // If teacherShift already has a class_id, set the teacher_id of the old class to null
    if (teacherShift.class_id) {
      const oldClassInstance = await Class.findByPk(teacherShift.class_id);
      if (oldClassInstance) {
        oldClassInstance.teacher_id = null;
        await oldClassInstance.save();
      }
    }

    // Assign the new class_id to the teacherShift and update the classInstance
    teacherShift.class_id = class_id;
    await teacherShift.save();

    classInstance.teacher_id = teacher_id;
    await classInstance.save();

    res.status(200).json({ message: "Class assigned to teacher successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/teacherShift/:teacher_id", async (req, res) => {
  const { teacher_id } = req.params;
  try {
    const teacherShifts = await TeacherShift.findAll({
      where: { teacher_id },
    });

    res.status(200).json(teacherShifts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/unassignedClasses", verifyToken, async (req, res) => {
  const { institution_id, day, trainingOrCompetition } = req.query;
  if (!institution_id) {
    return res.status(404).json({ error: "Institution not found" });
  }

  try {
    const classes = await Class.findAll({
      where: {
        institution_id,
        teacher_id: null,
        date: day,
        [Op.or]: [
          { training_or_competition: trainingOrCompetition },
          { training_or_competition: null },
        ],
      },
    });
    // console.log(classes)
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/news", verifyToken, upload.single("news"), async (req, res) => {
  console.log(222);
  const { main_content, title } = req.body;
  const filePath = req.file ? path.join(req.file.filename) : null;
  try {
    const news = await News.create({
      main_content,
      image: filePath,
      title: title,
    });

    res.status(201).json(news);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post(
  "/latest-news",
  verifyToken,
  upload.single("news"),
  async (req, res) => {
    console.log(111);
    const { main_content, title } = req.body;
    const filePath = req.file ? path.join(req.file.filename) : null;
    try {
      const news = await PublicNews.create({
        main_content,
        image: filePath,
        title: title,
      });
      console.log(news);
      res.status(201).json(news);
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

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
            await fileAccess(imagePath, fs.constants.F_OK);
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

router.get("/latest-news", async (req, res) => {
  try {
    const newsItems = await PublicNews.findAll({
      order: [["date", "DESC"]],
      limit: 4,
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
            await fileAccess(imagePath, fs.constants.F_OK);
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

    res.status(200).json(newsWithImages);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
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
      try {
        await fileAccess(imagePath, fs.constants.F_OK);
        const imageBuffer = fs.readFileSync(imagePath);
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
        res.status(404).json({ error: "Image file not found" });
      }
    } else {
      res.status(200).json(news);
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/latest-news/:id", async (req, res) => {
  try {
    const news = await PublicNews.findByPk(req.params.id);
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    if (news.image) {
      const imagePath = path.resolve(__dirname, "..", "..", "news", news.image);
      try {
        await fileAccess(imagePath, fs.constants.F_OK);
        const imageBuffer = fs.readFileSync(imagePath);
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
        res.status(404).json({ error: "Image file not found" });
      }
    } else {
      res.status(200).json(news);
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Update a news item by ID
router.put("/news/:id", verifyToken, async (req, res) => {
  const { main_content, image } = req.body;

  try {
    const news = await News.findByPk(req.params.id);
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    news.main_content = main_content;
    news.image = image;
    await news.save();

    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Delete a news item by ID
router.delete("/news/:id", verifyToken, async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);
    if (!news) {
      return res.status(404).json({ error: "News not found" });
    }

    if (news.image) {
      const imagePath = path.resolve(__dirname, "..", "..", "news", news.image);
      try {
        await fileAccess(imagePath, fs.constants.F_OK);
        fs.unlink(imagePath, (err) => {
          if (err) {
            return res.status(500).json({
              error: "Something went wrong while deleting the image file",
            });
          }
        });
      } catch (err) {
        return res.status(404).json({ error: "Image file not found" });
      }
    }

    await news.destroy();
    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/students/:id", verifyToken, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/institutions/:id", verifyToken, async (req, res) => {
  try {
    const institution = await Institution.findByPk(req.params.id);
    res.json(institution);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/teachers/:id", verifyToken, async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const institution = await Institution.findByPk(teacher.institution_id);
    const classes = await Class.findAll({
      where: { teacher_id: teacher.id },
    });

    const classNames =
      classes.map((cls) => cls.name).join(", ") || "Not Allocated";

    const teacherDetails = {
      id: teacher.id,
      first_name: teacher.first_name,
      second_name: teacher.second_name,
      last_name: teacher.last_name,
      email: teacher.email,
      phone_number: teacher.phone_number,
      sex: teacher.sex,
      region: teacher.region,
      woreda: teacher.woreda,
      level_of_teaching: teacher.level_of_teaching,
      shift: teacher.shift,
      is_teacher: teacher.is_teacher,
      institution: institution ? institution.name : "Unknown Institution",
      classes: classNames,
      chosen_institution: teacher.chosen_institution,
      campus: teacher.campus,
      date: teacher.date,
    };
    res.json(teacherDetails);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/download_application", verifyToken, async (req, res) => {
  const { application_id, teacher_id } = req.body;

  try {
    let teacher;

    if (teacher_id) {
      // Fetch teacher directly using teacher_id
      teacher = await Teacher.findByPk(teacher_id);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
    } else if (application_id) {
      // Fetch application using application_id
      const application = await Application.findByPk(application_id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      // Fetch teacher associated with the application
      teacher = await Teacher.findByPk(application.teacher_id);
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }
    } else {
      return res.status(400).json({
        error: "Either application_id or teacher_id must be provided",
      });
    }

    // Function to sanitize the email for creating valid folder names
    function sanitizeEmailForFolder(email) {
      return email.replace(/[^a-zA-Z0-9]/g, "_");
    }

    // Resolve the file path
    const filePath = path.resolve(
      __dirname,
      "..",
      "..",
      "cv",
      // sanitizeEmailForFolder(teacher.email),
      teacher.cv
    );

    // Check if the file exists
    try {
      await fileAccess(filePath, fs.constants.F_OK);
    } catch (err) {
      return res.status(404).json({ error: "CV file not found" });
    }

    // Set headers for PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${teacher.cv}"`
    );

    // Create and pipe the file stream to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Handle file stream errors
    fileStream.on("error", (err) => {
      res
        .status(500)
        .json({ error: "Something went wrong while reading the file" });
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/application", async (req, res) => {
  const { id, status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const application = await Application.findByPk(id);

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }
    const teacher = await Teacher.findByPk(application.teacher_id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    if (!teacher.is_teacher) {
      teacher.status = status;
      if (status === "approved") {
        teacher.is_teacher = true;
      }
      await teacher.save();
    }

    application.application_status = status;

    await application.save();

    res
      .status(200)
      .json({ message: "Application and teacher status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/applications", verifyToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: applications } = await Application.findAndCountAll({
      where: {
        application_status: "pending",
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["submission_date", "DESC"]],
    });

    const teacherIds = applications.map((app) => app.teacher_id);
    const teachers = await Teacher.findAll({
      where: {
        id: teacherIds,
      },
    });

    const teacherMap = teachers.reduce((map, teacher) => {
      map[teacher.id] = teacher;
      return map;
    }, {});

    const applicationsWithTeachers = applications.map((app) => ({
      id: app.id,
      teacher_id: app.teacher_id,
      application_letter: app.application_letter,
      submission_date: app.submission_date,
      application_status: app.application_status,
      teacher: {
        name: `${teacherMap[app.teacher_id].first_name} ${
          teacherMap[app.teacher_id].second_name
        } ${teacherMap[app.teacher_id].last_name}`,
        cv: teacherMap[app.teacher_id].cv,
      },
    }));
    res.status(200).json({
      totalItems: count, // Total number of applications in the database
      totalPages: Math.ceil(count / limit), // Total number of pages
      currentPage: parseInt(page), // Current page number
      applications: applicationsWithTeachers, // Current page's application records
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/deleteTeacher", verifyToken, async (req, res) => {
  const { teacher_id } = req.body;

  try {
    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const applications = await Application.findAll({ where: { teacher_id } });
    const errors = [];

    for (const application of applications) {
      const fullCvPath = path.join(
        __dirname,
        "..",
        "..",
        "cv",
        application.application_letter
      );
      try {
        await fileAccess(fullCvPath, fs.constants.F_OK);
        fs.unlinkSync(fullCvPath);
      } catch (err) {
        errors.push(`Error deleting file for application ${application.id}`);
      }
      await application.destroy();
    }

    await teacher.destroy();

    if (errors.length > 0) {
      return res.status(500).json({ errors });
    }

    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

function validateInstitution() {
  return [
    body("name").exists().withMessage("Name is required"),
    body("level").exists().withMessage("Level is required"),
    body("region").exists().withMessage("Region is required"),
    body("city").exists().withMessage("City is required"),
    body("woreda")
      .exists()
      .withMessage("Woreda is required")
      .isNumeric()
      .withMessage("Woreda must be a number"),
    body("free_classes_morning")
      .exists()
      .isNumeric()
      .withMessage("Free classes in the morning is required"),
    body("free_classes_afternoon")
      .exists()
      .isNumeric()
      .withMessage("Free classes in the afternoon is required"),
    body("free_classes_night")
      .exists()
      .isNumeric()
      .withMessage("Free classes at night is required"),
  ];
}

router.post(
  "/institution",
  verifyToken,
  validateInstitution(),
  async (req, res) => {
    const {
      name,
      level,
      region,
      city,
      woreda,
      free_classes_morning,
      free_classes_afternoon,
      free_classes_night,
    } = req.body;
    try {
      const institution = await Institution.create({
        name,
        level,
        region,
        city,
        woreda,
        free_classes_morning,
        free_classes_afternoon,
        free_classes_night,
      });
      const capacity = 30;

      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const maxClasses = Math.max(
        free_classes_morning,
        free_classes_afternoon,
        free_classes_night
      );

      for (let i = 0; i < maxClasses; i++) {
        for (const day of days) {
          await Class.create({
            name: `Class ${i + 1}`,
            institution_id: institution.id,
            free_space_morning: i < free_classes_morning ? capacity : 0,
            free_space_afternoon: i < free_classes_afternoon ? capacity : 0,
            free_space_night: i < free_classes_night ? capacity : 0,
            date: day,
            // teacher_id: i < free_classes_morning || i < free_classes_afternoon || i < free_classes_night ? null : 999999,
          });
        }
      }
      res.json(institution);
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

router.put(
  "/editInstitution",
  verifyToken,
  validateInstitution(),
  async (req, res) => {
    const { name, id, level, region, city, woreda } = req.body;
    try {
      const institution = await Institution.findByPk(id);
      if (!institution) {
        return res.status(404).json({ error: "Institution not found" });
      }

      institution.name = name;
      institution.level = level;
      institution.region = region;
      institution.city = city;
      institution.woreda = woreda;

      await institution.save();

      res
        .status(200)
        .json({ message: "Institution updated successfully", institution });
    } catch (e) {
      return res.status(500).json({ error: "something went wrong " });
    }
  }
);

router.get("/regions/", async (req, res) => {
  try {
    const regions = await Region.findAll();
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});
router.get("/city/", async (req, res) => {
  try {
    const city = await City.findAll();
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post(
  "/city",
  verifyToken,
  [body("name").notEmpty().withMessage("Name is required")],
  async (req, res) => {
    console.log(1);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    try {
      const region = await City.create({ name });
      res.status(201).json(region);
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

router.post(
  "/region",
  verifyToken,
  [body("name").notEmpty().withMessage("Name is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    try {
      const region = await Region.create({ name });
      res.status(201).json(region);
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

router.get("/institutions", async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    const searchCondition = search
      ? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { city: { [Op.like]: `%${search}%` } },
            { woreda: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows: institutions } = await Institution.findAndCountAll({
      where: { ...searchCondition },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    res.json({
      totalItems: count, // Total number of institutions in the database
      totalPages: Math.ceil(count / limit), // Total number of pages
      currentPage: parseInt(page), // Current page number
      institutions, // Current page's institution records
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/institution/", async (req, res) => {
  try {
    const institutions = await Institution.findAll();
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/institution/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const institutions = await Institution.findAll({
      where: { region: student.region_id },
    });

    res.json(institutions);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/teachers", verifyToken, async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    const searchCondition = search
      ? {
          [Op.or]: [
            { email: { [Op.like]: `%${search}%` } },
            { first_name: { [Op.like]: `%${search}%` } },
            { last_name: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows: teachers } = await Teacher.findAndCountAll({
      where: { ...searchCondition, is_teacher: true, paid: true },
      attributes: { exclude: ["password"] },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const institutionIds = teachers.map((teacher) => teacher.institution_id);
    const institutions = await Institution.findAll({
      where: { id: institutionIds },
    });

    const institutionMap = institutions.reduce((map, institution) => {
      map[institution.id] = institution.name;
      return map;
    }, {});

    const teacherIds = teachers.map((teacher) => teacher.id);
    const classes = await Class.findAll({
      where: { teacher_id: teacherIds },
    });

    const classMap = classes.reduce((map, cls) => {
      if (!map[cls.teacher_id]) {
        map[cls.teacher_id] = [];
      }
      map[cls.teacher_id].push(cls.name);
      return map;
    }, {});

    const teachersWithDetails = teachers.map((teacher) => {
      return {
        id: teacher.id,
        first_name: teacher.first_name,
        second_name: teacher.second_name,
        last_name: teacher.last_name,
        email: teacher.email,
        phone_number: teacher.phone_number,
        sex: teacher.sex,
        region: teacher.region,
        woreda: teacher.woreda,
        level_of_teaching: teacher.level_of_teaching,
        shift: teacher.shift,
        is_teacher: teacher.is_teacher,
        institution:
          institutionMap[teacher.institution_id] || "Unknown Institution",
        classes: classMap[teacher.id]
          ? classMap[teacher.id].join(", ")
          : "Not Allocated",
        chosen_institution: teacher.chosen_institution,
        campus: teacher.campus,
        date: teacher.date,
      };
    });

    res.json({
      totalItems: count, // Total number of teachers in the database
      totalPages: Math.ceil(count / limit), // Total number of pages
      currentPage: parseInt(page), // Current page number
      teachers: teachersWithDetails, // Current page's teacher records with details
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email: email } });

    if (!admin) {
      return res.status(404).json({ error: "Incorrect password or username" });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect password or username" });
    }
    const admin_token = jwt.sign(
      { id: admin.id, role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res.status(200).json({ admin_token });
  } catch (error) {
    res.status(400).json({ error: "Something went wrong" });
  }
});

router.get("/payments", verifyToken, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: payments } = await Payment.findAndCountAll({
      where: { status: "pending" },
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.status(200).json({
      totalItems: count, // Total number of payments in the database
      totalPages: Math.ceil(count / limit), // Total number of pages
      currentPage: parseInt(page), // Current page number
      payments, // Current page's payment records
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/payments/:id", verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const student = await Student.findByPk(payment.student_id, {
      attributes: { exclude: ["password"] },
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    const imageUrl = payment.picture
      ? `${req.protocol}://${req.get("host")}/receipts/${payment.picture}`
      : null;
    payment.picture = imageUrl;
    res.status(200).json({ payment, student, imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/payment",
  verifyToken,
  [
    body("student_id").isInt().withMessage("Student ID must be an integer"),
    body("status")
      .isIn(["paid", "overdue", "pending", "rejected"])
      .withMessage("Invalid status"),
    body("payment_id").isInt().withMessage("Payment ID must be an integer"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { student_id, status, payment_id } = req.body;

    try {
      const payment = await Payment.findByPk(payment_id);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      payment.status = status;
      await payment.save();

      const student = await Student.findByPk(student_id, {
        attributes: { exclude: ["password"] },
      });
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      if (student.class_id) {
        return res
          .status(400)
          .json({ error: "Student already assigned to a class" });
      }

      if (status === "paid") {
        await processAndAssignClass(student);
      }

      res.status(201).json(payment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export async function processAndAssignClass(student) {
  console.log("process and assign class");
  const shift = student.shift1; // Only one shift
  const days = [student.date1, student.date2].filter(Boolean); // Handle multiple days
  const trainingOrCompetition = student.training_or_competition;

  const classesPromises = days.map((day) => {
    return Class.findAll({
      where: {
        institution_id: student.chosen_institution,
        date: day,
        [Op.or]: [
          { training_or_competition: trainingOrCompetition },
          { training_or_competition: null },
        ],
        ...(() => {
          switch (shift) {
            case "morning":
              return { free_space_morning: { [Op.gt]: 0 } };
            case "afternoon":
              return { free_space_afternoon: { [Op.gt]: 0 } };
            case "night":
              return { free_space_night: { [Op.gt]: 0 } };
            default:
              return {};
          }
        })(),
      },
      attributes: ["id", "name", "date"],
      order: [["id", "ASC"]],
    });
  });

  const classResults = await Promise.all(classesPromises);

  const availableClassesByDay = classResults.map((classes) =>
    classes.map((cls) => cls.name)
  );

  const intersectionClassNames = availableClassesByDay.reduce((acc, curr) =>
    acc.filter((name) => curr.includes(name))
  );

  if (intersectionClassNames.length === 0) {
    throw new Error("No available classes for all selected days");
  }

  const selectedClassName = intersectionClassNames.sort()[0];

  // Retrieve the selected class for each day based on the name
  const selectedClasses = await Promise.all(
    days.map((day) =>
      Class.findOne({
        where: {
          institution_id: student.chosen_institution,
          name: selectedClassName,
          date: day,
        },
      })
    )
  );

  if (selectedClasses.includes(null)) {
    throw new Error("Selected class not found for one or more days");
  }

  student.class_id = selectedClasses[0].id;
  student.class2 = selectedClasses.length > 1 ? selectedClasses[1].id : null;
  student.payment_status = "completed";
  student.training_or_competition = trainingOrCompetition;
  await student.save();

  // Decrease the free space for the selected classes
  for (let selectedClass of selectedClasses) {
    if (shift === "morning") {
      selectedClass.free_space_morning -= 1;
    } else if (shift === "afternoon") {
      selectedClass.free_space_afternoon -= 1;
    } else if (shift === "night") {
      selectedClass.free_space_night -= 1;
    }
    selectedClass.training_or_competition = trainingOrCompetition;
    await selectedClass.save();
  }
}

// router.post(
//   "/payment",
//   verifyToken,
//   [
//     body("student_id").isInt().withMessage("Student ID must be an integer"),
//     body("status")
//       .isIn(["paid", "overdue", "pending", "rejected"])
//       .withMessage("Invalid status"),
//     body("payment_id").isInt().withMessage("Payment ID must be an integer"),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { student_id, status, payment_id } = req.body;

//     try {
//       const payment = await Payment.findByPk(payment_id);
//       if (!payment) {
//         return res.status(404).json({ error: "Payment not found" });
//       }

//       payment.status = status;
//       await payment.save();

//       const student = await Student.findByPk(student_id, {
//         attributes: { exclude: ["password"] },
//       });
//       if (!student) {
//         return res.status(404).json({ error: "Student not found" });
//       }
//       if (student.class_id){return res.status(400).json({ error: "Student already assigned to a class" });}

//       if (status === "paid") {
//         const shifts = [student.shift1, student.shift2].filter(Boolean); // Filter out any falsy values
//         const days = [student.date1, student.date2].filter(Boolean); // Filter out any falsy values
//         const trainingOrCompetition = student.training_or_competition;
//         // Find the classes based on available space, institution, days, and training/competition
//         const classesPromises = shifts.map((shift, index) => {
//           return Class.findAll({
//             where: {
//               institution_id: student.chosen_institution,
//               date: days[index],
//               [Op.or]: [
//                 { training_or_competition: trainingOrCompetition },
//                 { training_or_competition: null }
//               ],
//               ...(() => {
//                 switch (shift) {
//                   case 'morning':
//                     return { free_space_morning: { [Op.gt]: 0 } };
//                   case 'afternoon':
//                     return { free_space_afternoon: { [Op.gt]: 0 } };
//                   case 'night':
//                     return { free_space_night: { [Op.gt]: 0 } };
//                   default:
//                     return {};
//                 }
//               })(),
//             },
//             attributes: ['name'],
//             order: [["id", "ASC"]],
//           });
//         });

//         const [firstShiftClasses, secondShiftClasses] = await Promise.all(classesPromises);

//         const firstShiftClassNames = firstShiftClasses.map(cls => cls.name);
//         const secondShiftClassNames = secondShiftClasses ? secondShiftClasses.map(cls => cls.name) : [];

//         const intersectionClassNames = firstShiftClassNames.filter(name => secondShiftClassNames.includes(name));
//         const availableClassNames = intersectionClassNames.length > 0 ? intersectionClassNames : firstShiftClassNames;

//         if (availableClassNames.length === 0) {
//           return res.status(404).json({ error: "No available classes" });

//         }

//         const selectedClassName = availableClassNames.sort()[0];
//         const foundClass1 = await Class.findOne({
//           where: {
//             institution_id: student.chosen_institution,
//             name: selectedClassName,
//             date: days[0],
//           }
//         });

//         const foundClass2 = days[1] ? await Class.findOne({
//           where: {
//             institution_id: student.chosen_institution,
//             name: selectedClassName,
//             date: days[1],
//           }
//         }) : null;

//         if (!foundClass1 || (days[1] && !foundClass2)) {
//           return res.status(404).json({ error: "Selected class not found" });
//         }

//         student.class_id = foundClass1.id;
//         student.payment_status = "completed";
//         student.training_or_competition = trainingOrCompetition;
//         await student.save();

//         if (shifts[0] === "morning") {
//           foundClass1.free_space_morning -= 1;
//         } else if (shifts[0] === "afternoon") {
//           foundClass1.free_space_afternoon -= 1;
//         } else if (shifts[0] === "night") {
//           foundClass1.free_space_night -= 1;
//         }

//         foundClass1.training_or_competition = trainingOrCompetition;

//         if (shifts[1] && foundClass2) {
//           if (shifts[1] === "morning") {
//             foundClass2.free_space_morning -= 1;
//           } else if (shifts[1] === "afternoon") {
//             foundClass2.free_space_afternoon -= 1;
//           } else if (shifts[1] === "night") {
//             foundClass2.free_space_night -= 1;
//           }
//           foundClass2.training_or_competition = trainingOrCompetition;
//           await foundClass2.save();
//         }

//         await foundClass1.save();
//             }

//       res.status(201).json(payment);

//     } catch (error) {
//       res.status(500).json({ error:error.message });
//     }
//   }
// );

router.get(
  "/allocatedClassesInInstitution/:id",
  verifyToken,
  async (req, res) => {
    try {
      const classes = await Class.findAll({
        where: { institution_id: req.params.id, teacher_id: { [Op.ne]: null } },
      });

      const allocatedClassesInInstitution = classes
        .map((cls) => cls.name)
        .join(", ");
      res.json({ allocatedClasses: allocatedClassesInInstitution });
    } catch (error) {
      res.status(500).json({ error: "Something went wrong" });
    }
  }
);

// POST route to initialize a payment
router.post("/initialize-payment", async (req, res) => {
  try {
    // Extracting payment details from the request body
    const {
      amount,
      currency,
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      callback_url,
      return_url,
      customization,
    } = req.body;

    if (
      !amount ||
      !currency ||
      !email ||
      !first_name ||
      !last_name ||
      !phone_number ||
      !tx_ref ||
      !callback_url ||
      !return_url ||
      !customization
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Set the headers for the Chapa API request
    const headers = {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    // Construct the request body for Chapa
    const paymentBody = {
      amount,
      currency,
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      callback_url,
      return_url,
      customization: {
        title: customization.title,
        description: customization.description,
      },
    };

    // Send the POST request to Chapa
    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      paymentBody,
      { headers }
    );

    // Return Chapa response to the client
    return res.status(200).json(response.data);
  } catch (error) {
    // Handle errors gracefully
    if (axios.isAxiosError(error)) {
      console.error(
        "Error response from Chapa:",
        error.response?.data || error.message
      );
      return res.status(error.response?.status || 500).json({
        error:
          error.response?.data ||
          "An error occurred while processing the payment",
      });
    }

    console.error("Unexpected error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
