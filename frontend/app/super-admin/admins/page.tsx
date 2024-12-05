"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import Cookies from "js-cookie";
import { Admin } from "../../../type/admin";
import SearchBar from "./SearchBar";
import AdminTable from "./adminTable";

const AdminsPage: React.FC = () => {
  const [admins, setadmins] = useState<Admin[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchadmins = async () => {
    setLoading(true);
    setError("");

    const token = Cookies.get("super-admin-token");

    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/superadmin/admins",
        {
          params: { page: currentPage, limit: 10, search },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setadmins(response.data.admins);
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
    fetchadmins();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSearchClick = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchadmins(); // Trigger the search
  };

  const handleRowClick = (id: number) => {
    console.log(id);
    // navigate.push(`/admin/admins/${id}`);
  };

  const handleDelete = async (id: number) => {
    const token = Cookies.get("super-admin-token");
    console.log(id, 11);
    try {
      await axios.post(
        "https://takethestage-backend.vercel.app/superadmin/deleteadmin",
        { id: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchadmins();
    } catch {
      setError("Failed to delete admin");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4">admins</h2>
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
          <AdminTable
            admins={admins}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onRowClick={handleRowClick}
            onDelete={handleDelete} // Pass the delete function
          />
        )}
      </div>
    </div>
  );
};

export default AdminsPage;
