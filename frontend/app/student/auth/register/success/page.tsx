"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const VarifyChapa: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const token = Cookies.get("student-token");
      try {
        const response = await axios.get(
          "https://takethestage-backend.vercel.app/students/payment-status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.paid) {
          Cookies.set("is_student", "true");
          router.push("/student/profile");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    };

    checkPaymentStatus();
  }, [router]);

  useEffect(() => {
    // Get query parameters from window location
    const queryParams = new URLSearchParams(window.location.search);
    const payment_id = queryParams.get("payment_id");

    const confirmPayment = async () => {
      try {
        const token = Cookies.get("student-token");

        if (!payment_id) {
          console.error("Payment ID is null");
          setMessage("Payment ID is missing.");
          setIsSuccess(false);
          return;
        }
        const url = `https://takethestage-backend.vercel.app/students/payment`;
        const header = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        const payload = { payment_id: payment_id };
        const response = await axios.post(url, payload, header);

        if (response.status === 200) {
          Cookies.set("is_student", true.toString(), {
            expires: 1,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
          });

          setMessage("Payment verified successfully.");
          setIsSuccess(true);
        } else {
          setMessage("Payment verification failed.");
          setIsSuccess(false);
        }
      } catch (error) {
        console.log(error);
        setMessage("An error occurred during payment verification.");
        setIsSuccess(false);
      }
    };

    console.log(payment_id, "paid");
    if (payment_id) {
      confirmPayment();
    }
  }, []);

  return (
    <div className="container">
      <div className="row align-items-center">
        <div className="col-lg-12 col-md-12">
          <h3>Payment Status</h3>
          {message && (
            <div
              className={`alert ${
                isSuccess ? "alert-success" : "alert-danger"
              }`}
              role="alert"
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VarifyChapa;
