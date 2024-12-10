import sequelize from "../../config/database.js";
import Admin from "./Admin.js";
import Institution from "./Institution.js";
import Class from "./Class.js";
import Teacher from "./Teacher.js";
import Student from "./Student.js";
import Attendance from "./Attendance.js";
import Payment from "./Payment.js";
import Application from "./Application.js";
import Region from "./Region.js";
import City from "./City.js";

import Result from "./Result.js";
import News from "./News.js";
import TeacherShift from "./TeacherShift.js";
import PublicNews from "./PublicNews.js";

console.log(111);
Class.belongsTo(Institution, { foreignKey: "institution_id" });

Class.belongsTo(Teacher, { foreignKey: "teacher_id" });
Student.belongsTo(Institution, { foreignKey: "chosen_institution" });
Student.belongsTo(Region, { foreignKey: "region_id" });
Student.belongsTo(Class, { foreignKey: "class_id" });
Student.belongsTo(Class, { foreignKey: "class2" });

Attendance.belongsTo(Student, { foreignKey: "student_id" });
Teacher.hasMany(TeacherShift, {
  foreignKey: "teacher_id",
});

TeacherShift.belongsTo(Teacher, {
  foreignKey: "teacher_id",
});

Payment.belongsTo(Student, { foreignKey: "student_id" });

Application.belongsTo(Teacher, { foreignKey: "teacher_id" });
Application.belongsTo(Institution, { foreignKey: "institution_id" });

Result.belongsTo(Student, { foreignKey: "student_id" });
Institution.belongsTo(Region, { foreignKey: "region" });
Region.hasMany(Student, { foreignKey: "region_id" });

export {
  sequelize,
  Admin,
  Institution,
  Class,
  Teacher,
  Student,
  PublicNews,
  Attendance,
  Payment,
  Region,
  Result,
  Application,
  News,
  TeacherShift,
  City,
};
