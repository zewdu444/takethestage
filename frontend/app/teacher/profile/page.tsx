"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface Profile {
  first_name: string;
  second_name: string;
  last_name: string;
  email: string;
  level_of_teaching: string;
  region: string;
  woreda: string;
  sex: string;
  phone_number?: string;
  institution_name?: string;
  campus?: string;
  shift: string;
  date?: string;
  is_teacher: boolean;
}

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-200 to-blue-300">
    <Card className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl animate-pulse">
      <CardContent className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-gray-500" size={40} />
      </CardContent>
    </Card>
  </div>
);

const TeacherProfile: React.FC = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<File | null>(null);

  const fetchProfilePicture = async () => {
    const token = Cookies.get("teacher-token");
    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/teachers/profile-image",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    fetchProfilePicture();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get("teacher-token");

      try {
        const response = await axios.get(
          "https://takethestage-backend.vercel.app/teachers/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProfile(response.data);
        setLoading(false);
      } catch (error) {
        setError(
          axios.isAxiosError(error)
            ? error.response?.data.error || "An error occurred"
            : "An error occurred"
        );
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) return <Spinner />;
  if (error)
    return (
      <Alert className="mt-4" variant="destructive">
        {error}
      </Alert>
    );

  return (
    <div className="bg-white p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:space-x-8">
        {/* Profile Image Section */}
        <div className="w-full md:w-[20%] flex justify-center mb-8 md:mb-0">
          <div className="w-56 h-56 md:w-40 md:h-40 rounded-full overflow-hidden flex items-center justify-center">
            {image ? (
              <Image
                src={URL.createObjectURL(image)}
                alt="Profile Picture"
                width={500}
                height={500}
              />
            ) : (
              "No picture available"
            )}
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="w-full md:w-[80%] flex flex-col md:flex-row gap-6">
          <Card className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gradient from-indigo-600 to-pink-600 bg-clip-text">
                Teacher Profile
              </CardTitle>
            </CardHeader>
            {profile && (
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-base">
                <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <strong className="text-indigo-600">First Name:</strong>{" "}
                  {profile.first_name}
                </div>
                <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <strong className="text-indigo-600">Second Name:</strong>{" "}
                  {profile.second_name}
                </div>
                <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <strong className="text-indigo-600">Last Name:</strong>{" "}
                  {profile.last_name}
                </div>
                <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <strong className="text-indigo-600">Email:</strong>{" "}
                  {profile.email}
                </div>
                <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <strong className="text-indigo-600">
                    Level of Teaching:
                  </strong>{" "}
                  {profile.level_of_teaching}
                </div>
                <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <strong className="text-indigo-600">Region:</strong>{" "}
                  {profile.region}
                </div>
                <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <strong className="text-indigo-600">Woreda:</strong>{" "}
                  {profile.woreda}
                </div>
                <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <strong className="text-indigo-600">Sex:</strong>{" "}
                  {profile.sex}
                </div>
                <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <strong className="text-indigo-600">Phone Number:</strong>{" "}
                  {profile.phone_number ?? "N/A"}
                </div>
                <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <strong className="text-indigo-600">Institution:</strong>{" "}
                  {profile.institution_name ?? "N/A"}
                </div>
                <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <strong className="text-indigo-600">Campus:</strong>{" "}
                  {profile.campus ?? "N/A"}
                </div>
                <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                  <strong className="text-indigo-600">Shift:</strong>{" "}
                  {profile.shift}
                </div>

                {profile.is_teacher && (
                  <div className="p-4 rounded-lg shadow-sm flex items-center gap-3">
                    <strong className="text-indigo-600">Is Teacher:</strong> Yes
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
