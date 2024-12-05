import React from 'react';
import { Button } from "@/components/ui/button"; 
import { Teacher } from '../../../type/teacher';

interface TeachersTableProps {
    teachers: Teacher[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onRowClick: (id: number) => void;
}

const TeachersTable: React.FC<TeachersTableProps> = ({ teachers, currentPage, totalPages, onPageChange, onRowClick }) => {
    return (
        <>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level of Teaching</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sex</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Woreda</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {teachers.map((teacher) => (
                        <tr key={teacher.id} onClick={() => onRowClick(teacher.id)} className="cursor-pointer">
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.first_name} {teacher.second_name} {teacher.last_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.level_of_teaching}</td> 
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.sex}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.region}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.woreda}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.phone_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{teacher.shift}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-between items-center mt-4">
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

export default TeachersTable;
