"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import Cookies from "js-cookie";

const ChangeCVPage: React.FC = () => {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!cvFile) {
      setError("Please upload a CV file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("cv", cvFile);

      const token = Cookies.get("teacher-token");

      await axios.post(
        "https://takethestage-backend.vercel.app/teachers/changecv",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        console.log("Error Response:", err.response.data);
        setError(err.response.data.error || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Change CV</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Upload CV
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="mt-1 block w-full p-2 border rounded"
              required
            />
          </div>
          <Button type="submit" className="w-full bg-indigo-600 text-white">
            Submit
          </Button>
        </form>
        {error && (
          <Alert className="mt-4" variant="destructive">
            {error}
          </Alert>
        )}
        {success && (
          <Alert className="mt-4" variant="default">
            CV updated successfully!
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ChangeCVPage;
