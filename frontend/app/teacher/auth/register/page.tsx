"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import Cookies from "js-cookie";

const RegisterPage: React.FC = () => {
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [institutions, setInstitutions] = useState<
    { id: number; name: string }[]
  >([]);

  // States for Training
  const [selectedDayPairs, setSelectedDayPairs] = useState<
    { pair: string; shift: string }[]
  >([]);

  // States for Competition
  const [selectedDays, setSelectedDays] = useState<
    { day: string; shift: string }[]
  >([]);

  // Fetch institutions on component mount
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await axios.get(
          "https://takethestage-backend.vercel.app/admins/institution"
        );
        setInstitutions(response.data);
      } catch (err) {
        console.error("Error fetching institutions:", err);
      }
    };
    fetchInstitutions();
  }, []);

  useEffect(() => {
    const token = Cookies.get("teacher-token");
    if (!token) {
      router.push("/teacher/auth/signin"); // Redirect if not logged in
    }
  }, [router]);

  // Handlers for Training
  const handleAddDayPair = () => {
    if (selectedDayPairs.length >= 3) return;
    setSelectedDayPairs([...selectedDayPairs, { pair: "", shift: "" }]);
  };

  const handleRemoveDayPair = (index: number) => {
    const updated = [...selectedDayPairs];
    updated.splice(index, 1);
    setSelectedDayPairs(updated);
  };

  const handleDayPairChange = (index: number, value: string) => {
    const updated = [...selectedDayPairs];
    updated[index].pair = value;
    // Reset shift when pair changes
    updated[index].shift = "";
    setSelectedDayPairs(updated);
  };

  const handleShiftChangeForTraining = (index: number, shift: string) => {
    const updated = [...selectedDayPairs];
    updated[index].shift = shift;
    setSelectedDayPairs(updated);
  };

  // Handlers for Competition
  const handleAddDay = () => {
    if (selectedDays.length >= 3) return;
    setSelectedDays([...selectedDays, { day: "", shift: "" }]);
  };

  const handleRemoveDay = (index: number) => {
    const updated = [...selectedDays];
    updated.splice(index, 1);
    setSelectedDays(updated);
  };

  const handleDayChange = (index: number, field: string, value: string) => {
    const updated = [...selectedDays];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedDays(updated);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate selections
    if (trainingOrCompetition === "training") {
      if (selectedDayPairs.length === 0) {
        setError("Please select at least one day pair for training.");
        return;
      }

      for (let i = 0; i < selectedDayPairs.length; i++) {
        if (!selectedDayPairs[i].pair) {
          setError("Please select a day pair for all training entries.");
          return;
        }
        if (!selectedDayPairs[i].shift) {
          setError(
            `Please select a shift for training pair ${selectedDayPairs[i].pair}.`
          );
          return;
        }
      }
    } else if (trainingOrCompetition === "competition") {
      if (selectedDays.length === 0) {
        setError("Please select at least one day for competition.");
        return;
      }
      for (let i = 0; i < selectedDays.length; i++) {
        if (!selectedDays[i].day || !selectedDays[i].shift) {
          setError(
            "Please select both day and shift for all competition entries."
          );
          return;
        }
      }
    }

    try {
      const formData = new FormData();
      formData.append("training_or_competition", trainingOrCompetition);
      formData.append("chosen_institution", chosenInstitution);

      const token = Cookies.get("teacher-token");

      if (trainingOrCompetition === "training" && selectedDayPairs.length > 0) {
        formData.append("day_pairs", JSON.stringify(selectedDayPairs));
      } else if (
        trainingOrCompetition === "competition" &&
        selectedDays.length > 0
      ) {
        formData.append("days", JSON.stringify(selectedDays));
      }

      await axios.post(
        "https://takethestage-backend.vercel.app/teachers/register",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Dropdown for Training or Competition */}

          {/* Dropdown for Institution */}
          <select
            value={chosenInstitution}
            onChange={(e) => setChosenInstitution(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          >
            <option value="">Select Unversity/Collage/School </option>
            {institutions.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </select>
          <select
            value={trainingOrCompetition}
            onChange={(e) => {
              setTrainingOrCompetition(e.target.value);
              // Reset selections when type changes
              setSelectedDayPairs([]);
              setSelectedDays([]);
            }}
            className="w-full p-2 border rounded mb-4"
            required
          >
            <option value="">Select Training or Competition</option>
            <option value="training">Training</option>
            <option value="competition">Competition</option>
          </select>

          {/* Conditional Rendering based on Training or Competition */}
          {trainingOrCompetition === "training" && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Select Day Pairs and Shifts
              </h3>
              {selectedDayPairs.map((pairObj, index) => (
                <div key={index} className="mb-4 p-4 border rounded">
                  <div className="flex items-center mb-2">
                    <select
                      value={pairObj.pair}
                      onChange={(e) =>
                        handleDayPairChange(index, e.target.value)
                      }
                      className="w-2/3 p-2 border rounded mr-2"
                      required
                    >
                      <option value="">Select Day Pair</option>
                      {dayPairs.map((dayPair, idx) => (
                        <option
                          key={idx}
                          value={dayPair}
                          disabled={selectedDayPairs.some(
                            (p, pIdx) => p.pair === dayPair && pIdx !== index
                          )}
                        >
                          {dayPair}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      className="ml-2 bg-red-500 hover:bg-red-600"
                      onClick={() => handleRemoveDayPair(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  {pairObj.pair && (
                    <div className="mt-2">
                      <div className="flex items-center mb-2">
                        <select
                          value={pairObj.shift}
                          onChange={(e) =>
                            handleShiftChangeForTraining(index, e.target.value)
                          }
                          className="w-2/3 p-2 border rounded"
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
              ))}
              {selectedDayPairs.length < 3 && (
                <Button type="button" onClick={handleAddDayPair}>
                  Add Day Pair
                </Button>
              )}
            </div>
          )}

          {trainingOrCompetition === "competition" && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Select Days and Shifts
              </h3>
              {selectedDays.map((dayEntry, index) => (
                <div key={index} className="flex items-center mb-2">
                  <select
                    value={dayEntry.day}
                    onChange={(e) =>
                      handleDayChange(index, "day", e.target.value)
                    }
                    className="w-2/3 p-2 border rounded mr-2"
                    required
                  >
                    <option value="">Select Day</option>
                    {individualDays.map((day, idx) => (
                      <option
                        key={idx}
                        value={day}
                        disabled={selectedDays.some(
                          (d, dIdx) => d.day === day && dIdx !== index
                        )}
                      >
                        {day}
                      </option>
                    ))}
                  </select>
                  <select
                    value={dayEntry.shift}
                    onChange={(e) =>
                      handleDayChange(index, "shift", e.target.value)
                    }
                    className="w-1/3 p-2 border rounded"
                    required
                  >
                    <option value="">Select Shift</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="night">Night</option>
                  </select>
                  <Button
                    type="button"
                    className="ml-2 bg-red-500 hover:bg-red-600"
                    onClick={() => handleRemoveDay(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {selectedDays.length < 3 && (
                <Button type="button" onClick={handleAddDay}>
                  Add Day
                </Button>
              )}
            </div>
          )}

          <Button type="submit" className="w-full">
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
            Registration successful!
          </Alert>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
