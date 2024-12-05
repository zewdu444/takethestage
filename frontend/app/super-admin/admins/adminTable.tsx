import React from 'react';
import { Button } from "@/components/ui/button"; 
import { Admin } from '../../../type/admin';

interface AdminsTableProps {
    admins: Admin[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onRowClick: (id: number) => void;
    onDelete: (id: number) => void;
}

const AdminsTable: React.FC<AdminsTableProps> = ({ admins, currentPage, totalPages, onPageChange, onRowClick, onDelete }) => {
    return (
        <>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {admins.map((admin) => (
                        <tr key={admin.id} className="cursor-pointer">
                            <td className="px-6 py-4 whitespace-nowrap" onClick={() => onRowClick(admin.id)}>{admin.first_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{admin.last_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{admin.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{admin.phone_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Button onClick={() => onDelete(admin.id)}>Delete</Button>
                            </td>
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

export default AdminsTable;
