"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const UpdateStudentResults: React.FC = () => {
  const [results, setResults] = useState<
    { student_id: string; score: string }[]
  >([]);
  const [examName, setExamName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [_class, setClass] = useState("");
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setClass(event.target.value);
    if (event.target.value) {
      fetchStudents();
    } else {
      setStudents([]);
      setResults([]);
    }
  };

  const fetchClasses = async () => {
    const token = Cookies.get("teacher-token");
    setLoading(true);
    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/teachers/classes",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setClasses(response.data);
    } catch {
      setError("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  interface Student {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  }

  useEffect(() => {
    const timer = setTimeout(() => fetchStudents(), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStudents = async () => {
    if (!_class) return;
    setLoading(true);
    try {
      const token = Cookies.get("teacher-token");
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/teachers/students",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { search, class_id: _class },
        }
      );
      setStudents(response.data.students);
      setResults(
        response.data.students.map((student: Student) => ({
          student_id: student.id,
          score: "",
        }))
      );
    } catch {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    const newResults = [...results];
    newResults[index] = { ...newResults[index], [name]: value };
    setResults(newResults);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = Cookies.get("teacher-token");
      const response = await axios.post(
        "https://takethestage-backend.vercel.app/teachers/updateStudentsresult",
        {
          exam_name: examName,
          results,
          class_id: _class,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(response.data.message);
    } catch {
      setError("Failed to update results");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Students</h2>
      <div className="mb-4">
        <label
          htmlFor="class-select"
          className="block text-sm font-medium text-gray-700"
        >
          Select Class
        </label>
        <select
          id="class-select"
          value={_class}
          onChange={handleClassChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Choose Class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        _class && (
          <>
            <h1 className="text-2xl font-bold mb-4">Update Student Results</h1>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Students"
              className="border p-2 mb-4 w-full"
            />
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <input
                  type="text"
                  name="exam_name"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="Exam Name"
                  className="border p-2 mr-2 w-full"
                  required
                />
              </div>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2">Student Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr key={student.id}>
                      <td className="border px-4 py-2">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="border px-4 py-2">{student.email}</td>
                      <td className="border px-4 py-2">
                        <input
                          type="number"
                          name="score"
                          value={results[index].score}
                          onChange={(e) => handleChange(index, e)}
                          placeholder="Score"
                          className="border p-2 w-full"
                          required
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="submit"
                className="bg-green-500 text-white p-2 rounded mt-4"
              >
                Submit Results
              </button>
            </form>
            {message && <p className="text-green-500 mt-4">{message}</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </>
        )
      )}
    </div>
  );
};

export default UpdateStudentResults;
