"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

interface Region {
  id: string;
  name: string;
}

const RegionsPage: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const fetchRegions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/admins/regions"
      );
      setRegions(response.data);
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

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const token = Cookies.get("admin-token");

    try {
      await axios.post(
        "https://takethestage-backend.vercel.app/admins/region",
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      setName("");
      fetchRegions();
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 mt-4">
      <div className="w-full max-w-md p-8 space-y-3 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Regions</h2>
        {error && (
          <Alert className="mb-4" variant="destructive">
            {error}
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">Region created successfully!</Alert>
        )}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Region"}
            </Button>
          </div>
        </form>
        <h3 className="text-xl font-bold mb-2">All Regions</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul className="list-disc pl-5">
            {regions.map((region) => (
              <li key={region.id}>{region.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RegionsPage;
