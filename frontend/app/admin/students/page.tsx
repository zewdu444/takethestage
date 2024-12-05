"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import Cookies from "js-cookie";
import { Student } from "../../../type/student";
import SearchBar from "./SearchBar";
import StudentsTable from "./StudentsTable";

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError("");

    const token = Cookies.get("admin-token");

    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/admins/students",
        {
          params: { page: currentPage, limit: 10, search },
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

  const fetchStudentDetails = async (id: number) => {
    setLoading(true);
    setError("");

    const token = Cookies.get("admin-token");

    try {
      const response = await axios.get(
        `https://takethestage-backend.vercel.app/admins/students/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedStudent(response.data);
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

  useEffect(() => {
    fetchStudents();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSearchClick = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchStudents(); // Trigger the search
  };

  const handleRowClick = (id: number) => {
    fetchStudentDetails(id);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4">Students</h2>
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
        ) : selectedStudent ? (
          <div>
            <h3 className="text-xl font-bold mb-4">Student Details</h3>
            <p>
              <strong>Name:</strong> {selectedStudent.first_name}{" "}
              {selectedStudent.second_name} {selectedStudent.last_name}
            </p>
            <p>
              <strong>Email:</strong> {selectedStudent.email}
            </p>
            <p>
              <strong>Grade:</strong> {selectedStudent.grade}
            </p>
            <p>
              <strong>Sex:</strong> {selectedStudent.sex}
            </p>
            <p>
              <strong>Region ID:</strong> {selectedStudent.region_id}
            </p>
            <p>
              <strong>City:</strong> {selectedStudent.city}
            </p>
            <p>
              <strong>Woreda:</strong> {selectedStudent.woreda}
            </p>
            <p>
              <strong>Phone Number:</strong> {selectedStudent.phone_number}
            </p>
            <p>
              <strong>Parent&apos;s Phone Number:</strong>{" "}
              {selectedStudent.parents_phone_number}
            </p>
            <p>
              <strong>Training or Competition:</strong>{" "}
              {selectedStudent.training_or_competition}
            </p>
            <p>
              <strong>Chosen Institution:</strong>{" "}
              {selectedStudent.chosen_institution}
            </p>
            <p>
              <strong>Date:</strong> {selectedStudent.date}
            </p>
            <p>
              <strong>Shift:</strong> {selectedStudent.shift}
            </p>
            <p>
              <strong>Payment Status:</strong> {selectedStudent.payment_status}
            </p>
            <p>
              <strong>Class ID:</strong> {selectedStudent.class_id}
            </p>
            <button
              onClick={() => setSelectedStudent(null)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Back to List
            </button>
          </div>
        ) : (
          <StudentsTable
            students={students}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onRowClick={handleRowClick}
          />
        )}
      </div>
    </div>
  );
};

export default StudentsPage;
