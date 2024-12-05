"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Cookies from "js-cookie";
import { useRouter, usePathname } from "next/navigation";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import axios from "axios";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch profile picture
  const fetchProfilePicture = async () => {
    const token = Cookies.get("student-token");
    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/students/profile-image",
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      const imageFile = new File([response.data], "profile-picture.jpg", {
        type: "image/jpeg",
      });
      setImage(imageFile);
    } catch (err) {
      console.error("Error fetching profile picture:", err);
    }
  };

  useEffect(() => {
    const token = Cookies.get("student-token");
    setIsAuthenticated(!!token);
    if (token) fetchProfilePicture();
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = () => {
    Cookies.remove("student-token");
    Cookies.remove("is_student");
    setIsAuthenticated(false);
    setImage(null);
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-md w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="text-xl font-semibold text-gray-800">
              <img src="/logo.jpg" className="block h-12 w-auto" alt="Log" />
            </a>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6 items-center">
            <a href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </a>
            {isAuthenticated ? (
              <>
                {image ? (
                  <div className="relative group">
                    <Image
                      src={URL.createObjectURL(image)}
                      alt="Profile Picture"
                      width={40}
                      height={40}
                      className="rounded-full cursor-pointer"
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 hidden group-hover:block">
                      <a
                        href="student/profile"
                        className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        Profile
                      </a>
                      <Button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign Out
                  </Button>
                )}
              </>
            ) : pathname === "/student/auth/signin" ? (
              <a
                href="/student/auth/signup"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign Up
              </a>
            ) : (
              <a
                href="/student/auth/signin"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign In
              </a>
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
        className={`md:hidden ${
          isOpen ? "block" : "hidden"
        } bg-white shadow-md`}
      >
        <div className="flex flex-col px-4 py-2">
          <a href="/" className="py-2 text-gray-600 hover:text-gray-900">
            Home
          </a>
          {isAuthenticated ? (
            <>
              {image && (
                <div className="flex items-center space-x-2 py-2">
                  <Image
                    src={URL.createObjectURL(image)}
                    alt="Profile Picture"
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <a
                    href="/profile"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    View Profile
                  </a>
                </div>
              )}
              <Button
                onClick={handleSignOut}
                className="py-2 text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </Button>
            </>
          ) : pathname === "/student/auth/signin" ? (
            <a
              href="/student/auth/signup"
              className="py-2 text-gray-600 hover:text-gray-900"
            >
              Sign Up
            </a>
          ) : (
            <a
              href="/student/auth/signin"
              className="py-2 text-gray-600 hover:text-gray-900"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
