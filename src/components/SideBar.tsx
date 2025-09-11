import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Monitor,
  Settings,
  BarChart3,
  FileText,
  X,
  Activity,
  Shield,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Test Configurations", href: "/configurations", icon: Settings },
    { name: "Test Results", href: "/results", icon: FileText },
    { name: "Reports", href: "/reports", icon: Activity },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className={`fixed z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
        <div className="flex items-center space-x-3">
          <Monitor className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">EcomTest AI</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-white hover:text-blue-200"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar Nav */}
      <nav className="px-4 py-8 space-y-2 overflow-y-auto h-[calc(100%-8rem)]">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 ${
                  isActive(item.href) ? "text-blue-600" : "text-gray-400"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
