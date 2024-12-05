"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  FaBars,
  FaFileAlt,
  FaUser,
  FaClipboardList,
  FaGraduationCap,
  FaUsers,FaBullhorn,
  FaUserEdit,FaUserCog,FaMoneyBillWave
} from "react-icons/fa";
import Cookies from "js-cookie";

const Sidebar = () => { 
  const [open, setOpen] = useState(false);
  const [isTeacherAssigned, setIsTeacherAssigned] = useState(false);
  const [activea, setActivea] = useState('');
  const currentPath = usePathname();
  const [is_paid, setIsPaid] = useState(false);

  // Fetch is_teacher status from cookie on component mount
  useEffect(() => {
    const isTeacher = Cookies.get("is_teacher") === "true"; // Assuming it stores "true" when assigned
    setIsTeacherAssigned(isTeacher);
    const isPaid = Cookies.get("is_paid") === "true"; 
    setIsPaid(isPaid);
  }, []);

  const handleToggleSidebar = () => {
    setOpen(!open);
  };
  const aClasses = (a: string) =>
    `text-2xl cursor-pointer ${activea === a ? 'text-indigo-600' : 'text-gray-600'}`;

  useEffect(() => {
    setActivea(currentPath);
  }, [currentPath]);

  if (!Cookies.get("teacher-token")) {
    return null;
  }


  if (!is_paid) {
    return (
      <div className="flex">
        {/* Sidebar Trigger */}
        <div className="relative h-full flex flex-col items-center bg-white shadow-lg">
          <div className="p-4">
            <FaBars
              className="text-2xl cursor-pointer"
              onClick={handleToggleSidebar}
            />
          </div>

          <nav className="space-y-4 p-4">
            <ul className="flex flex-col items-center space-y-4">
              {/* Payment */}
              <li title="Payment">
                <a href="/teacher/pay">
                  <FaMoneyBillWave className={aClasses("/teacher/pay")} />
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    );
  }
  <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger asChild>
      <div />
    </SheetTrigger>
    <SheetContent
      side="left"
      className="w-64 bg-white text-black shadow-lg"
    >
      <nav className="space-y-4 p-4">
        <ul>
          <li>
            <a href="/teacher/pay">
              <span className={`block py-2 hover:bg-gray-200 ${currentPath === "/teacher/pay" ? "text-indigo-600" : ""}`}>
                Pay
              </span>
            </a>
          </li>
        </ul>
      </nav>
    </SheetContent>
  </Sheet>

  return (

 
    <div className="flex">
      {/* Sidebar Trigger */}
      <div className="relative h-full flex flex-col items-center bg-white shadow-lg">
        <div className="p-4">
          <FaBars
            className="text-2xl cursor-pointer"
            onClick={handleToggleSidebar}
          />
        </div>

        <nav className="space-y-4 p-4">
          <ul className="flex flex-col items-center space-y-4">
            {/* Profile */}
            <li title="Profile">
              <a href="/teacher/profile">
                <FaUser className={aClasses("/teacher/profile")} />
              </a>
            </li>

            {/* Conditional as based on isTeacherAssigned */}
            {isTeacherAssigned && (
              <>
                <li title="Result">
                  <a href="/teacher/result">
                    <FaGraduationCap className={aClasses("/teacher/result")} />
                  </a>
                </li>
                <li title="Students">
                  <a href="/teacher/students">
                    <FaUsers className={aClasses("/teacher/students")} />
                  </a>
                </li>
              </>
            )}
            {!isTeacherAssigned && (
              <li title="Application">
                <a href="/teacher/application">
                  <FaClipboardList className={aClasses("/teacher/application")} />
                </a>
              </li>
            )}
            {/* Register - Only if not assigned */}
            {!isTeacherAssigned && (
              <li title="Register">
                <a href="/teacher/auth/register">
                  <FaUserCog className={aClasses("/teacher/auth/register")} />
                </a>
              </li>
            )}

            {/* Change CV - Always accessible */}
            <li title="Change CV">
              <a href="/teacher/changecv">
                <FaFileAlt className={aClasses("/teacher/changecv")} />
              </a>
            </li>

            {/* Change Profile - Always accessible */}
            <li title="Change Profile">
              <a href="/teacher/change-profile" onClick={() => setActivea('changeProfile')}>
                <FaUserEdit className={aClasses('changeProfile')} />
              </a>
            </li>

            {isTeacherAssigned && 
            <li title="News">
              <a href="/teacher/news">
              <FaBullhorn className={aClasses("/teacher/news")} />
              </a>
            </li>}
          </ul>
        </nav>
      </div>

      {/* Sidebar Content */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <div />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 bg-white text-black shadow-lg"
        >
          <nav className="space-y-4 p-4">
            <ul>
              <li>
                <a href="/teacher/profile">
                  <span className={`block py-2 hover:bg-gray-200 ${currentPath === "/teacher/profile" ? "text-indigo-600" : ""}`}>
                    Profile
                  </span>
                </a>
              </li>

              {/* Conditional
        >
          <nav className="space-y-4 p-4">
            <ul>
              <li>
                <a href="/teacher/profile">
                  <span className={`block py-2 hover:bg-gray-200 ${currentPath === "/teacher/profile" ? "text-indigo-600" : ""}`}>
                    Profile
                  </span>
                </a>
              </li>

              {/* Conditional as based on isTeacherAssigned */}
              {isTeacherAssigned && (
                <>
                  <li>
                    <a href="/teacher/application">
                      <span className={`block py-2 hover:bg-gray-200 ${currentPath === "/teacher/application" ? "text-indigo-600" : ""}`}>
                        Application
                      </span>
                    </a>
                  </li>
                  <li>
                    <a href="/teacher/result">
                      <span className={`block py-2 hover:bg-gray-200 ${currentPath === "/teacher/result" ? "text-indigo-600" : ""}`}>
                        Result
                      </span>
                    </a>
                  </li>
                  <li>
                    <a href="/teacher/students">
                      <span className={`block py-2 hover:bg-gray-200 ${currentPath === "/teacher/students" ? "text-indigo-600" : ""}`}>
                        Students
                      </span>
                    </a>
                  </li>
                </>
              )}

              {/* Register - Only if not assigned */}
              {!isTeacherAssigned && (
                <li>
                  <a href="/teacher/auth/register">
                    <span className={`block py-2 hover:bg-gray-200 ${currentPath === "/teacher/auth/register" ? "text-indigo-600" : ""}`}>
                      Register
                    </span>
                  </a>
                </li>
              )}

              {!isTeacherAssigned && (
                <li title="Application">
                  <a href="/teacher/application">
                    <span className={`block py-2 hover:bg-gray-200 ${currentPath === "/teacher/auth/register" ? "text-indigo-600" : ""}`}>
                      Application
                    </span>
                  </a>
                </li>
              )}
              {isTeacherAssigned && (
                <li title="Application">
                  <a href="/teacher/application">
                    <span className={`block py-2 hover:bg-gray-200 ${currentPath === "/teacher/auth/register" ? "text-indigo-600" : ""}`}>
                      News
                    </span>
                  </a>
                </li>
              )}

              {/* Change CV - Always accessible */}
              <li>
                <a href="/teacher/changecv">
                  <span className={`block py-2 hover:bg-gray-200 ${currentPath === "/teacher/changecv" ? "text-indigo-600" : ""}`}>
                    Change CV
                  </span>
                </a>
              </li>

              {/* Change Profile - Always accessible */}
              <li>
                <a href="/teacher/change-profile" onClick={() => setActivea('changeProfile')}>
                  <span className={`block py-2 hover:bg-gray-200 ${activea === 'changeProfile' ? 'text-indigo-600' : ''}`}>
                    Change Profile
                  </span>
                </a>
              </li>
            </ul>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Sidebar;
