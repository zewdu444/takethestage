'use client';

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // Using shadcn's Sheet for sidebar
import { FaBars, FaBullhorn, FaClipboardCheck, FaSchool, FaMoneyBillWave, FaMapMarkedAlt, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa'; // Updated icons
import Cookies from 'js-cookie'; // Importing Cookies from js-cookie
import { usePathname } from 'next/navigation';

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const currentPath = usePathname();

  const handleToggleSidebar = () => {
    setOpen(!open);
  };

  const token = Cookies.get('admin-token');
  if (!token) {
    return <React.Fragment></React.Fragment>;
  }

  const isActive = (path: string) => currentPath === path; // Updated to check for equality

  return (
    <div className="flex">
      {/* Sidebar Trigger */}
      <div className="relative h-full flex flex-col items-center bg-white shadow-lg">
        <div className="p-4">
          <FaBars className="text-2xl cursor-pointer" onClick={handleToggleSidebar} />
        </div>

        <nav className="space-y-4 p-4">
          <ul className="flex flex-col items-center space-y-4">
            <li title="Applications">
              <a href="/admin/application">
                <FaClipboardCheck className={`text-2xl cursor-pointer ${isActive('/admin/application') ? 'text-indigo-600' : 'text-gray-600'}`} />
              </a>
            </li>
            <li title="Institutions">
              <a href="/admin/institution">
                <FaSchool className={`text-2xl cursor-pointer ${isActive('/admin/institution') ? 'text-indigo-600' : 'text-gray-600'}`} />
              </a>
            </li>
            <li title="Payments">
              <a href="/admin/payment">
                <FaMoneyBillWave className={`text-2xl cursor-pointer ${isActive('/admin/payment') ? 'text-indigo-600' : 'text-gray-600'}`} />
              </a>
            </li>
            <li title="Regions">
              <a href="/admin/region">
                <FaMapMarkedAlt className={`text-2xl cursor-pointer ${isActive('/admin/region') ? 'text-indigo-600' : 'text-gray-600'}`} />
              </a>
            </li>
            <li title="Students">
              <a href="/admin/students">
                <FaUserGraduate className={`text-2xl cursor-pointer ${isActive('/admin/students') ? 'text-indigo-600' : 'text-gray-600'}`} />
              </a>
            </li>
            <li title="Teachers">
              <a href="/admin/teachers">
                <FaChalkboardTeacher className={`text-2xl cursor-pointer ${isActive('/admin/teachers') ? 'text-indigo-600' : 'text-gray-600'}`} />
              </a>
            </li>
            <li title="announcements">
                <a href="/admin/news">
                <FaBullhorn className={`text-2xl cursor-pointer ${isActive('/admin/news') ? 'text-indigo-600' : 'text-gray-600'}`} />
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
                <a href="/admin/application">
                  <span className={`block py-2 hover:bg-gray-200 ${isActive('/admin/application') ? 'bg-gray-200' : ''}`}>Applications</span>
                </a>
              </li>
              <li>
                <a href="/admin/institution">
                  <span className={`block py-2 hover:bg-gray-200 ${isActive('/admin/institution') ? 'bg-gray-200' : ''}`}>Institutions</span>
                </a>
              </li>
              <li>
                <a href="/admin/payment">
                  <span className={`block py-2 hover:bg-gray-200 ${isActive('/admin/payment') ? 'bg-gray-200' : ''}`}>Payments</span>
                </a>
              </li>
              <li>
                <a href="/admin/region">
                  <span className={`block py-2 hover:bg-gray-200 ${isActive('/admin/region') ? 'bg-gray-200' : ''}`}>Regions</span>
                </a>
              </li>
              <li>
                <a href="/admin/students">
                  <span className={`block py-2 hover:bg-gray-200 ${isActive('/admin/students') ? 'bg-gray-200' : ''}`}>Students</span>
                </a>
              </li>
              <li>
                <a href="/admin/teachers">
                  <span className={`block py-2 hover:bg-gray-200 ${isActive('/admin/teachers') ? 'bg-gray-200' : ''}`}>Teachers</span>
                </a>
              </li>
              <li>
                <a href="/admin/news">
                  <span className={`block py-2 hover:bg-gray-200 ${isActive('/admin/teachers') ? 'bg-gray-200' : ''}`}>announcements</span>
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
