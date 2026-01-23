import Header from "@/components/Header";
import { Outlet } from "react-router-dom";

export default function Layaut() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}