"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Alert } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface StudentProfile {
  region: string;
  email: string;
  first_name: string;
  last_name: string;
  grade: string;
  sex: "male" | "female";
  city: string;
  woreda: string;
  phone_number: string | null;
  parents_phone_number: string;
  training_or_competition: "training" | "competition";
  chosen_institution: string | null;
  payment_status: "completed" | "pending" | "rejected";
  class?: string | null;
  profile_picture: string;
}

const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-200 to-blue-300">
    <div className="animate-pulse">
      <Loader2 className="animate-spin text-gray-500" size={40} />
    </div>
  </div>
);

const Profile: React.FC = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentProfile>();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const isStudent = Cookies.get("is_student");

  const fetchProfilePicture = async () => {
    const token = Cookies.get("student-token");
    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/students/profile-image",
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
      const token = Cookies.get("student-token");
      if (!token) {
        router.push("/student/auth/signin");
        setError("You need to be logged in to view this page");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          "https://takethestage-backend.vercel.app/students/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProfile(response.data.profile);
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

  const onSubmit = async (data: StudentProfile) => {
    const token = Cookies.get("student-token");
    try {
      await axios.put(
        "https://takethestage-backend.vercel.app/students/update-profile",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Profile updated successfully");
    } catch (error) {
      setError(
        axios.isAxiosError(error)
          ? error.response?.data.error || "An error occurred"
          : "An error occurred"
      );
    }
  };

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
                alt="Payment"
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
          {profile && (
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 text-base">
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">First Name:</strong>
                  <input
                    defaultValue={profile.first_name}
                    {...register("first_name", { required: true })}
                    className="border p-2 rounded bg-white"
                  />
                  {errors.first_name && <span>This field is required</span>}
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">Last Name:</strong>
                  <input
                    defaultValue={profile.last_name}
                    {...register("last_name", { required: true })}
                    className="border p-2 rounded bg-white"
                  />
                  {errors.last_name && <span>This field is required</span>}
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">Email:</strong>
                  <input
                    defaultValue={profile.email}
                    {...register("email", { required: true })}
                    className="border p-2 rounded bg-white"
                  />
                  {errors.email && <span>This field is required</span>}
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">Grade:</strong>
                  <input
                    defaultValue={profile.grade}
                    {...register("grade", { required: true })}
                    className="border p-2 rounded bg-white"
                  />
                  {errors.grade && <span>This field is required</span>}
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">Sex:</strong>
                  <select
                    defaultValue={profile.sex}
                    {...register("sex", { required: true })}
                    className="border p-2 rounded bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.sex && <span>This field is required</span>}
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">City:</strong>
                  <input
                    defaultValue={profile.city}
                    {...register("city", { required: true })}
                    className="border p-2 rounded bg-white"
                  />
                  {errors.city && <span>This field is required</span>}
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">Woreda:</strong>
                  <input
                    defaultValue={profile.woreda}
                    {...register("woreda", { required: true })}
                    className="border p-2 rounded bg-white"
                  />
                  {errors.woreda && <span>This field is required</span>}
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">Phone:</strong>
                  <input
                    defaultValue={profile.phone_number ?? ""}
                    {...register("phone_number")}
                    className="border p-2 rounded bg-white"
                  />
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">
                    Parent&apos;s Phone:
                  </strong>
                  <input
                    defaultValue={profile.parents_phone_number}
                    {...register("parents_phone_number", { required: true })}
                    className="border p-2 rounded bg-white"
                  />
                  {errors.parents_phone_number && (
                    <span>This field is required</span>
                  )}
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">Program:</strong>
                  {profile.training_or_competition}
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">Institution:</strong>
                  <input
                    defaultValue={profile.chosen_institution ?? ""}
                    {...register("chosen_institution")}
                    className="border p-2 rounded bg-white"
                    readOnly={!!isStudent}
                  />
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">Payment Status:</strong>
                  {profile.payment_status}
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">Class:</strong>
                  <input
                    defaultValue={profile.class ?? ""}
                    {...register("class")}
                    className="border p-2 rounded bg-white"
                    readOnly={true}
                  />
                </div>
                <div className="p-4 flex items-center gap-3">
                  <strong className="text-indigo-600">Region:</strong>
                  <input
                    defaultValue={profile.region ?? ""}
                    {...register("region")}
                    className="border p-2 rounded bg-white"
                    readOnly={!!isStudent}
                  />
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
                >
                  Update
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
