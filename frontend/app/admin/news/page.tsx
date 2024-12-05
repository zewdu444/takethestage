"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Image from "next/image";
import SearchBar from "./SearchBar";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  main_content: string; // Assuming there's a content field for the news details
}

const NewsList: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(
    null
  );
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useRouter();

  useEffect(() => {
    fetchNews();
  }, [currentPage]);

  const fetchNews = async () => {
    try {
      const token = Cookies.get("admin-token");
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/admins/news",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: currentPage,
            limit: 10,
            search,
          },
        }
      );
      setNewsItems(response.data.news);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "An error occurred");
      } else {
        setError("An error occurred");
      }
    }
  };

  const fetchNewsDetail = async (id: number) => {
    try {
      const token = Cookies.get("admin-token");
      const response = await axios.get(
        `https://takethestage-backend.vercel.app/admins/news/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSelectedNewsItem(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "An error occurred");
      } else {
        setError("An error occurred");
      }
    }
  };

  const handleAddNews = () => {
    navigate.push("/admin/news/create");
  };

  const debouncedFetchNews = useCallback(debounce(fetchNews, 500), [
    search,
    currentPage,
  ]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
    debouncedFetchNews();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClick = (id: number) => {
    fetchNewsDetail(id);
  };

  return (
    <div className="container mx-auto p-4 h-screen">
      <button
        onClick={handleAddNews}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
      >
        Add News
      </button>

      <h1 className="text-2xl font-bold mb-4">News List</h1>
      <SearchBar
        search={search}
        onSearchChange={handleSearchChange}
        onSearchClick={fetchNews}
      />
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {newsItems.map((newsItem) => (
          <div
            key={newsItem.id}
            className="border p-4 rounded shadow"
            onClick={() => handleClick(newsItem.id)}
          >
            {newsItem.image && (
              <Image
                src={newsItem.image}
                width={300}
                height={200}
                alt="News"
                className="w-full h-48 object-cover mb-4"
              />
            )}
            <h2 className="text-xl font-bold">{newsItem.title}</h2>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-500 text-white"
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-500 text-white"
        >
          Next
        </Button>
      </div>
      {selectedNewsItem && (
        <div className="mt-8 border p-4 rounded shadow">
          <Button
            onClick={() => setSelectedNewsItem(null)}
            className="mb-4 bg-gray-500 text-white"
          >
            Back to List
          </Button>
          {selectedNewsItem.image && (
            <Image
              src={selectedNewsItem.image}
              width={600}
              height={400}
              alt="News"
              className="w-full h-96 object-cover mb-4"
            />
          )}
          <h1 className="text-2xl font-bold mb-4">{selectedNewsItem.title}</h1>
          <p>{selectedNewsItem.main_content}</p>
        </div>
      )}
    </div>
  );
};

export default NewsList;