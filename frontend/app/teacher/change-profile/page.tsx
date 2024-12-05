"use client";

import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Assuming ShadCN components
import { Alert } from "@/components/ui/alert";
import Cookies from "js-cookie";

const ChangeProfile: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
      setSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("profile", file);

    try {
      const token = Cookies.get("teacher-token");
      const response = await axios.post(
        "https://takethestage-backend.vercel.app/teachers/upload-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setError(null);
        setFile(null);
        setPreview(null);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="p-8 w-full max-w-lg bg-white rounded-lg shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            Change Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent className="mt-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-4"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
            />
            {preview && (
              <div className="mt-4">
                <Image
                  src={preview}
                  alt="Profile preview"
                  width={150}
                  height={150}
                  className="rounded-full border-4 border-indigo-600 shadow-md"
                />
              </div>
            )}
            <button
              type="submit"
              className="py-2 px-6 bg-indigo-600 text-white rounded-full shadow-md font-semibold hover:bg-indigo-700 transition-colors"
            >
              Upload
            </button>
          </form>
          {error && (
            <Alert className="mt-4" variant="destructive">
              {error}
            </Alert>
          )}
          {success && (
            <Alert className="mt-4" variant="default">
              Profile picture updated successfully!
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangeProfile;
