"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import Cookies from "js-cookie";
import { Teacher } from "../../../type/teacher";
import SearchBar from "./SearchBar";
import TeachersTable from "./TeachersTable";
import { useRouter } from "next/navigation";

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useRouter();

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
    navigate.push(`/admin/teachers/${id}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl overflow-x-auto">
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
          />
        )}
      </div>
    </div>
  );
};

export default TeachersPage;
