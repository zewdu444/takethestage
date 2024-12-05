"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useRouter } from "next/navigation";

const TeacherSignUp: React.FC = () => {
  interface TeacherSignUpFormData {
    institution_id: string;
    first_name: string;
    second_name: string;
    last_name: string;
    level_of_teaching: string;
    region: string;
    woreda: string;
    sex: string;
    email: string;
    phone_number: string;
    password: string;
    chosen_institution: string;
    campus: string;
    cv: File | null;
  }

  const [formData, setFormData] = useState<TeacherSignUpFormData>({
    institution_id: "",
    first_name: "",
    second_name: "",
    last_name: "",
    level_of_teaching: "",
    region: "",
    woreda: "",
    sex: "",
    email: "",
    phone_number: "",
    password: "",
    chosen_institution: "",
    campus: "",
    cv: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [institutions, setInstitutions] = useState<
    { id: string; name: string }[]
  >([]);
  const router = useRouter();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3002/admins/institution"
        );
        setInstitutions(response.data);
        console.log(response.data, "data");
      } catch (err) {
        console.error("Error fetching institutions:", err);
      }
    };
    fetchInstitutions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      cv: e.target.files ? e.target.files[0] : null,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof typeof formData];
      if (value !== null) {
        formDataToSend.append(key, value);
      }
    });

    try {
      const response = await axios.post(
        "http://localhost:3002/teachers/sign-up",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        setSuccess(true);
        router.push("/teacher/auth/signin");
      }
    } catch (err) {
      console.log();
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "An error occurred");
      } else {
        setError("An error occurred");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-3xl font-bold mb-4 text-center">Teacher Sign Up</h2>
        {error && (
          <Alert className="mb-4" variant="destructive">
            {error}
          </Alert>
        )}
        {success && (
          <Alert className="mb-4" variant="default">
            Registration successful!
          </Alert>
        )}
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
            name="second_name"
            value={formData.second_name}
            onChange={handleChange}
            required
            placeholder="Second Name"
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
          <select
            name="level_of_teaching"
            value={formData.level_of_teaching}
            onChange={handleChange}
            required
            className="mb-4 bg-white"
          >
            <option value="">Level of Teaching</option>
            <option value="grade 5-8">Grade 5-8</option>
            <option value="grade 9-10">Grade 9-10</option>
            <option value="college">College</option>
            <option value="university">University</option>
            <option value="masters">Masters</option>
          </select>
          <Input
            type="text"
            name="region"
            value={formData.region}
            onChange={handleChange}
            required
            placeholder="Region"
            className="mb-4"
          />
          <Input
            type="text"
            name="woreda"
            value={formData.woreda}
            onChange={handleChange}
            required
            placeholder="Woreda"
            className="mb-4"
          />
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            required
            className="mb-4 bg-white"
          >
            <option value="">Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Email"
            className="mb-4"
          />
          <Input
            type="text"
            name="phone_number"
            value={formData.phone_number || "+251"}
            onChange={handleChange}
            pattern="\+251[0-9]{9}"
            maxLength={13} // +251 followed by 9 digits
            inputMode="numeric" // Ensures numeric keyboard on mobile devices
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
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
          <select
            name="institution_id"
            value={formData.institution_id}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-4 bg-white"
            required
          >
            <option value="">Select Institution</option>
            {institutions.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </select>
          <Input
            type="text"
            name="campus"
            value={formData.campus}
            onChange={handleChange}
            placeholder="Campus"
            className="mb-4 bg-white"
          />

          <Input
            type="file"
            name="cv"
            onChange={handleFileChange}
            required
            placeholder="Upload CV"
            className="mb-4"
          />
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TeacherSignUp;
