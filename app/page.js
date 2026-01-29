/** @format */
"use client";
import { useEffect } from "react";
import { redirect } from "next/navigation";
export default function Home() {
  useEffect(() => {
    // Redirect to the desired page immediately
    redirect("/access-portal-b8r3t6");
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
    </div>
  );
}