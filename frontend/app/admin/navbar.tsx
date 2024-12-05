"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai"; // Import icons for menu

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!Cookies.get("admin-token");
  });
  const router = useRouter();
  const pathname = usePathname();



  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = () => {
    Cookies.remove("admin-token");
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-md w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="text-xl font-semibold text-gray-800">
              <img
              src="/logo.jpg"
              className="block h-12 w-auto"

              alt="Logo"
              />
            </a>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6 items-center">
           
            {isAuthenticated ? (
              <Button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </Button>
            ) : (
              <>
                {pathname === "/admin/auth/signin" ? (
                  <a
                    href="/admin/auth/signup"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign Up
                  </a>
                ) : (
                  <a
                    href="/admin/auth/signin"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign In
                  </a>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-600 focus:outline-none"
            >
              {isOpen ? (
                <AiOutlineClose size={24} />
              ) : (
                <AiOutlineMenu size={24} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden ${isOpen ? "block" : "hidden"} bg-white shadow-md`}
      >
        <div className="flex flex-col px-4 py-2">
        
          {isAuthenticated ? (
            <Button
              onClick={handleSignOut}
              className="py-2 text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </Button>
          ) : (
            <>
              {pathname === "/admin/auth/signin" ? (
                <a
                  href="/admin/auth/signup"
                  className="py-2 text-gray-600 hover:text-gray-900"
                >
                  Sign Up
                </a>
              ) : (
                <a
                  href="/admin/auth/signin"
                  className="py-2 text-gray-600 hover:text-gray-900"
                >
                  Sign In
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}