import type { Metadata } from "next";
import "../globals.css";
import Navbar from "./navbar";
import Sidebar from "./sidebar";



export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={'text-foreground w-full'}
      >
        <Navbar />
        <div className="flex flex-row">
          <Sidebar />
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
