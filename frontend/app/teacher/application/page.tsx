"use client";

import React, { useState } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

const SubmitApplicationPage: React.FC = () => {
  const [applicationLetter, setApplicationLetter] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const token = Cookies.get("teacher-token");

    try {
      await axios.post(
        "https://takethestage-backend.vercel.app/teachers/submit-application",
        {
          application_letter: applicationLetter,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      setApplicationLetter("");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-4">Submit Application</h2>
        {error && (
          <Alert className="mb-4" variant="destructive">
            {error}
          </Alert>
        )}
        {success && (
          <Alert className="mb-4" variant="default">
            Application submitted successfully!
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label className="block text-black">Application Letter</label>
            <textarea
              value={applicationLetter}
              onChange={(e) => setApplicationLetter(e.target.value)}
              className="mt-1 block w-full h-64 border border-gray-700 rounded-md shadow-sm"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitApplicationPage;
