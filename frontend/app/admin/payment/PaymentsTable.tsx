import React from 'react';
import { Button } from "@/components/ui/button"; 
import { Payment } from '../../../type/payment';

interface PaymentsTableProps {
    payments: Payment[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onRowClick: (id: number) => void;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({ payments, currentPage, totalPages, onPageChange, onRowClick }) => {
    return (
        <>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                        <tr key={payment.id} onClick={() => onRowClick(payment.id)} className="cursor-pointer hover:bg-gray-100">
                            <td className="px-6 py-4 whitespace-nowrap">{payment.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{payment.student_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{payment.amount}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(payment.date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{payment.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-between mt-4">
                <Button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                    Previous
                </Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    Next
                </Button>
            </div>
        </>
    );
};

export default PaymentsTable;