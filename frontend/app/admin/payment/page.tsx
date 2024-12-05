"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import Cookies from "js-cookie";
import PaymentsTable from "./PaymentsTable";
import { Payment } from "../../../type/payment";
import { Student } from "../../../type/student";
import Image from "next/image";

interface PaymentDetailPageProps {
  paymentId: number;
  onBack: () => void;
}

const PaymentDetailPage: React.FC<PaymentDetailPageProps> = ({
  paymentId,
  onBack,
}) => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<File | null>(null);

  const fetchPaymentPicture = async (pictureUrl: string) => {
    const token = Cookies.get("admin-token");
    try {
      const response = await axios.get(pictureUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      URL.createObjectURL(response.data);
      const imageFile = new File([response.data], "payment-picture.jpg", {
        type: "image/jpeg",
      });
      console.log(imageFile, 44444);
      setImage(imageFile);
    } catch (err) {
      console.error("Error fetching payment picture:", err);
    }
  };

  useEffect(() => {
    if (payment?.picture) {
      fetchPaymentPicture(payment.picture);
    }
  }, [payment?.picture]);

  const fetchPaymentDetails = async () => {
    setLoading(true);
    setError("");

    const token = Cookies.get("admin-token");

    try {
      const response = await axios.get(
        `https://takethestage-backend.vercel.app/admins/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPayment(response.data.payment);
      setStudent(response.data.student);
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

  const handleApprove = async () => {
    await updatePaymentStatus("paid");
  };

  const handleDecline = async () => {
    await updatePaymentStatus("rejected");
  };

  const updatePaymentStatus = async (status: string) => {
    setLoading(true);
    setError("");

    const token = Cookies.get("admin-token");

    try {
      await axios.post(
        `https://takethestage-backend.vercel.app/admins/payment`,
        {
          status,
          student_id: student?.id,
          payment_id: payment?.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPaymentDetails(); // Refresh the payment details
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
    if (paymentId) {
      fetchPaymentDetails();
    }
  }, [paymentId]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
        <button
          onClick={onBack}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Back
        </button>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <Alert className="mb-4" variant="destructive">
            {error}
          </Alert>
        ) : payment && student ? (
          <div>
            <h3 className="text-xl font-bold mb-2">Payment Information</h3>
            <p>
              <strong>ID:</strong> {payment.id}
            </p>
            <p>
              <strong>Amount:</strong> {payment.amount}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(payment.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Picture:</strong>
              {image ? (
                <Image
                  src={URL.createObjectURL(image)}
                  alt="Payment"
                  width={500}
                  height={500}
                />
              ) : (
                "No picture available"
              )}
            </p>
            <h3 className="text-xl font-bold mt-4 mb-2">Student Information</h3>
            <p>
              <strong>Name:</strong> {student.first_name} {student.second_name}{" "}
              {student.last_name}
            </p>
            <p>
              <strong>Email:</strong> {student.email}
            </p>
            <p>
              <strong>Grade:</strong> {student.grade}
            </p>
            <p>
              <strong>Sex:</strong> {student.sex}
            </p>
            <p>
              <strong>Region ID:</strong> {student.region_id}
            </p>
            <p>
              <strong>City:</strong> {student.city}
            </p>
            <p>
              <strong>Woreda:</strong> {student.woreda}
            </p>
            <p>
              <strong>Phone Number:</strong> {student.phone_number}
            </p>
            <p>
              <strong>Parent&apos;s Phone Number:</strong>{" "}
              {student.parents_phone_number}
            </p>
            <p>
              <strong>Training or Competition:</strong>{" "}
              {student.training_or_competition}
            </p>
            <p>
              <strong>Chosen Institution:</strong> {student.chosen_institution}
            </p>
            <p>
              <strong>Date:</strong> {student.date}
            </p>
            <p>
              <strong>Shift:</strong> {student.shift1}
            </p>
            <p>
              <strong>Payment Status:</strong> {student.payment_status}
            </p>
            <div className="mt-4">
              <button
                onClick={handleApprove}
                className="bg-green-500 text-white px-4 py-2 rounded mr-2"
              >
                Approve
              </button>
              <button
                onClick={handleDecline}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Decline
              </button>
            </div>
          </div>
        ) : (
          <div>No payment or student information found</div>
        )}
      </div>
    </div>
  );
};

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(
    null
  );

  const fetchPayments = async () => {
    setLoading(true);
    setError("");

    const token = Cookies.get("admin-token");

    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/admins/payments",
        {
          params: { page: currentPage, limit: 10 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPayments(response.data.payments);
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
    fetchPayments();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRowClick = (id: number) => {
    setSelectedPaymentId(id);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-6xl overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4">Payments</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <Alert className="mb-4" variant="destructive">
            {error}
          </Alert>
        ) : selectedPaymentId ? (
          <PaymentDetailPage
            paymentId={selectedPaymentId}
            onBack={() => setSelectedPaymentId(null)}
          />
        ) : (
          <PaymentsTable
            payments={payments}
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

export default PaymentsPage;
