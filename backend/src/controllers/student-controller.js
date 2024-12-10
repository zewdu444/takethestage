import { Router } from "express";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from "fs";
import Student from "../models/Student.js";
import Payment from "../models/Payment.js";
import Institution from "../models/Institution.js";
import Class from "../models/Class.js";
import Region from "../models/Region.js";
import Result from "../models/Result.js";
import { body, validationResult } from "express-validator";
import { fileURLToPath } from "url";
import uploads from "./image-upload.js";
import { Op } from "sequelize";

import { Chapa } from "chapa-nodejs";
import axios from "axios";

const chapa = new Chapa({
  secretKey: process.env.CHAPA_SECRET_KEY,
});

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function validateRegistration() {
  return [
    body("training_or_competition")
      .trim()
      .escape()
      .notEmpty()
      .isIn(["training", "competition"])
      .withMessage("Invalid value for training_or_competition"),
    body("chosen_institution")
      .trim()
      .escape()
      .notEmpty()
      .isInt()
      .withMessage("Chosen institution must be an integer"),
    body("shift")
      .trim()
      .escape()
      .notEmpty()
      .isIn(["morning", "afternoon", "night"])
      .withMessage("Invalid value for shift"),
    body("amount")
      .trim()
      .escape()
      .notEmpty()
      .isInt()
      .withMessage("Invalid value for shift"),
  ];
}

function validateStudent() {
  return [
    body("class_type")
      .trim()
      .escape()
      .isIn(["5678", "910", "11-12", "college", "university", "masters"])
      .withMessage("Invalid value for class_type"),
    body("email").trim().escape().isEmail().withMessage("Invalid email format"),
    body("grade").trim().escape().notEmpty().withMessage("Grade is required"),
    body("first_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("First name is required"),
    body("last_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Last name is required"),
    body("sex")
      .trim()
      .escape()
      .isIn(["male", "female"])
      .withMessage("Invalid sex value"),
    body("region_id")
      .trim()
      .escape()
      .isInt()
      .withMessage("Region ID must be an integer"),
    body("city_id").trim().escape().notEmpty().withMessage("City is required"),
    body("woreda").trim().escape().notEmpty().withMessage("Woreda is required"),
    body("phone_number")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Phone number is required"),
    body("parents_phone_number")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Parent's phone number is required"),
    body("password")
      .trim()
      .escape()
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];
}
router.get("/", (req, res) => {
  res.json({ message: "22Welcasdfome to the School Management System API" });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const studentId = req.user.id.toString(); // Ensure studentId is a string
      const uploadPath = path.join(
        __dirname,
        "..",
        "..",
        "receipts",
        studentId
      );
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true }); // Create folder if it doesn't exist
      }
      cb(null, uploadPath);
    } catch (error) {
      console.error("Error creating directory:", error);
      return cb(new Error("Directory creation error"), false); // Pass error to multer
    }
  },
  filename: (req, file, cb) => {
    const newFileName = `${Date.now()}-${file.originalname}`;
    cb(null, newFileName); // Save file with this name
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Only .jpeg, .png, and .gif formats are allowed!");
    error.statusCode = 400; // Set a status code for the error
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
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

router.post("/sign-up", validateStudent(), async (req, res) => {
  const errors = validationResult(req);
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    return res.json({ success: false });
  }
  console.log(req.body);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const {
      email,
      grade,
      first_name,
      last_name,
      sex,
      region_id,
      city_id,
      woreda,
      phone_number,
      parents_phone_number,
      password,
      class_type,
    } = req.body;

    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      console.log(222);
      return res.status(400).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await Student.create({
      password: hashedPassword,
      email,
      grade,
      first_name,
      last_name,
      sex,
      region_id,
      city: city_id,
      woreda,
      phone_number,
      parents_phone_number,
      class_type,
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const {
      email,
      grade,
      first_name,
      last_name,
      sex,
      city,
      woreda,
      phone_number,
      parents_phone_number,
    } = req.body;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (email && email !== student.email) {
      const existingStudent = await Student.findOne({ where: { email } });
      if (existingStudent) {
        return res.status(400).json({ error: "Email already exists" });
      }
      student.email = email;
    }

    student.grade = grade;
    student.first_name = first_name;
    student.last_name = last_name;
    student.sex = sex;
    student.city = city;
    student.woreda = woreda;
    student.phone_number = phone_number;
    student.parents_phone_number = parents_phone_number;

    await student.save();

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post(
  "/register",
  verifyToken,
  upload.single("receipt"),
  async (req, res) => {
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }
    const filePath = path.join(
      __dirname,
      "receipts",
      (req.file && req.file.filename) || ""
    );

    if (fs.existsSync(filePath)) {
      return res
        .status(400)
        .json({ error: "File with the same name already exists" });
    }
    const receiptPath = req.file
      ? path.join(req.user.id.toString(), req.file.filename)
      : null;
    if (receiptPath == null) {
      return res.status(400).json({ error: "Error uploading image" });
    }
    try {
      const chosenInstitution = await Institution.findByPk(
        req.body.chosen_institution
      );
      if (!chosenInstitution) {
        if (receiptPath) {
          fs.unlink(receiptPath, (err) => {
            if (err) {
              console.error("Error deleting uploaded image:", err);
            }
          });
        }
        return res.status(400).json({ error: "Invalid institution" });
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    try {
      const { training_or_competition } = req.body;
      const cv = req.file ? req.file.filename : null;
      console.log(req.body, "request body");

      if (!training_or_competition) {
        return res.status(400).json({ error: "All fields are required" });
      }

      let parsedDays = [];

      if (req.body.day) {
        parsedDays = [JSON.parse(req.body.day)];
      }

      // console.log(parsed)
      if (req.body.day_pair) {
        const dayPairs = JSON.parse(req.body.day_pair);

        for (const [day, shift] of Object.entries(dayPairs.shifts)) {
          parsedDays.push({ day, shift });
        }
      }
      console.log(parsedDays, "parsedDays");

      const studentId = req.user.id;
      const updateData = {
        training_or_competition: req.body.training_or_competition,
        chosen_institution: req.body.chosen_institution,
        date: new Date(),
        shift1: req.body.shift1,
        shift2: req.body.shift2,
        date1: req.body.date1,
        date2: req.body.date2,
      };

      if (training_or_competition === "competition") {
        updateData.shift1 = parsedDays[0]?.shift;
        updateData.date1 = parsedDays[0]?.day;
      } else {
        updateData.shift1 = parsedDays[0]?.shift;
        updateData.date1 = parsedDays[0]?.day;
        updateData.shift2 = parsedDays[1]?.shift;
        updateData.date2 = parsedDays[1]?.day;
      }

      const [updated] = await Student.update(updateData, {
        where: { id: studentId },
      });

      if (!updated) {
        return res.status(404).json({ error: "Student not found" });
      }
      console.log(updateData, "updated");
      const paymentData = {
        student_id: studentId,
        amount: req.body.amount,
        date: new Date(),
        status: "pending",
        picture: receiptPath,
      };

      const payment = await Payment.create(paymentData);

      if (payment) {
        res.status(200).json({ success: true, updateData: updateData });
      } else {
        res.status(400).json({ error: "Error creating payment" });
      }
    } catch (error) {
      res.status(400).json({ error: "unknown error", error: error.message });
    }
  }
);

router.post("/registerwithchapa", verifyToken, async (req, res) => {
  try {
    const chosenInstitution = await Institution.findByPk(
      req.body.chosen_institution
    );
    if (!chosenInstitution) {
      return res.status(400).json({ error: "Invalid institution" });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  try {
    const { training_or_competition } = req.body;

    if (!training_or_competition) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let parsedDays = [];

    if (req.body.day) {
      parsedDays = [JSON.parse(req.body.day)];
    }

    if (req.body.day_pair) {
      const dayPairs = JSON.parse(req.body.day_pair);

      for (const [day, shift] of Object.entries(dayPairs.shifts)) {
        parsedDays.push({ day, shift });
      }
    }

    const studentId = req.user.id;
    const updateData = {
      training_or_competition: req.body.training_or_competition,
      chosen_institution: req.body.chosen_institution,
      date: new Date(),
      shift1: req.body.shift1,
      shift2: req.body.shift2,
      date1: req.body.date1,
      date2: req.body.date2,
    };
    const tx_ref = await chapa.genTxRef();

    if (training_or_competition === "competition") {
      updateData.shift1 = parsedDays[0]?.shift;
      updateData.date1 = parsedDays[0]?.day;
    } else {
      updateData.shift1 = parsedDays[0]?.shift;
      updateData.date1 = parsedDays[0]?.day;
      updateData.shift2 = parsedDays[1]?.shift;
      updateData.date2 = parsedDays[1]?.day;
    }

    const [updated] = await Student.update(updateData, {
      where: { id: studentId },
    });

    if (!updated) {
      return res.status(404).json({ error: "Student not found" });
    }
    console.log(updateData, "updated");
    const paymentData = {
      tx_ref: tx_ref,
      student_id: studentId,
      amount: req.body.amount,
      date: new Date(),
      status: "pending",
      picture: "",
    };

    const payment = await Payment.create(paymentData);
    console.log(tx_ref, "reff");
    if (payment) {
      console.log("succccc");

      res.status(200).json({
        success: true,
        updateData: updateData,
        tx_ref: tx_ref,
        payment_id: payment.id,
      });
    } else {
      res.status(400).json({ error: "Error creating payment" });
    }
  } catch (error) {
    res.status(400).json({ error: "unknown error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ where: { email: email } });

    if (!student) {
      return res.status(404).json({ error: "incorrect password or email" });
    }

    const validPassword = await bcrypt.compare(password, student.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect password or email" });
    }
    const token = jwt.sign({ id: student.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    console.log(student.class_id, "class_id");
    res.status(200).json({
      token: token,
      role: "student",
      is_student: student.class_id != null,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/results", verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const results = await Result.findAll({ where: { student_id: studentId } });
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/schools", verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findByPk(studentId);

    const studentGrade = student.grade;

    const institutions = await Institution.findAll();

    const filteredInstitutions = institutions.filter((institution) => {
      return institution.level.includes(studentGrade);
    });

    res.json(filteredInstitutions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    let student = await Student.findByPk(studentId, {
      attributes: { exclude: ["password", "date"] },
    });
    let classes = null;
    if (student.class_id != null) {
      classes = await Class.findByPk(student.class_id, {
        attributes: ["name"],
      });
    }
    const region = await Region.findByPk(student.region_id);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const chosenInstitution = await Institution.findByPk(
      student.chosen_institution,
      {
        attributes: ["name"],
      }
    );

    const studentProfile = {
      ...student.toJSON(),
      region: region ? region.name : "not available",
      chosen_institution: chosenInstitution
        ? chosenInstitution.name
        : "not available",
      class: classes ? classes.name : null,
    };
    console.log(studentProfile, "profile");
    res.status(200).json({ profile: studentProfile });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/upload-profile",
  verifyToken,
  uploads.single("profile"),
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const profilePath = req.file ? req.file.filename : null;

      if (!profilePath) {
        return res.status(400).json({ error: "Error uploading image" });
      }

      const student = await Student.findByPk(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      student.profile = profilePath;
      await student.save();

      res.status(200).json({ success: true, profile: profilePath });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/profile-image/", verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    const imagePath = student.profile
      ? path.join(
          __dirname,
          "..",
          "..",
          "profile",
          studentId.toString(),
          student.profile
        )
      : null;

    if (!imagePath || !fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Profile image not found" });
    }

    const imageBuffer = fs.readFileSync(imagePath);
    res.setHeader("Content-Type", "image/jpeg");
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/payment", verifyToken, async (req, res) => {
  const studentId = req.user.id;
  const { payment_id } = req.body;
  const student = await Student.findByPk(studentId, {
    attributes: { exclude: ["password"] },
  });

  // Find the payment by ID
  const payment = await Payment.findByPk(payment_id);
  if (!payment || payment.student_id != studentId) {
    return res.status(404).json({ error: "Payment not found" });
  }

  const tx_ref = payment.tx_ref;

  try {
    const url = `https://api.chapa.co/v1/transaction/verify/${tx_ref}`;
    const headers = {
      Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    // Make a GET request to verify the transaction
    const response = await axios.get(url, { headers });
    const data = response.data;

    if (data.status === "success" && data.data.status === "success") {
      payment.status = "paid";
      await payment.save();

      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }

      student.payment_status = "completed";
      await student.save(); // Make sure to save the student after updating status
      if (student.class_id) {
        return res
          .status(200)
          .json({ message: "Payment verified successfully", payment });
      }
      await processAndAssignClass(student);

      return res
        .status(200)
        .json({ message: "Payment verified successfully", payment });
    } else {
      return res
        .status(400)
        .json({ error: "Payment verification failed", details: data });
    }
  } catch (error) {
    console.error("Error during payment verification:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

async function processAndAssignClass(student) {
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

router.get("/payment-status", verifyToken, async (req, res) => {
  const studentId = req.user.id;
  const student = await Student.findByPk(studentId);

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  const payments = await Payment.findAll({
    where: { student_id: studentId, status: "pending" },
  });
  if (!payments || payments.length === 0) {
    return res.status(404).json({ error: "Pending payments not found" });
  }

  try {
    for (const payment of payments) {
      console.log(payment.tx_ref, process.env.CHAPA_SECRET_KEY);
      const tx_ref = payment.tx_ref;
      const url = `https://api.chapa.co/v1/transaction/verify/${tx_ref}`;
      const headers = {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      };

      try {
        const response = await axios.get(url, { headers });
        const data = response.data;
        if (data.status !== "success" || data.data.status !== "success") {
          return res
            .status(400)
            .json({ error: "Payment verification failed", details: data });
        }
      } catch (error) {
        console.error("Error during payment verification:", error.message);
        return res
          .status(500)
          .json({ error: "Internal server error", details: error.message });
      }
      const data = response.data;
      console.log(data, "data");

      if (data.status === "success" && data.data.status === "success") {
        payment.status = "paid";
        await payment.save();
      }
    }

    const allPaid = payments.every((payment) => payment.status === "paid");
    if (allPaid) {
      student.payment_status = "completed";
      await student.save();

      if (!student.class_id) {
        await processAndAssignClass(student);
      }

      return res.status(200).json({ paid: true });
    } else {
      return res.status(400).json({ paid: false });
    }
  } catch (error) {
    console.error("Error during payment verification:", error.message);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

export default router;
