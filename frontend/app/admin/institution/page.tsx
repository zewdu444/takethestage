"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import Cookies from "js-cookie";
import { Institution } from "../../../type/Institution";
import SearchBar from "./SearchBar";
import InstitutionsTable from "./InstitutionsTable";
import { useRouter } from "next/navigation";
import TeacherAllocationPage from "./TeacherAllocationPage";

const InstitutionsPage: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useRouter();
  const [regionsName, setRegionsName] = useState<Record<string, number>>({});
  const [regionsId, setRegionsId] = useState<Record<number, string>>({});
  const [edited, setEdited] = useState(false);
  const [currentView, setCurrentView] = useState<
    "institutions" | "teacherAllocation"
  >("institutions");
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(
    null
  );

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await axios.get(
          "https://takethestage-backend.vercel.app/admins/regions"
        );
        const regionsNameMap = response.data.reduce(
          (
            map: Record<string, number>,
            region: { id: number; name: string }
          ) => {
            map[region.name] = region.id;
            return map;
          },
          {}
        );
        const regionsIdMap = response.data.reduce(
          (
            map: Record<number, string>,
            region: { id: number; name: string }
          ) => {
            map[region.id] = region.name;
            return map;
          },
          {}
        );
        setRegionsName(regionsNameMap);
        setRegionsId(regionsIdMap);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching regions:", err);
        setLoading(false);
      }
    };
    fetchRegions();
  }, []);

  const fetchInstitutions = async () => {
    setLoading(true);
    setError("");

    const token = Cookies.get("admin-token");

    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/admins/institutions",
        {
          params: { page: currentPage, limit: 10, search },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInstitutions(response.data.institutions);
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
    fetchInstitutions();
  }, [currentPage, edited]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSearchClick = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchInstitutions(); // Trigger the search
  };

  const handleRowClick = (id: number) => {
    navigate.push(`/admin/institution/${id}`);
  };

  const handleEditTeacher = (id: number) => {
    setSelectedTeacherId(id);
    setCurrentView("teacherAllocation");
  };

  const handleAddInstitution = () => {
    navigate.push("/admin/institution/newInsitutions");
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl overflow-x-auto">
        {currentView === "institutions" ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Institutions</h2>
            <SearchBar
              search={search}
              onSearchChange={handleSearchChange}
              onSearchClick={handleSearchClick}
            />
            <button
              onClick={handleAddInstitution}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Add Institution
            </button>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <Alert className="mb-4" variant="destructive">
                {error}
              </Alert>
            ) : (
              <InstitutionsTable
                institutions={institutions}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onRowClick={handleRowClick}
                regionsName={regionsName}
                regionsId={regionsId}
                onEditTeacher={handleEditTeacher}
                setEdited={setEdited}
                edited={edited}
              />
            )}
          </>
        ) : (
          <TeacherAllocationPage id={selectedTeacherId} />
        )}
      </div>
    </div>
  );
};

export default InstitutionsPage;
