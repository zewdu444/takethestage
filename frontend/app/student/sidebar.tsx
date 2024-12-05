'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { FaBars, FaUser, FaClipboardList, FaRegEdit, FaUserEdit } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activea, setActivea] = useState(usePathname().split('/').pop()); 

  const handleToggleSidebar = () => {
    setOpen(!open);
  };

  const isStudent = Cookies.get('is_student') === 'true';
  const token = Cookies.get('student-token');

  if (!token) {
    return <React.Fragment></React.Fragment>;
  }
  const aClasses = (a: string) =>
    `text-2xl cursor-pointer ${activea === a ? 'text-indigo-600' : 'text-gray-600'}`;

  return (
    <div className="flex">
      {/* Sidebar Trigger */}
      <div className="relative h-full flex flex-col items-center bg-white shadow-lg">
        <div className="p-4">
          <FaBars className="text-2xl cursor-pointer" onClick={handleToggleSidebar} />
        </div>

        {/* Sidebar Icons */}
        <nav className="space-y-4 p-4">
          <ul className="flex flex-col items-center space-y-4">
            <li title="Profile">
              <a href="/student/profile" onClick={() => setActivea('profile')}>
                <FaUser className={aClasses('profile')} />
              </a>
            </li>

            {/* Only show Result if user is a student */}
            {isStudent && (
              <li title="Result">
                <a href="/student/result" onClick={() => setActivea('result')}>
                  <FaClipboardList className={aClasses('result')} />
                </a>
              </li>
            )}

            {/* Show Register only if user is not a student */}
            {!isStudent && (
              <li title="Register">
                <a href="/student/auth/register" onClick={() => setActivea('register')}>
                  <FaRegEdit className={aClasses('register')} />
                </a>
              </li>
            )}

            <li title="Change Profile">
              <a href="/student/change-profile" onClick={() => setActivea('changeProfile')}>
                <FaUserEdit className={aClasses('changeProfile')} />
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Sidebar Content */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <div />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-white text-black shadow-lg">
          <nav className="space-y-4 p-4">
            <ul>
              <li>
                <a href="/student/profile" onClick={() => setActivea('profile')}>
                  <span className={`block py-2 hover:bg-gray-200 ${activea === 'profile' ? 'text-indigo-600' : ''}`}>
                    Profile
                  </span>
                </a>
              </li>
              {isStudent && (
                <li>
                  <a href="/student/result" onClick={() => setActivea('result')}>
                    <span className={`block py-2 hover:bg-gray-200 ${activea === 'result' ? 'text-indigo-600' : ''}`}>
                      Result
                    </span>
                  </a>
                </li>
              )}
              {!isStudent && (
                <li>
                  <a href="/student/auth/register" onClick={() => setActivea('register')}>
                    <span className={`block py-2 hover:bg-gray-200 ${activea === 'register' ? 'text-indigo-600' : ''}`}>
                      Register
                    </span>
                  </a>
                </li>
              )}
              <li>
                <a href="/student/change-profile" onClick={() => setActivea('changeProfile')}>
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
