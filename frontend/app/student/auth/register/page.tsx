"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import Cookies from "js-cookie";
import { Student } from "../../../../type/student";

const RegisterPage: React.FC = () => {
  let [loading, setLoading] = useState(false);
  const dayPairs = [
    "Monday - Tuesday",
    "Monday - Wednesday",
    "Monday - Thursday",
    "Monday - Friday",
    "Monday - Saturday",
    "Tuesday - Wednesday",
    "Tuesday - Thursday",
    "Tuesday - Friday",
    "Tuesday - Saturday",
    "Wednesday - Thursday",
    "Wednesday - Friday",
    "Wednesday - Saturday",
    "Thursday - Friday",
    "Thursday - Saturday",
    "Friday - Saturday",
  ];

  const individualDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [trainingOrCompetition, setTrainingOrCompetition] = useState("");
  const [chosenInstitution, setChosenInstitution] = useState("");
  const amount = "100";
  const [receipt, setReceipt] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [institutions, setInstitutions] = useState<
    { id: number; name: string }[]
  >([]);
  const [student, setStudent] = useState<Student>();
  // States for Training
  const [selectedDayPair, setSelectedDayPair] = useState<{
    pair: string;
    shifts: { [day: string]: string };
  } | null>(null);

  // States for Competition
  const [selectedDay, setSelectedDay] = useState<{
    day: string;
    shift: string;
  } | null>(null);

  // State for Chapa payment
  // const [isChapaPaid, setIsChapaPaid] = useState(false);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const token = Cookies.get("teacher-token");
      try {
        const response = await axios.get(
          "https://takethestage-backend.vercel.app/students/payment-status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.paid) {
          Cookies.set("is_student", "true");
          router.push("/student/profile");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    };

    checkPaymentStatus();
  }, [router]);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await axios.get(
          "https://takethestage-backend.vercel.app/admins/institution"
        );
        setInstitutions(response.data);
        console.log(response.data, 1111);
      } catch (err) {
        console.error("Error fetching institutions:", err);
      }
    };
    fetchInstitutions();
  }, []);
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const token = Cookies.get("student-token");

        const response = await axios.get(
          "https://takethestage-backend.vercel.app/students/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setStudent(response.data.profile);
      } catch (error) {
        setError(
          axios.isAxiosError(error)
            ? error.response?.data.error || "An error occurred"
            : "An error occurred"
        );
      }
    };
    fetchInstitutions();
  }, []);

  useEffect(() => {
    const token = Cookies.get("student-token");
    if (!token) {
      router.push("/student/auth/signin"); // Redirect if not logged in
    }
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  // Handlers for Training
  const handleDayPairChange = (value: string) => {
    setSelectedDayPair({ pair: value, shifts: {} });
  };

  const handleShiftChangeForTraining = (
    day: string,
    day2: string,
    shift: string
  ) => {
    if (selectedDayPair) {
      const updated = { ...selectedDayPair };
      updated.shifts[day] = shift;
      updated.shifts[day2] = shift;
      setSelectedDayPair(updated);
    }
  };

  // Handlers for Competition
  const handleDayChange = (field: string, value: string) => {
    if (field === "day") {
      setSelectedDay({
        ...selectedDay,
        day: value,
        shift: selectedDay?.shift || "",
      });
    } else {
      setSelectedDay({ day: selectedDay?.day ?? "", shift: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate selections
    if (trainingOrCompetition === "training") {
      if (!selectedDayPair) {
        setError("Please select a day pair for training.");
        return;
      }
      const days = selectedDayPair.pair.split(" - ");
      for (const day of days) {
        if (!selectedDayPair.shifts[day]) {
          setError(
            `Please select a shift for ${day} in the training pair ${selectedDayPair.pair}.`
          );
          return;
        }
      }
    } else if (trainingOrCompetition === "competition") {
      if (!selectedDay || !selectedDay.day || !selectedDay.shift) {
        setError("Please select both day and shift for the competition.");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("training_or_competition", trainingOrCompetition);
      formData.append("chosen_institution", chosenInstitution);
      formData.append("amount", amount);
      if (receipt) {
        formData.append("receipt", receipt);
      }

      if (trainingOrCompetition === "training") {
        formData.append("day_pair", JSON.stringify(selectedDayPair));
      } else if (trainingOrCompetition === "competition") {
        formData.append("day", JSON.stringify(selectedDay));
      }

      const token = Cookies.get("student-token");
      console.log(
        formData.get("training_or_competition"),
        formData.get("chosen_institution"),
        formData.get("amount"),
        formData.get("receipt"),
        formData.get("day_pair"),
        formData.get("day")
      );
      console.log(88888);
      const response = await axios.post(
        "https://takethestage-backend.vercel.app/students/register",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        // router.push('/students');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        console.log(err.response.data);
        setError(err.response.data.error || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const handleChapaPayment = async () => {
    setLoading(true);
    try {
      const data = {
        training_or_competition: trainingOrCompetition,
        chosen_institution: chosenInstitution,
        amount: amount,
        day_pair:
          trainingOrCompetition === "training"
            ? JSON.stringify(selectedDayPair)
            : null,
        day:
          trainingOrCompetition === "competition"
            ? JSON.stringify(selectedDay)
            : null,
        receipt: receipt ?? undefined, // Only include receipt if necessary
      };

      const token = Cookies.get("student-token");

      const re = await axios.post(
        "https://takethestage-backend.vercel.app/students/registerwithchapa",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const handleChapa = async () => {
        const referenceNumber = re.data.tx_ref;

        const body = {
          amount: trainingOrCompetition === "competition" ? 315 : 215,
          currency: "ETB",
          email: student?.email ?? "",
          first_name: student?.first_name ?? "",
          last_name: student?.last_name ?? "",
          phone_number: student?.phone_number.substring(3) ?? "",
          tx_ref: referenceNumber,
          callback_url: `https://takethestage-backend.vercel.app/students/payment?payment_id=${re.data.payment_id}`,
          return_url: `${window.location.origin}/student/auth/register/success?payment_id=${re.data.payment_id}`,

          customization: {
            title: "fee",
            description: "school fee",
          },
        };
        console.log(body, "Body for Chapa payment");

        // localhost:3002/admins/initialize-payment"
        const baseUrl = `${window.location.origin}/student/auth/register/chapa`;

        const response = await axios.post(baseUrl, body);
        window.location.href = response.data.data.checkout_url;
      };

      handleChapa();
      setLoading(false);
    } catch (err) {
      console.error("Error with Chapa payment:", err);
      setError("Chapa payment failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-4">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">Register</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Dropdown for Training or Competition */}
          <select
            value={trainingOrCompetition}
            onChange={(e) => {
              setTrainingOrCompetition(e.target.value);
              // Reset selections when type changes
              setSelectedDayPair(null);
              setSelectedDay(null);
            }}
            className="w-full p-2 border rounded mb-4 bg-white"
            required
          >
            <option value="">Select Training or Competition</option>
            <option value="training">Training</option>
            <option value="competition">Competition</option>
          </select>

          {/* Dropdown for Institution */}
          <select
            value={chosenInstitution}
            onChange={(e) => setChosenInstitution(e.target.value)}
            className="w-full p-2 border rounded mb-4 bg-white"
            required
          >
            <option value="">Select University/Collage/School</option>
            {institutions.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </select>

          {/* Conditional Rendering based on Training or Competition */}
          {trainingOrCompetition === "training" && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">
                Select Day Pair and Shifts
              </h3>
              <div className="mb-4 p-4 border rounded">
                <div className="flex items-center mb-2">
                  <select
                    value={selectedDayPair?.pair || ""}
                    onChange={(e) => handleDayPairChange(e.target.value)}
                    className="w-2/3 p-2 border rounded mr-2 bg-white "
                    required
                  >
                    <option value="">Select Day Pair</option>
                    {dayPairs.map((dayPair, idx) => (
                      <option
                        key={idx}
                        value={dayPair}
                        disabled={selectedDayPair?.pair === dayPair}
                      >
                        {dayPair}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    className="ml-2 bg-red-500 hover:bg-red-600"
                    onClick={() => setSelectedDayPair(null)}
                  >
                    Remove
                  </Button>
                </div>
                {selectedDayPair && (
                  <div className="mt-2">
                    <div className="flex items-center mb-2">
                      <span className="w-1/3">Shift</span>
                      <select
                        value={
                          selectedDayPair.shifts[
                            selectedDayPair.pair.split(" - ")[0]
                          ] || ""
                        }
                        onChange={(e) =>
                          handleShiftChangeForTraining(
                            selectedDayPair.pair.split(" - ")[0],
                            selectedDayPair.pair.split(" - ")[1],
                            e.target.value
                          )
                        }
                        className="w-2/3 p-2 border rounded bg-white"
                        required
                      >
                        <option value="">Select Shift</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="night">Night</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {trainingOrCompetition === "competition" && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">
                Select Day and Shift
              </h3>
              <div className="flex items-center mb-2">
                <select
                  value={selectedDay?.day || ""}
                  onChange={(e) => handleDayChange("day", e.target.value)}
                  className="w-2/3 p-2 border rounded mr-2 bg-white"
                  required
                >
                  <option value="">Select Day</option>
                  {individualDays.map((day, idx) => (
                    <option
                      key={idx}
                      value={day}
                      disabled={selectedDay?.day === day}
                    >
                      {day}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  className="ml-2 bg-red-500 hover:bg-red-600"
                  onClick={() => setSelectedDay(null)}
                >
                  Remove
                </Button>
              </div>
              {selectedDay && (
                <div className="mt-2 flex items-center mb-2">
                  <span className="w-1/3">Shift:</span>
                  <select
                    value={selectedDay.shift || ""}
                    onChange={(e) => handleDayChange("shift", e.target.value)}
                    className="w-2/3 p-2 border rounded bg-white"
                    required
                  >
                    <option value="">Select Shift</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="night">Night</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {trainingOrCompetition && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-indigo-600">
                Payment Amount
              </h3>
              <p className="p-2 border rounded">
                {trainingOrCompetition === "competition"
                  ? "315 birr"
                  : "265 birr"}
              </p>
            </div>
          )}
          {/* Upload Payment Receipt */}
          <Input
            type="file"
            onChange={handleFileChange}
            required
            placeholder="Upload Payment Receipt"
            className="mb-4"
          />
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Submit
          </Button>
        </form>
        <Button
          type="button"
          className="w-full bg-green-600 hover:bg-green-700 mt-4"
          onClick={handleChapaPayment}
        >
          {loading ? "Waiting..." : "Pay with Chapa"}
        </Button>
        {error && (
          <Alert className="mt-4" variant="destructive">
            {error}
          </Alert>
        )}
        {success && (
          <Alert className="mt-4" variant="default">
            Registration successful!
          </Alert>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
