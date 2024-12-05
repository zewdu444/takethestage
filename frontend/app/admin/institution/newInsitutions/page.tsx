"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const NewInstitutionPage: React.FC = () => {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [region, setRegion] = useState("");
  const [regions, setRegions] = useState([]);
  const [city, setCity] = useState("");
  const [woreda, setWoreda] = useState("");
  const [freeClassesMorning, setFreeClassesMorning] = useState(0);
  const [freeClassesAfternoon, setFreeClassesAfternoon] = useState(0);
  const [freeClassesNight, setFreeClassesNight] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await axios.get(
          "https://takethestage-backend.vercel.app/admins/regions"
        );
        setRegions(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching regions:", err);
        setLoading(false);
      }
    };
    fetchRegions();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const token = Cookies.get("admin-token");

    try {
      const response = await axios.post(
        "https://takethestage-backend.vercel.app/admins/institution",
        {
          name,
          level,
          region,
          city,
          woreda,
          free_classes_morning: freeClassesMorning,
          free_classes_afternoon: freeClassesAfternoon,
          free_classes_night: freeClassesNight,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      // router.push(`/admin/institution/$`{response.data.id}`);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <CardContent className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-gray-500" size={40} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Institution</h2>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Name"
            className="mb-4"
          />
          <div className="mb-4">
            <label className="block text-gray-700">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white"
              required
            >
              <option value="">Select Level</option>
              <option value="5678">5-8</option>
              <option value="910">9-10</option>
              <option value="11-12">11-12</option>
              <option value="college">College</option>
              <option value="university">University</option>
              <option value="masters">Masters</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white"
              required
            >
              <option value="">Select Region</option>
              {regions.map((region: { id: number; name: string }) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            placeholder="City"
            className="mb-4"
          />
          <Input
            type="text"
            value={woreda}
            onChange={(e) => setWoreda(e.target.value)}
            required
            placeholder="Woreda"
            className="mb-4"
          />
          <Input
            type="number"
            value={freeClassesMorning === 0 ? "" : freeClassesMorning}
            onChange={(e) => setFreeClassesMorning(Number(e.target.value))}
            required
            placeholder="Free Classes Morning"
            className="mb-4"
            min={0}
          />
          <Input
            type="number"
            value={freeClassesAfternoon === 0 ? "" : freeClassesAfternoon}
            onChange={(e) => setFreeClassesAfternoon(Number(e.target.value))}
            required
            placeholder="Free Classes Afternoon"
            className="mb-4"
            min={0}
          />
          <Input
            type="number"
            value={freeClassesNight === 0 ? "" : freeClassesNight}
            onChange={(e) => setFreeClassesNight(Number(e.target.value))}
            required
            placeholder="Free Classes Night"
            className="mb-4"
            min={0}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Institution"}
          </Button>
        </form>
        {error && (
          <Alert className="mt-4" variant="destructive">
            {error}
          </Alert>
        )}
        {success && (
          <Alert className="mt-4" variant="default">
            Institution created successfully!
          </Alert>
        )}
      </div>
    </div>
  );
};

export default NewInstitutionPage;
