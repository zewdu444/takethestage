"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Cookies from "js-cookie";
import { Application } from "../../../type/application";

const ApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    id: number | null;
    status: string;
  }>({ open: false, id: null, status: "" });
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");

    const token = Cookies.get("admin-token");

    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/admins/applications",
        {
          params: { page: currentPage, limit: 10 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setApplications(response.data.applications);
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
    fetchApplications();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDownload = async (applicationId: number) => {
    const token = Cookies.get("admin-token");

    try {
      const response = await axios.post(
        `https://takethestage-backend.vercel.app/admins/download_application`,
        {
          application_id: applicationId,
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

  const handleStatusChange = async () => {
    if (confirmDialog.id === null) return;

    const token = Cookies.get("admin-token");

    try {
      await axios.post(
        "https://takethestage-backend.vercel.app/admins/application",
        { id: confirmDialog.id, status: confirmDialog.status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setError("");
      fetchApplications();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setConfirmDialog({ open: false, id: null, status: "" });
    }
  };

  const openConfirmDialog = (id: number, status: string) => {
    setConfirmDialog({ open: true, id, status });
  };

  const handleRowClick = (application: Application) => {
    setSelectedApplication(application);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl">
        <h2 className="text-2xl font-bold mb-4">Applications</h2>
        {error && (
          <Alert className="mb-4" variant="destructive">
            {error}
          </Alert>
        )}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {selectedApplication && (
              <div className="bg-white p-6 rounded-lg shadow-md w-full mb-4">
                <h3 className="text-xl font-bold mb-4">Application Letter</h3>
                <p className=" break-words">
                  {selectedApplication.application_letter}
                </p>
              </div>
            )}
            <div className="flex flex-col overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr
                      key={application.id}
                      onClick={() => handleRowClick(application)}
                      className="cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.teacher.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(
                          application.submission_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {application.application_status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          onClick={() => handleDownload(application.id)}
                          className="bg-blue-500 text-white"
                        >
                          Download CV
                        </Button>
                        <Button
                          onClick={() =>
                            openConfirmDialog(application.id, "approved")
                          }
                          className="ml-2 bg-green-500 text-white"
                        >
                          Accept
                        </Button>
                        <Button
                          onClick={() =>
                            openConfirmDialog(application.id, "rejected")
                          }
                          className="ml-2 bg-red-500 text-white"
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between mt-4">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-gray-500 text-white"
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-gray-500 text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <DialogContent>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>
            Are you sure you want to{" "}
            {confirmDialog.status === "approved" ? "approve" : "reject"} this
            application?
          </DialogDescription>
          <DialogFooter>
            <Button
              onClick={() =>
                setConfirmDialog({ open: false, id: null, status: "" })
              }
              className="bg-gray-500 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              className="bg-blue-500 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApplicationsPage;
