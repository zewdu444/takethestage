import React from 'react';
import { Button } from "@/components/ui/button"; 
import { Student } from '../../../type/student';

interface StudentsTableProps {
    students: Student[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onRowClick: (id: number) => void;
}

const StudentsTable: React.FC<StudentsTableProps> = ({ students, currentPage, totalPages, onPageChange, onRowClick }) => {
    return (
        <>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sex</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Woreda</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent&apos;s Phone Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training or Competition</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                        <tr key={student.id} onClick={() => onRowClick(student.id)} className="cursor-pointer">
                            <td className="px-6 py-4 whitespace-nowrap">{student.first_name} {student.second_name} {student.last_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{student.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{student.grade}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{student.sex}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{student.region_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{student.city}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{student.woreda}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{student.phone_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{student.parents_phone_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{student.training_or_competition}</td>
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

export default StudentsTable;