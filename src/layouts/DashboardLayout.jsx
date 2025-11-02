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
          <footer className="py-2">
            <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
              <p className="text-sm">
                © 2023, made with
                <svg viewBox="0 0 24 24" fill="currentColor" className="-mt-0.5 mx-1 inline-block h-3.5 w-3.5">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17l-.412.231a.752.752 0 01-.704 0z" />
                </svg>
                by <a className="transition-colors hover:text-blue-500" href="https://www.creative-tim.com" target="_blank">Creative Tim</a> for a better web.
              </p>
              <ul className="flex items-center gap-4">
                <li><a className="text-sm hover:text-blue-500" href="https://www.creative-tim.com" target="_blank">Creative Tim</a></li>
                <li><a className="text-sm hover:text-blue-500" href="https://www.creative-tim.com/presentation" target="_blank">About Us</a></li>
                <li><a className="text-sm hover:text-blue-500" href="https://www.creative-tim.com/blog" target="_blank">Blog</a></li>
                <li><a className="text-sm hover:text-blue-500" href="https://www.creative-tim.com/license" target="_blank">License</a></li>
              </ul>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
