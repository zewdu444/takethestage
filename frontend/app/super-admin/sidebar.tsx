"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Using shadcn's Sheet for sidebar
import { FaBars, FaUserShield } from "react-icons/fa"; // Updated icons
import Cookies from "js-cookie"; // Importing Cookies from js-cookie
import { usePathname } from "next/navigation";

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const currentPath = usePathname();

  const handleToggleSidebar = () => {
    setOpen(!open);
  };

  const token = Cookies.get("admin-token");
  if (!token) {
    return <React.Fragment></React.Fragment>;
  }

  const isActive = (path: string) => currentPath === path; // Updated to check for equality

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
            <li title="Admins">
              <a href="/super-admin/admins">
                <FaUserShield
                  className={`text-2xl cursor-pointer ${
                    isActive("/admin/admins")
                      ? "text-indigo-600"
                      : "text-gray-600"
                  }`}
                />
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
        <SheetContent
          side="left"
          className="w-64 bg-white text-black shadow-lg"
        >
          <nav className="space-y-4 p-4">
            <ul>
              <li>
                <a href="/admin/admins">
                  <span
                    className={`block py-2 hover:bg-gray-200 ${
                      isActive("/admin/admins") ? "bg-gray-200" : ""
                    }`}
                  >
                    Admins
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
