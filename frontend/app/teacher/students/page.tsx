"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import Cookies from "js-cookie";
import { Student } from "../../../type/student";
import SearchBar from "./SearchBar";
import StudentsTable from "./StudentsTable";

const IndividualStudent: React.FC<{ id: number; onClose: () => void }> = ({
  id,
  onClose,
}) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      setError("");

      const token = Cookies.get("teacher-token");
      console.log(token, "token");

      try {
        const response = await axios.get(
          `https://takethestage-backend.vercel.app/admins/students/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStudent(response.data);
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

    fetchStudent();
  }, [id]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl overflow-x-auto">
        <button onClick={onClose} className="mb-4 text-blue-500">
          Back to Students List
        </button>
        <h2 className="text-2xl font-bold mb-4">Student Details</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <Alert className="mb-4" variant="destructive">
            {error}
          </Alert>
        ) : student ? (
          <div>
            <p>
              <strong>Name:</strong> {student.first_name} {student.second_name}{" "}
              {student.last_name}
            </p>
            <p>
              <strong>Email:</strong> {student.email}
            </p>
            <p>
              <strong>Grade:</strong> {student.grade}
            </p>
            <p>
              <strong>Sex:</strong> {student.sex}
            </p>
            <p>
              <strong>Region ID:</strong> {student.region_id}
            </p>
            <p>
              <strong>City:</strong> {student.city}
            </p>
            <p>
              <strong>Woreda:</strong> {student.woreda}
            </p>
            <p>
              <strong>Phone Number:</strong> {student.phone_number}
            </p>
            <p>
              <strong>Parent&apos;s Phone Number:</strong>{" "}
              {student.parents_phone_number}
            </p>
            <p>
              <strong>Training or Competition:</strong>{" "}
              {student.training_or_competition}
            </p>
            <p>
              <strong>Chosen Institution:</strong> {student.chosen_institution}
            </p>
            <p>
              <strong>Date:</strong> {student.date}
            </p>
            <p>
              <strong>Shift:</strong> {student.shift}
            </p>
            <p>
              <strong>Payment Status:</strong> {student.payment_status}
            </p>
            <p>
              <strong>Class ID:</strong> {student.class_id}
            </p>
          </div>
        ) : (
          <div>No student found</div>
        )}
      </div>
    </div>
  );
};

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [_class, setClass] = useState("");
  const [classes, setClasses] = useState([]);

  // Fetch students based on page, search, and class filter
  const fetchStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const token = Cookies.get("teacher-token");
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/teachers/students",
        {
          params: { page: currentPage, limit: 10, search, class_id: _class },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStudents(response.data.students);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
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

  // Fetch classes for the dropdown
  const fetchClasses = async () => {
    try {
      const token = Cookies.get("teacher-token");
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/teachers/classes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClasses(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  // Effect to load students on component mount or when dependencies change
  useEffect(() => {
    if (_class) fetchStudents();
  }, [currentPage, search, _class]);

  // Effect to fetch classes once on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(event.target.value);
  const handleSearchClick = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchStudents(); // Trigger the search
  };

  const handleRowClick = (id: number) => setSelectedStudentId(id);
  const handleClassChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setClass(event.target.value);
    setCurrentPage(1); // Reset to first page on class change
  };

  const handleCloseStudentDetails = () => setSelectedStudentId(null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl overflow-x-auto">
        {selectedStudentId ? (
          <IndividualStudent
            id={selectedStudentId}
            onClose={handleCloseStudentDetails}
          />
        ) : (
          <>
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
                {classes.map((cls: { id: number; name: string }) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {_class && (
              <>
                <SearchBar
                  search={search}
                  onSearchChange={handleSearchChange}
                  onSearchClick={handleSearchClick}
                />
                {loading ? (
                  <div>Loading...</div>
                ) : error ? (
                  <Alert className="mb-4" variant="destructive">
                    {error}
                  </Alert>
                ) : (
                  <StudentsTable
                    students={students}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onRowClick={handleRowClick}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
