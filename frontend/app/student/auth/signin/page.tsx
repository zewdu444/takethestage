"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import Cookies from "js-cookie";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { FiLoader } from "react-icons/fi"; // For the spinner
import "normalize.css"; // Import Normalize.css

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // Spinner state
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const token = Cookies.get("student-token");
    if (token) {
      router.push("/student/profile");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true); // Show spinner

    try {
      interface LoginResponse {
        token: string;
        is_student: string;
      }

      const response = await axios.post<LoginResponse>(
        "https://takethestage-backend.vercel.app/students/login",
        { email, password },
        {}
      );

      if (response.status === 200) {
        setSuccess(true);
        const { token, is_student } = response.data;
        Cookies.set("student-token", token, {
          expires: 1,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
        });
        if (is_student) {
          Cookies.set("is_student", is_student.toString(), {
            expires: 1,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
          });
        }
        if (is_student) {
          router.push("/student/profile");
        } else {
          router.push("/student/auth/register");
        }
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false); // Hide spinner after request is complete
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 transition-opacity duration-700 ease-in-out opacity-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm transform transition-transform duration-700 ease-in-out hover:scale-105">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="mb-4 transition-colors duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <div className="relative mb-4">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full pr-10 transition-colors duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 transition-transform duration-300 ease-in-out hover:scale-110"
            >
              {showPassword ? (
                <AiFillEyeInvisible size={20} />
              ) : (
                <AiFillEye size={20} />
              )}
            </button>
          </div>
          <Button
            type="submit"
            className="w-full transition-transform duration-300 ease-in-out hover:scale-105 flex justify-center items-center"
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <FiLoader className="animate-spin mr-2 text-xl" /> // Spinner icon
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        {error && (
          <Alert
            className="mt-4 transition-opacity duration-500 ease-in-out opacity-100"
            variant="destructive"
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            className="mt-4 transition-opacity duration-500 ease-in-out opacity-100"
            variant="default"
          >
            Sign in successful!
          </Alert>
        )}
      </div>
    </div>
  );
};

export default SignInPage;
