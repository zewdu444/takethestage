"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  id: number;
}

const RegisterPage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const token = Cookies.get("teacher-token");
      try {
        const response = await axios.get(
          "https://takethestage-backend.vercel.app/teachers/payment-status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.paid) {
          Cookies.set("is_paid", "true");
          router.push("/teacher/profile");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    };

    checkPaymentStatus();
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get("teacher-token");
      try {
        const response = await axios.get(
          "https://takethestage-backend.vercel.app/teachers/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProfile(response.data);
      } catch (error) {
        setError(
          axios.isAxiosError(error)
            ? error.response?.data.error || "An error occurred"
            : "An error occurred"
        );
      }
    };

    fetchProfile();
  }, []);

  const handleChapa = async () => {
    if (!profile) {
      setError("Profile data is not available.");
      return;
    }

    console.log("chapa");
    try {
      const token = Cookies.get("teacher-token");
      const re = await axios.get(
        "https://takethestage-backend.vercel.app/teachers/payfee",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const referenceNumber = re.data.tx_ref;
      console.log(referenceNumber, "ref");

      const body = {
        amount: 115,
        currency: "ETB",
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number || "",
        tx_ref: referenceNumber,
        callback_url: `https://takethestage-backend.vercel.app/teachers/verify?payment_id=${profile.id}`,
        return_url: `http://localhost:3000/teacher/pay/success?$payment_id=${profile.id}`,
        customization: {
          title: "fee",
          description: "teacher payment ",
        },
      };
      console.log(body, "body");
      const response = await axios.post(
        "localhost:3002/admins/initialize-payment",
        body
      );
      if (
        response.data &&
        response.data.data &&
        response.data.data.checkout_url
      ) {
        window.location.href = response.data.data.checkout_url;
      } else {
        throw new Error("Invalid response from Chapa API");
      }
    } catch (err) {
      console.error("Error with Chapa payment:", err);
      setError("Chapa payment failed. Please try again.");
    }
  };

  const handlePayment = () => {
    handleChapa();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-4">
        <h2 className="text-2xl font-bold mb-4 text-indigo-600">
          You have to pay 125 for application fee
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Button
          type="button"
          className="w-full bg-indigo-600 hover:bg-indigo-700"
          onClick={handlePayment}
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
};

export default RegisterPage;
