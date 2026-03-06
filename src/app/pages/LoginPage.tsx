import { useState } from "react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { Vote, ShieldCheck, User, Eye, EyeOff, Upload, X } from "lucide-react";
import { motion } from "motion/react";

const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };

export default function LoginPage() {
  const { setCurrentUser, background, setBackground, findUser, addManagedUser } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [bgPreview, setBgPreview] = useState<string | null>(background);
  const [regName, setRegName] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regShowPass, setRegShowPass] = useState(false);
  const [regError, setRegError] = useState("");

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setBgPreview(dataUrl);
      setBackground(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const removeBg = () => {
    setBgPreview(null);
    setBackground(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (role === "admin") {
      if (
        username.trim().toLowerCase() === ADMIN_CREDENTIALS.username &&
        password === ADMIN_CREDENTIALS.password
      ) {
        setCurrentUser({ id: "admin", username: "Admin", role: "admin" });
        navigate("/admin");
      } else {
        setError("Invalid admin credentials.");
      }
    } else {
      const found = findUser(username, password);
      if (found) {
        setCurrentUser({ id: found.id, username: found.username, role: "user" });
        navigate("/user");
      } else {
        setError("Invalid username or password.");
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    const err = addManagedUser(regName, regPass, "self");
    if (err) { setRegError(err); return; }
    // Login as newly registered user
    const found = findUser(regName, regPass);
    if (found) {
      setCurrentUser({ id: found.id, username: found.username, role: "user" });
      navigate("/user");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {bgPreview ? (
          <img src={bgPreview} alt="background" className="w-full h-full object-cover object-center" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 mb-4">
            <Vote className="text-white w-8 h-8" />
          </div>
          <h1 className="text-white mb-1">VoteSystem</h1>
          <p className="text-white/50 text-sm">Secure. Transparent. Democratic.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl"
        >
          {/* Tabs */}
          <div className="flex bg-white/10 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-2 rounded-xl text-sm transition-all duration-200 ${
                tab === "login" ? "bg-white text-slate-900 shadow" : "text-white/60 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("register"); setRegError(""); }}
              className={`flex-1 py-2 rounded-xl text-sm transition-all duration-200 ${
                tab === "register" ? "bg-white text-slate-900 shadow" : "text-white/60 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Role Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm transition-all duration-200 ${
                    role === "user"
                      ? "bg-blue-500 border-blue-400 text-white"
                      : "border-white/20 text-white/60 hover:border-white/40 hover:text-white"
                  }`}
                >
                  <User className="w-4 h-4" />
                  User
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm transition-all duration-200 ${
                    role === "admin"
                      ? "bg-yellow-500 border-yellow-400 text-white"
                      : "border-white/20 text-white/60 hover:border-white/40 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </button>
              </div>

              {role === "admin" && (
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl px-3 py-2 text-yellow-300 text-xs">
                  Demo: username <strong>admin</strong> · password <strong>admin123</strong>
                </div>
              )}
              {role === "user" && (
                <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl px-3 py-2 text-blue-300 text-xs">
                  Demo: <strong>alice</strong>, <strong>bob</strong>, or <strong>carol</strong> · password <strong>user123</strong>
                </div>
              )}

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50 transition"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 pr-10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  role === "admin"
                    ? "bg-yellow-500 hover:bg-yellow-400 text-white"
                    : "bg-blue-500 hover:bg-blue-400 text-white"
                }`}
              >
                Sign In as {role === "admin" ? "Admin" : "User"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl px-3 py-2 text-blue-300 text-xs">
                Create a new user account to participate in voting.
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Username</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50 transition"
                />
              </div>

              <div>
                <label className="text-white/60 text-xs mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={regShowPass ? "text" : "password"}
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="Create a password"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 pr-10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setRegShowPass(!regShowPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                  >
                    {regShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {regError && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2">
                  {regError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium transition-all duration-200"
              >
                Create Account & Vote
              </button>
            </form>
          )}

          {/* Background upload */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <p className="text-white/40 text-xs mb-2">
              Background image (auto-fits all screen sizes)
            </p>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/30 rounded-xl px-3 py-2 cursor-pointer transition">
                <Upload className="w-4 h-4 text-white/40" />
                <span className="text-white/40 text-xs">
                  {bgPreview ? "Change background" : "Upload background image"}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleBgUpload} />
              </label>
              {bgPreview && (
                <button
                  onClick={removeBg}
                  className="p-2 rounded-xl bg-red-500/20 border border-red-400/20 text-red-400 hover:bg-red-500/30 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {bgPreview && (
              <div className="mt-2 relative rounded-xl overflow-hidden h-16 border border-white/10">
                <img src={bgPreview} alt="bg preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded-full">Preview</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <p className="text-center text-white/20 text-xs mt-6">
          VoteSystem · 2026 Community Election
        </p>
      </div>
    </div>
  );
}
