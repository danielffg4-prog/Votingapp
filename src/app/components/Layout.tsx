import { ReactNode } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  ShieldCheck,
  User,
  LogOut,
  Vote,
  BarChart3,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { background, currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ["admin", "user"],
    },
    {
      label: "Admin Panel",
      path: "/admin",
      icon: <ShieldCheck className="w-4 h-4" />,
      roles: ["admin"],
    },
    {
      label: "Vote",
      path: "/user",
      icon: <Vote className="w-4 h-4" />,
      roles: ["user"],
    },
  ];

  const visibleLinks = navLinks.filter(
    (l) => currentUser && l.roles.includes(currentUser.role)
  );

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {background ? (
          <img
            src={background}
            alt="background"
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
      </div>

      {/* Navbar */}
      {currentUser && (
        <nav className="fixed top-0 left-0 right-0 z-50">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mt-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vote className="text-white w-5 h-5" />
                <span className="text-white font-semibold text-sm">VoteSystem</span>
              </div>

              <div className="flex items-center gap-1">
                {visibleLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all duration-200
                      ${location.pathname === link.path
                        ? "bg-white text-slate-900"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                  >
                    {link.icon}
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                  {currentUser.role === "admin" ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-blue-400" />
                  )}
                  <span className="text-white/80">{currentUser.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-white/50 hover:text-red-400 transition-colors text-xs px-2 py-1 rounded-lg hover:bg-red-500/10"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Page content */}
      <div className={`relative z-10 ${currentUser ? "pt-20" : ""} min-h-screen`}>
        {children}
      </div>
    </div>
  );
}
