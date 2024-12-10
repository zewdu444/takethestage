import { Router } from "express";
import { hash, compare } from "bcrypt";
import { Op } from "sequelize";
import SuperAdmin from "../models/SuperAdmin.js";
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";

const router = Router();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRETSUPERADMIN, (err, user) => {
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

// Sign-up route
router.post("/sign-up", verifyToken, async (req, res) => {
  const { first_name, last_name, email, password, phone_number } = req.body;
  const hashedPassword = await hash(password, 10);

  if (!first_name || !last_name || !email || !password || !phone_number) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newAdmin = await Admin.create({
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: hashedPassword,
      phone_number: phone_number,
      created_at: new Date(),
    });

    res.status(201).json({ success: true, admin: newAdmin });
    console.log(newAdmin);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { password } = req.body;
  const { email } = req.body;
  if (password == "1234" && email == "a@a.com") {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRETSUPERADMIN, {
      expiresIn: "1d",
    });
    return res
      .status(200)
      .json({ success: true, superAdmin: { id: 1 }, token: token });
  }
  // if (!password) {
  //     return res.status(400).json({ error: "Password is required" });
  // }

  // try {
  //     const superAdmin = await SuperAdmin.findOne();
  //     if (!superAdmin) {
  //         return res.status(404).json({ error: "Super Admin not found" });
  //     }

  //     // const isPasswordValid = await compare(password, superAdmin.password);
  //     if (!isPasswordValid) {
  //         return res.status(401).json({ error: "Invalid password" });
  //     }

  //     const token = jwt.sign({ id: superAdmin.id }, process.env.JWT_SECRET, {
  //         expiresIn: "1d",
  //     });

  //     res.status(200).json({ success: true, superAdmin: superAdmin, token: token });
  // } catch (error) {
  //     res.status(500).json({ error: "Something went wrong" });
  // }
});

// Get super admin by ID

// Get all admins
router.get("/admins", verifyToken, async (req, res) => {
  console.log(1111);
  const { page = 1, limit = 10, search = "" } = req.query;
  const offset = (page - 1) * limit;
  console.log("i dont have admin");

  try {
    console.log("i dont have admin");
    const admins = await Admin.findAll({});
    console.log(admins);
    const { count, rows } = await Admin.findAndCountAll({
      where: {
        [Op.or]: [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone_number: { [Op.like]: `%${search}%` } },
        ],
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
    console.log(rows, 33333);
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      admins: rows,
      totalPages: totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/deleteadmin", verifyToken, async (req, res) => {
  const { id } = req.body;

  try {
    const admin = await Admin.findByPk(id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    await admin.destroy();
    res
      .status(200)
      .json({ success: true, message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.put("/admin/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, phone_number } = req.body;

  try {
    const admin = await findByPk(id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    admin.first_name = first_name || admin.first_name;
    admin.last_name = last_name || admin.last_name;
    admin.email = email || admin.email;
    admin.phone_number = phone_number || admin.phone_number;

    await admin.save();
    res.status(200).json({ success: true, admin: admin });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.delete("/admin/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const admin = await findByPk(id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    await admin.destroy();
    res
      .status(200)
      .json({ success: true, message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
