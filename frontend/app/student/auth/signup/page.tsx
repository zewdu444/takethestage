"use client";
import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Card, CardContent } from "@/components/ui/card"; // Import ShadCN Card components
import { Loader2 } from "lucide-react";

const classTypeMapping = {
  "6-9": "5678",
  "9-10": "910",
  "11-12": "11-12",
  college: "college",
  university: "university",
  masters: "masters",
};

const Signup: React.FC = () => {
  const router = useRouter();

  const [regions, setRegions] = useState<{ id: number; name: string }[]>([]);
  const [city, setCity] = useState<{ id: number; name: string }[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const response = await axios.get(
          "https://takethestage-backend.vercel.app/admins/city"
        );
        console.log("mk", response.data);
        setCity(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching regions:", err);
      }
    };
    fetchCity();
  }, []);
  const [formData, setFormData] = useState({
    email: "",
    grade: "",
    first_name: "",
    last_name: "",
    sex: "",
    region_id: "",
    city_id: "",
    woreda: "",
    phone_number: "",
    parents_phone_number: "",
    password: "",
    class_type: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const response = await axios.post(
        "https://takethestage-backend.vercel.app/students/sign-up",
        {
          ...formData,
          class_type:
            classTypeMapping[
              formData.class_type as keyof typeof classTypeMapping
            ],
        }
      );
      if (response.status === 201) {
        setSuccess(true);
        router.push("/student/auth/signin");
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response && err.response.data.error) {
          setError(err.response?.data.error || "An error occurred");
        } else if (err.response?.data?.errors) {
          const errorMessages = err.response?.data?.errors || [
            "An error occurred",
          ];
          const formattedErrors = errorMessages.map(
            (error: unknown) => (error as { msg: string }).msg || error
          );
          setError(formattedErrors.join(", "));
        }
      } else {
        setError("An error occurred");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 transition-opacity duration-700 ease-in-out opacity-100">
        <Card className=" p-6 rounded-lg shadow-md w-full max-w-2xl transform transition-transform duration-700 ease-in-out hover:scale-105">
          <CardContent className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-gray-500" size={40} />
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="bg-gray-100">
      <div className="flex items-center justify-center min-h-screen bg-gray-100 mt-4 transition-opacity duration-700 ease-in-out opacity-100">
        <div className="w-full max-w-md p-8 space-y-3 bg-white rounded-lg shadow transform transition-transform duration-700 ease-in-out hover:scale-105">
          <h1 className="text-2xl font-semibold text-center">Sign Up</h1>
          {success && <div className="text-green-500"> successful!</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full p-2 border rounded transition-colors duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <Input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full p-2 border rounded transition-colors duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded transition-colors duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <Input
              type="text"
              name="grade"
              placeholder="Grade"
              value={formData.grade}
              onChange={handleChange}
              className="w-full p-2 border rounded transition-colors duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              className="w-full p-2 border rounded  bg-white"
            >
              <option value="">Select Sex</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <select
              name="region_id"
              value={formData.region_id}
              onChange={handleChange}
              className="w-full p-2 border rounded duration-300 ease-in-out focus:ring-2 focus:outline-none bg-white"
              required
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>

            <select
              name="city_id"
              value={formData.city_id}
              onChange={handleChange}
              className="w-full p-2 border rounded duration-300 ease-in-out focus:ring-2 focus:outline-none bg-white"
              required
            >
              <option value="">Select City</option>
              {city.map((region) => (
                <option key={region.id} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>

            {/* <Input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 border rounded transition-colors duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            /> */}
            <Input
              type="text"
              name="woreda"
              placeholder="Woreda"
              value={formData.woreda}
              onChange={handleChange}
              className="w-full p-2 border rounded transition-colors duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
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
              className="w-full p-2 border rounded transition-colors duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <Input
              type="text"
              name="parents_phone_number"
              value={formData.parents_phone_number || "+251"}
              onChange={handleChange}
              pattern="\+251[0-9]{9}"
              maxLength={13} // +251 followed by 9 digits
              inputMode="numeric" // Ensures numeric keyboard on mobile devices
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              className="w-full p-2 border rounded transition-colors duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <select
              name="class_type"
              value={formData.class_type}
              onChange={handleChange}
              className="w-full p-2 border rounded transition-colors duration-300 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              required
            >
              <option value="">Select Class Type</option>
              {Object.keys(classTypeMapping).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            <div className="relative mb-4">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
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
              className="w-full transition-transform duration-300 ease-in-out hover:scale-105"
            >
              Sign up
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
              Sign up successful!
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;
