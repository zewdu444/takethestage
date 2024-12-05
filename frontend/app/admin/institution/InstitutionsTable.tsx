import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Institution } from "../../../type/Institution";
import axios from "axios";
import Cookies from "js-cookie";

interface InstitutionsTableProps {
  institutions: Institution[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowClick: (id: number) => void;
  onEditTeacher: (id: number) => void;
  regionsName: Record<string, number>;
  regionsId: Record<number, string>;
  edited: boolean;
  setEdited: (edited: boolean) => void;
}

const InstitutionsTable: React.FC<InstitutionsTableProps> = ({
  institutions,
  currentPage,
  totalPages,
  onPageChange,
  onRowClick,
  onEditTeacher,
  regionsName,
  regionsId,
  edited,
  setEdited,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedInstitution, setEditedInstitution] = useState<
    Partial<Institution>
  >({});
  const token = Cookies.get("admin-token");

  const handleEditClick = (institution: Institution) => {
    setEditingId(institution.id);
    setEditedInstitution(institution);
  };

  const handleSaveClick = async () => {
    console.log(editedInstitution.name, editedInstitution.region, "mmmm");
    try {
      const response = await axios.put(
        `https://takethestage-backend.vercel.app/admins/editInstitution`,
        {
          name: editedInstitution.name,
          level: editedInstitution.level,
          region: editedInstitution.region,
          city: editedInstitution.city,
          woreda: editedInstitution.woreda,
          id: editedInstitution.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setEditingId(null);
        setEdited(!edited);
      } else {
        console.error("Failed to save institution");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedInstitution((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Level
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Region
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              City
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Woreda
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Classes
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {institutions.map((institution) => (
            <tr
              key={institution.id}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => {
                if (editingId !== institution.id) onRowClick(institution.id);
              }}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === institution.id ? (
                  <input
                    type="text"
                    name="name"
                    value={editedInstitution.name || ""}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  institution.name
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === institution.id ? (
                  <>
                    <select
                      name="level"
                      value={editedInstitution.level || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      required
                    >
                      <option value="">Select Level</option>
                      <option value="5678">5-8</option>
                      <option value="910">9-10</option>
                      <option value="11-12">11-12</option>
                      <option value="college">College</option>
                      <option value="university">University</option>
                      <option value="masters">Masters</option>
                    </select>
                  </>
                ) : (
                  institution.level
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === institution.id ? (
                  <select
                    name="region"
                    value={editedInstitution.region || ""}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  >
                    {Object.entries(regionsName).map(([name, id]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                ) : (
                  regionsId[Number(institution.region)]
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === institution.id ? (
                  <input
                    type="text"
                    name="city"
                    value={editedInstitution.city || ""}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  institution.city
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === institution.id ? (
                  <input
                    type="text"
                    name="woreda"
                    value={editedInstitution.woreda || ""}
                    onChange={handleChange}
                    className="border rounded px-2 py-1"
                  />
                ) : (
                  institution.woreda
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {institution.classes}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === institution.id ? (
                  <Button
                    onClick={handleSaveClick}
                    className="text-green-600 hover:text-green-900"
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(institution);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </Button>
                )}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTeacher(institution.id);
                  }}
                  className="text-blue-600 hover:text-blue-900 ml-2"
                >
                  Edit Teachers
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between mt-4">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </>
  );
};

export default InstitutionsTable;
