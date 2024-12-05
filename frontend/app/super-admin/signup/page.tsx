"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Cookies from "js-cookie";

const AdminSignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const cookie = Cookies.get("super-admin-token");
    if (!cookie) {
      // router.push('/super-admin/signin');
    }
  }, [router]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const { first_name, last_name, email, password, phone_number } = formData;

    if (!first_name || !last_name || !email || !password || !phone_number) {
      setError("All fields are required");
      return;
    }

    try {
      const cookie = Cookies.get("super-admin-token");
      const response = await axios.post(
        "https://takethestage-backend.vercel.app/superadmin/sign-up",
        { first_name, last_name, email, password, phone_number },
        {
          headers: {
            Authorization: `Bearer ${cookie}`,
          },
        }
      );

      if (response.status === 201) {
        setSuccess(true);
        // router.push("/admins");
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Admin Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            placeholder="First Name"
            className="mb-4"
          />
          <Input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
            placeholder="Last Name"
            className="mb-4"
          />
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className="mb-4"
          />
          <div className="relative mb-4">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Password"
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
            >
              {showPassword ? (
                <AiFillEyeInvisible size={20} />
              ) : (
                <AiFillEye size={20} />
              )}
            </button>
          </div>
          <Input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            placeholder="Phone Number"
            className="mb-4"
          />
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
        {error && (
          <Alert className="mt-4" variant="destructive">
            {error}
          </Alert>
        )}
        {success && (
          <Alert className="mt-4" variant="default">
            Sign up successful!
          </Alert>
        )}
      </div>
    </div>
  );
};

export default AdminSignUpPage;
