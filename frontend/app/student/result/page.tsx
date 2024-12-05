"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const ViewStudentResults: React.FC = () => {
  const [results, setResults] = useState<
    { exam_name: string; score: string; date: string }[]
  >([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = Cookies.get("student-token");
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/students/results",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResults(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            "An error occurred while fetching results"
        );
      } else {
        setError("An error occurred while fetching results");
      }
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">My Results</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="overflow-x-auto flex-grow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Exam Name</th>
              <th className="py-2 px-4 border-b">Score</th>
              <th className="py-2 px-4 border-b">Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border px-4 py-2">{result.exam_name}</td>
                <td className="border px-4 py-2">{result.score}</td>
                <td className="border px-4 py-2">
                  {new Date(result.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewStudentResults;
