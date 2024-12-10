"use client";
import "./globals.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface NewsItem {
  id: number;
  title: string;
  image: string;
}

const NewsList: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useRouter();

  useEffect(() => {
    fetchNews();
  }, []);

  const handleClick = (id: number) => {
    navigate.push(`/admin/news/${id}`);
  };

  const fetchNews = async () => {
    try {
      const response = await axios.get(
        "https://takethestage-backend.vercel.app/admins/latest-news"
      );
      setNewsItems(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(err);
      } else {
        console.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader"></div>
        </div>
      ) : (
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
      )}
      <div className="flex justify-between mt-4"></div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const [showSignupOptions, setShowSignupOptions] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setShowSignupOptions(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setShowSignupOptions(false);
    }, 200);
    setTimeoutId(id);
  };

  const logoStyle = {
    opacity: showSignupOptions ? 1 : 0,
    transform: showSignupOptions ? "scale(1)" : "scale(0.8)",
    transition: "opacity 0.8s, transform 0.8s",
  };

  const headerStyle = {
    opacity: showSignupOptions ? 1 : 0,
    transition: "opacity 1s 0.3s",
  };

  const paragraphStyle = {
    opacity: showSignupOptions ? 1 : 0,
    transition: "opacity 1s 0.6s",
  };

  const signupOptionsStyle = {
    opacity: showSignupOptions ? 1 : 0,
    transform: showSignupOptions ? "translateY(0)" : "translateY(-10px)",
    transition: "opacity 0.3s, transform 0.3s",
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 text-gray-900">
      {/* Navigation */}
      <nav className="w-full bg-white py-4 shadow-md sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6">
          <img src="/logo.jpg" alt="Logo" className="w-12 h-12" />
          <ul className="flex space-x-6 text-lg font-semibold">
            <li>
              <a href="#home" className="hover:text-blue-600">
                Home
              </a>
            </li>
            <li>
              <a href="#about" className="hover:text-blue-600">
                About Us
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-blue-600">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        id="home"
        className="w-full flex flex-col items-center text-center py-20 bg-gradient-to-b from-blue-600 to-blue-500 text-white"
      >
        <img
          src="/logo.jpg"
          alt="Logo"
          className="w-20 h-20 mb-4 rounded-full"
          style={logoStyle}
        />
        <h1
          className="text-5xl font-extrabold tracking-wide"
          style={headerStyle}
        >
          Take the Stage Trading P.L.C.
        </h1>
        <p className="text-4xl max-w-2xl mt-4" style={paragraphStyle}>
          SPEAK LIKE A LEADER !
        </p>

        <div className="relative mt-8">
          <Button
            className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-full hover:bg-blue-600 hover:text-white transition duration-300"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            Register Now
          </Button>
          {showSignupOptions && (
            <div
              className="absolute top-full mt-4 w-48 bg-white text-gray-800 rounded-lg shadow-lg"
              style={signupOptionsStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <a
                href="/student/auth/signup"
                className="block px-4 py-2 hover:bg-gray-200"
              >
                Apply as Student
              </a>
              <a
                href="/teacher/auth/signup"
                className="block px-4 py-2 hover:bg-gray-200"
              >
                Apply as Teacher
              </a>
            </div>
          )}
        </div>
      </header>

      {/* News Section */}
      <section id="news" className="w-full py-20 bg-gray-100 text-center">
        <h2 className="text-4xl font-bold mb-10 text-blue-600">
          What&apos;s New 
        </h2>
        <NewsList />
      </section>

      {/* About Us Section */}
      <section id="about" className="w-full py-20 bg-gray-100 text-center">
        <h2 className="text-4xl font-bold mb-10 text-blue-600">About Us</h2>
        <p className="text-lg max-w-2xl mx-auto mb-6">
          Founded on December 7, 2023, Take the Stage Trading P.L.C. strives to
          enhance communication skills through guided learning, supporting
          academic, job, and career advancement for students, professionals, and
          job seekers.
        </p>
        <h3 className="text-2xl font-semibold text-gray-800 mt-4">
          Our Mission
        </h3>
        <p className="text-gray-700 mt-2">
          Facilitating consistent & sufficient stage useful to improve
          communication skill with teacher&apos;s guide so that:
        </p>
        <ul className="list-disc list-inside mt-2 text-gray-700">
          <li>Students can improve their academic performance.</li>
          <li>Job applicants can widen their chances to pass interviews.</li>
          <li>
            Scholarship applicants can improve their success rate in scholarship
            interviews.
          </li>
          <li>Workers can enhance their prospects for career growth.</li>
        </ul>
        <h3 className="text-2xl font-semibold text-gray-800 mt-4">
          Our Vision
        </h3>
        <p className="text-gray-700 mt-2">
          Being the biggest speaking skill enrichment stage provider company in
          Africa.
        </p>
        <h3 className="text-2xl font-semibold text-gray-800 mt-4">
          Our Core Values
        </h3>
        <p className="text-gray-700 mt-2">
          Providing human-centered, quality services to everyone at an
          affordable cost.
        </p>
      </section>

      {/* Contact Section */}
      <footer
        id="contact"
        className="w-full py-10 bg-blue-600 text-center text-white"
      >
        <p className="text-lg font-semibold">Contact Us</p>
        <p>
          Address: Stadium, Kirkos Sub-city, Woreda 10, Ameld Building, Addis
          Ababa, Ethiopia
        </p>
        <p>
          Email:{" "}
          <a href="mailto:Takestage01@gmail.com" className="underline">
            Takestage01@gmail.com
          </a>
        </p>
        <p>Phone: 0994 089 818 / 0923 683 561</p>
        <div className="flex justify-center space-x-4 mt-4">
          <a
            href="https://t.me/takestage"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-200 hover:text-white"
          >
            <i className="fab fa-telegram"></i>
          </a>
          <a
            href="https://www.linkedin.com/in/take-the-stage-trading-plc-851200333"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-200 hover:text-white"
          >
            <i className="fab fa-linkedin"></i>
          </a>
          <a
            href="https://www.facebook.com/take.the.stage.trading.plc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-200 hover:text-white"
          >
            <i className="fab fa-facebook"></i>
          </a>
          <div> Founder Yohannes Bullo , </div>
          <div> Co-Founders Dagimawi Eshetu and Tsegazab Birhane </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
