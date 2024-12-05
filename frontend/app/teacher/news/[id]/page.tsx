"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  main_content: string; // Assuming there's a content field for the news details
}

const NewsDetail: React.FC = () => {
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useRouter();

  useEffect(() => {
    fetchNewsDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      const token = Cookies.get("teacher-token");
      const response = await axios.get(
        `https://takethestage-backend.vercel.app/teachers/news/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewsItem(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "An error occurred");
      } else {
        setError("An error occurred");
      }
    }
  };

  return (
    <div className="container mx-auto p-4 h-screen">
      <Button
        onClick={() => navigate.back()}
        className="mb-4 bg-gray-500 text-white"
      >
        Back
      </Button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {newsItem ? (
        <div className="border p-4 rounded shadow">
          {newsItem.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={newsItem.image}
              alt="News"
              className="w-full h-96 object-cover mb-4"
            />
          )}
          <h1 className="text-2xl font-bold mb-4">{newsItem.title}</h1>
          <p>{newsItem.main_content}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default NewsDetail;
