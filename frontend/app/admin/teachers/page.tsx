"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import Cookies from "js-cookie";
import { Teacher } from "../../../type/teacher";
import SearchBar from "./SearchBar";
import TeachersTable from "./TeachersTable";

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    null
  );

  const fetchTeachers = async () => {
    setLoading(true);
    setError("");

    const token = Cookies.get("admin-token");
    console.log(token, 44444);

    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/admins/teachers",
        {
          params: { page: currentPage, limit: 10, search },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTeachers(response.data.teachers);
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

  useEffect(() => {
    fetchTeachers();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSearchClick = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchTeachers(); // Trigger the search
  };

  const handleRowClick = (id: number) => {
    setSelectedTeacherId(id);
  };

  const handleDelete = async (id: number) => {
    const token = Cookies.get("admin-token");
    try {
      await axios.post(
        "https://takethestage-backend.vercel.app/admins/deleteTeacher",
        { teacher_id: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchTeachers();
    } catch {
      setError("Failed to delete teacher");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl overflow-x-auto">
        {selectedTeacherId ? (
          <IndividualTeacher
            id={selectedTeacherId}
            onBack={() => setSelectedTeacherId(null)}
          />
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4">Teachers</h2>
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
              <TeachersTable
                teachers={teachers}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onRowClick={handleRowClick}
                onDelete={handleDelete} // Pass the delete function
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const IndividualTeacher: React.FC<{ id: number; onBack: () => void }> = ({
  id,
  onBack,
}) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacher = async () => {
      setLoading(true);
      setError("");

      const token = Cookies.get("admin-token");
      console.log(token, "token");

      try {
        const response = await axios.get(
          `https://takethestage-backend.vercel.app/admins/teachers/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTeacher(response.data);
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

    fetchTeacher();
  }, [id]);

  const handleDownload = async () => {
    const token = Cookies.get("admin-token");

    try {
      const response = await axios.post(
        `https://takethestage-backend.vercel.app/admins/download_application`,
        {
          teacher_id: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "application_letter.pdf"); // or extract the filename from response headers
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-gray-500 text-white rounded"
      >
        Back
      </button>
      <h2 className="text-2xl font-bold mb-4">Teacher Details</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <Alert className="mb-4" variant="destructive">
          {error}
        </Alert>
      ) : teacher ? (
        <div>
          <p>
            <strong>Name:</strong> {teacher.first_name} {teacher.second_name}{" "}
            {teacher.last_name}
          </p>
          <p>
            <strong>Email:</strong> {teacher.email}
          </p>
          <p>
            <strong>Phone Number:</strong> {teacher.phone_number}
          </p>
          <p>
            <strong>Institution:</strong> {teacher.institution}
          </p>
          <p>
            <strong>Level of Teaching:</strong> {teacher.level_of_teaching}
          </p>
          <p>
            <strong>Sex:</strong> {teacher.sex}
          </p>
          <p>
            <strong>Region:</strong> {teacher.region}
          </p>
          <p>
            <strong>Woreda:</strong> {teacher.woreda}
          </p>
          <p>
            <strong>Shift:</strong> {teacher.shift}
          </p>
          <p>
            <strong>Class:</strong> {teacher.class}
          </p>
          {teacher.date && (
            <p>
              <strong>Date:</strong>{" "}
              {new Date(teacher.date).toLocaleDateString()}
            </p>
          )}
          <button
            onClick={handleDownload}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Download Application
          </button>
        </div>
      ) : (
        <div>No teacher found</div>
      )}
    </div>
  );
};

export default TeachersPage;
