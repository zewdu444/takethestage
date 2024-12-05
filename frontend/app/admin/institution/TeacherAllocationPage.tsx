"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Teacher {
  id: number;
  name: string;
  alreadyAllocated: boolean;
  className: string;
  trainingOrCompetition: string;
}

interface Class {
  id: number;
  name: string;
}

interface Day {
  id: number;
  teacher_id: number;
  day: string;
  shift: string;
  class_id: number | null;
  createdAt: string;
  updatedAt: string;
}

interface TeacherAllocationPageProps {
  id: number | null;
}

const TeacherAllocationPage: React.FC<TeacherAllocationPageProps> = (props) => {
  const { id } = props;
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [unassignedClasses, setUnassignedClasses] = useState<Class[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    teacher: Teacher | null;
  }>({ open: false, teacher: null });
  const institution_id = id;
  console.log(institution_id, "institution_id");

  const fetchTeachers = async () => {
    setLoading(true);
    setError("");

    const token = Cookies.get("admin-token");

    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/admins/teacherInInstitution",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { institution_id },
        }
      );

      setTeachers(response.data);
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

  const fetchDays = async (teacher_id: string) => {
    setLoading(true);
    setError("");

    const token = Cookies.get("admin-token");

    try {
      const response = await axios.get(
        `https://takethestage-backend.vercel.app/admins/teacherShift/${teacher_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { institution_id },
        }
      );

      setDays((prevDays) => [...prevDays, ...response.data]);
      console.log(response.data, "days", days);
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

  const fetchUnassignedClasses = async (
    day: string,
    trainingOrCompetition: string
  ) => {
    setLoading(true);
    setError("");

    const token = Cookies.get("admin-token");

    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/admins/unassignedClasses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: { institution_id, day, trainingOrCompetition },
        }
      );

      setUnassignedClasses(response.data);
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
  }, [institution_id]);

  useEffect(() => {
    teachers.forEach((teacher) => {
      fetchDays(teacher.id.toString());
    });
  }, [teachers]);

  const handleAllocateClass = async () => {
    if (!selectedTeacher || selectedClass === null) return;

    const token = Cookies.get("admin-token");

    try {
      const selectedDayObj = days.find(
        (day) =>
          day.day === selectedDay && day.teacher_id === selectedTeacher.id
      );
      if (!selectedDayObj) {
        setError("Selected day not found for the teacher");
        return;
      }

      await axios.post(
        "https://takethestage-backend.vercel.app/admins/assignClass",
        {
          teacher_id: selectedTeacher.id,
          class_id: selectedClass,
          teacher_shift_id: selectedDayObj.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setError("");
      fetchTeachers(); // Refresh the list of teachers
      // if (selectedDay) fetchUnassignedClasses(selectedDay); // Refresh the list of unassigned classes
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || "An error occurred");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setConfirmDialog({ open: false, teacher: null });
    }
  };

  const openConfirmDialog = (teacher: Teacher, day: string) => {
    setConfirmDialog({ open: true, teacher });
    setSelectedTeacher(teacher);
    setSelectedDay(day);
    fetchUnassignedClasses(day, teacher.trainingOrCompetition);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4">Teacher Allocation</h2>
        {error && (
          <Alert className="mb-4" variant="destructive">
            {error}
          </Alert>
        )}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allocation Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {teacher.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {teacher.alreadyAllocated ? "Allocated" : "Not Allocated"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {teacher.className || "Not Allocated"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {days
                        .filter((dayObj) => dayObj.teacher_id === teacher.id)
                        .reduce((uniqueDays, dayObj) => {
                          if (
                            !uniqueDays.some((day) => day.day === dayObj.day)
                          ) {
                            uniqueDays.push(dayObj);
                          }
                          return uniqueDays;
                        }, [] as Day[])
                        .map((dayObj) => (
                          <Button
                            key={dayObj.id}
                            onClick={() =>
                              openConfirmDialog(teacher, dayObj.day)
                            }
                            className="bg-blue-500 text-white m-1"
                          >
                            {dayObj.day.substring(0, 3)},
                            {dayObj.shift.substring(0, 3)}
                          </Button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            {confirmDialog.teacher?.alreadyAllocated ? "change" : "allocate"}{" "}
            the class for {confirmDialog.teacher?.name} on {selectedDay}?
          </DialogDescription>
          <div className="mb-4">
            <label className="block text-gray-700">Select Class</label>
            <select
              value={selectedClass ?? ""}
              onChange={(e) => setSelectedClass(Number(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            >
              <option value="">Select Class</option>
              {unassignedClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setConfirmDialog({ open: false, teacher: null })}
              className="bg-gray-500 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAllocateClass}
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

export default TeacherAllocationPage;
