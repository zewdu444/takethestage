"use client";
import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const SubmitNews: React.FC = () => {
  const [title, setTitle] = useState("");
  const [mainContent, setMainContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("main_content", mainContent);
    if (image) {
      formData.append("news", image);
    }

    try {
      const token = Cookies.get("admin-token");
      const r = isPrivate ? "news" : "latest-news";
      await axios.post(
        `https://takethestage-backend.vercel.app/admins/${r}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("News submitted successfully");
      setTitle("");
      setMainContent("");
      setImage(null);
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
      <h1 className="text-2xl font-bold mb-4">Submit News</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            name="main_content"
            value={mainContent}
            onChange={(e) => setMainContent(e.target.value)}
            placeholder="Main Content"
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="file"
            name="news"
            onChange={handleFileChange}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="mr-2">Private</label>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
        </div>
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Submit News
        </button>
      </form>
      {message && <p className="text-green-500 mt-4">{message}</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default SubmitNews;
