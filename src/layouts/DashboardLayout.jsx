import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="p-4 xl:ml-80">
        <Topbar onOpenSidebar={() => setOpen(true)} />

        <div className="mt-12">
          <Outlet />
        </div>

        <div className="text-slate-600">
         
        </div>
      </div>
    </div>
  );
}
