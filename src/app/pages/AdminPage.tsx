import { useState, useRef, useEffect } from "react";
import { useApp, Candidate, CANDIDATE_COLORS, ManagedUser, DEMO_USERS } from "../context/AppContext";
import { useNavigate } from "react-router";
import {
  Plus, Trash2, Edit3, Check, X, Upload, ImageIcon,
  Users, BarChart3, ShieldCheck, Clock, RotateCcw,
  AlertTriangle, Eye, EyeOff, UserPlus, Timer,
  ChevronRight, Settings, Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Candidate Form ────────────────────────────────────────────────────────
interface CandidateFormState {
  name: string; party: string; description: string; image: string | null; color: string;
}
const emptyForm = (): CandidateFormState => ({ name: "", party: "", description: "", image: null, color: CANDIDATE_COLORS[0] });

// ─── User Form ─────────────────────────────────────────────────────────────
interface UserFormState { username: string; password: string; showPass: boolean; }
const emptyUserForm = (): UserFormState => ({ username: "", password: "", showPass: false });

// ─── Countdown hook ────────────────────────────────────────────────────────
function useCountdown(endTime: number | null) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!endTime) { setRemaining(0); return; }
    const update = () => setRemaining(Math.max(0, endTime - Date.now()));
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endTime]);
  return remaining;
}

function formatDuration(ms: number) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function AdminPage() {
  const {
    candidates, setCandidates, totalVotes,
    resetVotes, voteEndTime, setVoteTimer,
    managedUsers, addManagedUser, editManagedUser, deleteManagedUser,
    votedFor,
  } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"candidates" | "users" | "settings">("candidates");

  // Candidate state
  const [showCandForm, setShowCandForm] = useState(false);
  const [editingCandId, setEditingCandId] = useState<string | null>(null);
  const [candForm, setCandForm] = useState<CandidateFormState>(emptyForm());
  const [deleteCandConfirm, setDeleteCandConfirm] = useState<string | null>(null);
  const [candFormError, setCandFormError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // User state
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm());
  const [userFormError, setUserFormError] = useState("");
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<string | null>(null);

  // Settings state
  const [resetConfirm, setResetConfirm] = useState(false);
  const [timerHours, setTimerHours] = useState("0");
  const [timerMinutes, setTimerMinutes] = useState("30");
  const [timerSeconds, setTimerSeconds] = useState("0");
  const [timerError, setTimerError] = useState("");

  const remaining = useCountdown(voteEndTime);
  const topCandidate = [...candidates].sort((a, b) => b.votes - a.votes)[0];
  const allUsers = [...DEMO_USERS, ...managedUsers];
  const totalUsers = allUsers.length;

  // ─── Candidate handlers ──────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCandForm((f) => ({ ...f, image: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const openAddCand = () => {
    const nextColor = CANDIDATE_COLORS[candidates.length % CANDIDATE_COLORS.length];
    setCandForm({ ...emptyForm(), color: nextColor });
    setEditingCandId(null);
    setShowCandForm(true);
    setCandFormError("");
  };

  const openEditCand = (c: Candidate) => {
    setCandForm({ name: c.name, party: c.party, description: c.description, image: c.image, color: c.color });
    setEditingCandId(c.id);
    setShowCandForm(true);
    setCandFormError("");
  };

  const handleSaveCand = () => {
    if (!candForm.name.trim()) { setCandFormError("Candidate name is required."); return; }
    if (!candForm.party.trim()) { setCandFormError("Party name is required."); return; }
    if (!candForm.description.trim()) { setCandFormError("Description is required."); return; }
    if (editingCandId) {
      setCandidates(candidates.map((c) =>
        c.id === editingCandId ? { ...c, ...candForm } : c
      ));
    } else {
      setCandidates([...candidates, {
        id: `c_${Date.now()}`,
        name: candForm.name, party: candForm.party,
        description: candForm.description, image: candForm.image,
        color: candForm.color, votes: 0,
      }]);
    }
    setShowCandForm(false);
    setEditingCandId(null);
    setCandForm(emptyForm());
  };

  const handleDeleteCand = (id: string) => {
    setCandidates(candidates.filter((c) => c.id !== id));
    setDeleteCandConfirm(null);
  };

  // ─── User handlers ───────────────────────────────────────────────────────
  const openAddUser = () => {
    setUserForm(emptyUserForm());
    setEditingUserId(null);
    setShowUserForm(true);
    setUserFormError("");
  };

  const openEditUser = (u: ManagedUser) => {
    setUserForm({ username: u.username, password: u.password, showPass: false });
    setEditingUserId(u.id);
    setShowUserForm(true);
    setUserFormError("");
  };

  const handleSaveUser = () => {
    if (editingUserId) {
      const err = editManagedUser(editingUserId, userForm.username, userForm.password);
      if (err) { setUserFormError(err); return; }
    } else {
      const err = addManagedUser(userForm.username, userForm.password, "admin");
      if (err) { setUserFormError(err); return; }
    }
    setShowUserForm(false);
    setEditingUserId(null);
    setUserForm(emptyUserForm());
  };

  const handleDeleteUser = (id: string) => {
    deleteManagedUser(id);
    setDeleteUserConfirm(null);
  };

  // ─── Settings handlers ───────────────────────────────────────────────────
  const handleResetVotes = () => {
    resetVotes();
    setResetConfirm(false);
  };

  const handleStartTimer = () => {
    const h = parseInt(timerHours) || 0;
    const m = parseInt(timerMinutes) || 0;
    const s = parseInt(timerSeconds) || 0;
    const totalMs = (h * 3600 + m * 60 + s) * 1000;
    if (totalMs <= 0) { setTimerError("Please set a duration greater than 0."); return; }
    setTimerError("");
    setVoteTimer(Date.now() + totalMs);
  };

  const handleStopTimer = () => {
    setVoteTimer(null);
  };

  const tabs = [
    { id: "candidates", label: "Candidates", icon: <Layers className="w-4 h-4" /> },
    { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="min-h-screen p-4 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            <span>Admin Panel</span>
            <span className="text-white/20">·</span>
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 hover:text-white transition">
              Live Dashboard <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <h1 className="text-white">Admin Control Panel</h1>
        </motion.div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Candidates", value: candidates.length, icon: <Layers className="w-4 h-4" />, color: "text-blue-400" },
            { label: "Total Votes", value: totalVotes, icon: <BarChart3 className="w-4 h-4" />, color: "text-green-400" },
            { label: "Total Users", value: totalUsers, icon: <Users className="w-4 h-4" />, color: "text-purple-400" },
            {
              label: voteEndTime ? "Time Left" : "Timer",
              value: voteEndTime ? formatDuration(remaining) : "Off",
              icon: <Timer className="w-4 h-4" />,
              color: voteEndTime ? "text-orange-400" : "text-white/30",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
              <div className={`${stat.color} mb-1`}>{stat.icon}</div>
              <div className="text-white font-semibold text-lg truncate">{stat.value}</div>
              <div className="text-white/40 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1 mb-5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                activeTab === tab.id ? "bg-white text-slate-900 shadow" : "text-white/60 hover:text-white"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── CANDIDATES TAB ── */}
        <AnimatePresence mode="wait">
          {activeTab === "candidates" && (
            <motion.div key="candidates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-end mb-4">
                <button
                  onClick={openAddCand}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2.5 rounded-xl text-sm transition"
                >
                  <Plus className="w-4 h-4" /> Add Candidate
                </button>
              </div>

              <div className="space-y-3">
                {candidates.length === 0 ? (
                  <div className="text-center py-16 text-white/30">
                    <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No candidates yet. Add the first one!</p>
                  </div>
                ) : (
                  candidates.map((c, idx) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-start gap-4"
                    >
                      <div
                        className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-lg font-medium"
                        style={{ backgroundColor: c.color + "33", border: `2px solid ${c.color}66` }}
                      >
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <span style={{ color: c.color }}>{c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-medium">{c.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: c.color + "22", color: c.color }}>
                            {c.party}
                          </span>
                        </div>
                        <p className="text-white/50 text-sm mt-1 line-clamp-2">{c.description}</p>
                        <p className="text-white/30 text-xs mt-1.5">{c.votes} votes received</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => openEditCand(c)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {deleteCandConfirm === c.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDeleteCand(c.id)} className="p-2 rounded-xl bg-red-500 hover:bg-red-400 text-white transition"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteCandConfirm(null)} className="p-2 rounded-xl bg-white/10 text-white/60 transition"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteCandConfirm(c.id)} className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ── USERS TAB ── */}
          {activeTab === "users" && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/50 text-sm">{totalUsers} registered users</p>
                <button
                  onClick={openAddUser}
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2.5 rounded-xl text-sm transition"
                >
                  <UserPlus className="w-4 h-4" /> Add User
                </button>
              </div>

              <div className="space-y-2">
                {/* Demo users (read-only) */}
                {DEMO_USERS.map((u, idx) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/20 flex items-center justify-center text-blue-400 text-sm font-medium">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{u.username}</span>
                        <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">Demo</span>
                        {votedFor[u.id] && <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Voted</span>}
                      </div>
                      <p className="text-white/30 text-xs">Default password: user123</p>
                    </div>
                    <span className="text-white/20 text-xs italic">Read-only</span>
                  </motion.div>
                ))}

                {/* Managed users */}
                {managedUsers.length === 0 && DEMO_USERS.length > 0 && (
                  <div className="text-center py-6 text-white/30 text-sm">
                    No additional users. Click "Add User" to create one.
                  </div>
                )}
                {managedUsers.map((u, idx) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (DEMO_USERS.length + idx) * 0.04 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/20 flex items-center justify-center text-purple-400 text-sm font-medium">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white text-sm">{u.username}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          u.createdBy === "admin"
                            ? "text-yellow-400 bg-yellow-500/10"
                            : "text-blue-400 bg-blue-500/10"
                        }`}>
                          {u.createdBy === "admin" ? "By Admin" : "Self-registered"}
                        </span>
                        {votedFor[u.id] && <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Voted</span>}
                      </div>
                      <p className="text-white/30 text-xs">Password: {"•".repeat(Math.min(u.password.length, 8))}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openEditUser(u)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {deleteUserConfirm === u.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDeleteUser(u.id)} className="p-2 rounded-xl bg-red-500 hover:bg-red-400 text-white transition"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteUserConfirm(null)} className="p-2 rounded-xl bg-white/10 text-white/60 transition"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteUserConfirm(u.id)} className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              {/* Vote Timer */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <h2 className="text-white text-base">Vote Timer</h2>
                </div>
                <p className="text-white/50 text-sm mb-4">
                  Set a countdown duration. When the timer expires, all votes are automatically reset and a new voting round begins.
                </p>

                {voteEndTime ? (
                  <div className="space-y-4">
                    <div className="bg-orange-500/10 border border-orange-400/30 rounded-2xl p-5 text-center">
                      <p className="text-orange-300 text-xs mb-2 uppercase tracking-widest">Time Remaining</p>
                      <div className="text-white font-semibold text-4xl tabular-nums tracking-wider">
                        {formatDuration(remaining)}
                      </div>
                      <p className="text-white/40 text-xs mt-2">
                        Ends at {new Date(voteEndTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </p>
                      {/* Progress bar */}
                      <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full transition-all duration-1000"
                          style={{ width: `${remaining > 0 ? (remaining / (voteEndTime - (voteEndTime - remaining - (Date.now() - remaining > 0 ? 0 : 0)))) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleStopTimer}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30 transition text-sm"
                    >
                      <X className="w-4 h-4" /> Stop Timer
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Hours", value: timerHours, setter: setTimerHours, max: 99 },
                        { label: "Minutes", value: timerMinutes, setter: setTimerMinutes, max: 59 },
                        { label: "Seconds", value: timerSeconds, setter: setTimerSeconds, max: 59 },
                      ].map((field) => (
                        <div key={field.label}>
                          <label className="text-white/50 text-xs mb-1.5 block text-center">{field.label}</label>
                          <input
                            type="number"
                            min="0"
                            max={field.max}
                            value={field.value}
                            onChange={(e) => field.setter(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-xl px-3 py-3 text-white text-center text-lg focus:outline-none focus:border-white/50 transition"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Quick presets */}
                    <div className="flex gap-2 flex-wrap">
                      <p className="text-white/30 text-xs w-full">Quick presets:</p>
                      {[
                        { label: "5 min", h: "0", m: "5", s: "0" },
                        { label: "15 min", h: "0", m: "15", s: "0" },
                        { label: "30 min", h: "0", m: "30", s: "0" },
                        { label: "1 hour", h: "1", m: "0", s: "0" },
                        { label: "1 day", h: "24", m: "0", s: "0" },
                      ].map((p) => (
                        <button
                          key={p.label}
                          onClick={() => { setTimerHours(p.h); setTimerMinutes(p.m); setTimerSeconds(p.s); setTimerError(""); }}
                          className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white/50 hover:text-white text-xs transition"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {timerError && (
                      <p className="text-red-400 text-xs bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2">
                        {timerError}
                      </p>
                    )}

                    <button
                      onClick={handleStartTimer}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium transition"
                    >
                      <Timer className="w-4 h-4" /> Start Timer
                    </button>
                  </div>
                )}
              </div>

              {/* Reset Votes */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <RotateCcw className="w-5 h-5 text-red-400" />
                  <h2 className="text-white text-base">Reset All Votes</h2>
                </div>
                <p className="text-white/50 text-sm mb-4">
                  This will reset every candidate's vote count to zero and clear all users' vote records. This action cannot be undone.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 flex items-center justify-between">
                  <span className="text-white/60 text-sm">Current total votes</span>
                  <span className="text-white font-semibold">{totalVotes.toLocaleString()}</span>
                </div>

                {!resetConfirm ? (
                  <button
                    onClick={() => setResetConfirm(true)}
                    disabled={totalVotes === 0}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset All Votes
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-3 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-300 text-sm">Are you sure? This will permanently remove all <strong>{totalVotes}</strong> votes.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setResetConfirm(false)}
                        className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 text-sm transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResetVotes}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm transition flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> Yes, Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Candidate Form Modal ── */}
      <AnimatePresence>
        {showCandForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900/95 border border-white/20 rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white">{editingCandId ? "Edit Candidate" : "Add New Candidate"}</h2>
                <button onClick={() => setShowCandForm(false)} className="text-white/40 hover:text-white transition"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                {/* Image */}
                <div>
                  <label className="text-white/60 text-xs mb-2 block">Candidate Photo</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl h-32 flex items-center justify-center transition overflow-hidden relative"
                  >
                    {candForm.image ? (
                      <>
                        <img src={candForm.image} alt="candidate" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                          <Upload className="text-white w-6 h-6" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-white/30">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-xs">Click to upload photo</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {candForm.image && (
                    <button onClick={() => setCandForm((f) => ({ ...f, image: null }))} className="mt-1 text-red-400 text-xs hover:text-red-300 transition">
                      Remove photo
                    </button>
                  )}
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Full Name *</label>
                  <input type="text" value={candForm.name} onChange={(e) => setCandForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Alexandra Rivera" className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-white/50 transition" />
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Party / Organization *</label>
                  <input type="text" value={candForm.party} onChange={(e) => setCandForm((f) => ({ ...f, party: e.target.value }))} placeholder="e.g. Progressive Alliance" className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-white/50 transition" />
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Description / Platform *</label>
                  <textarea value={candForm.description} onChange={(e) => setCandForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe the candidate's platform, vision, and key policies..." rows={4} className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-white/50 transition resize-none" />
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-2 block">Candidate Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {CANDIDATE_COLORS.map((color) => (
                      <button key={color} onClick={() => setCandForm((f) => ({ ...f, color }))}
                        className={`w-7 h-7 rounded-full transition-all duration-200 ${candForm.color === color ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110" : "hover:scale-110"}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                {candFormError && <p className="text-red-400 text-xs bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2">{candFormError}</p>}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowCandForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 text-sm transition">Cancel</button>
                  <button onClick={handleSaveCand} className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm transition flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> {editingCandId ? "Save Changes" : "Add Candidate"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── User Form Modal ── */}
      <AnimatePresence>
        {showUserForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900/95 border border-white/20 rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white">{editingUserId ? "Edit User" : "Add New User"}</h2>
                <button onClick={() => setShowUserForm(false)} className="text-white/40 hover:text-white transition"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Username *</label>
                  <input
                    type="text"
                    value={userForm.username}
                    onChange={(e) => setUserForm((f) => ({ ...f, username: e.target.value }))}
                    placeholder="Enter username"
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-white/50 transition"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs mb-1.5 block">Password *</label>
                  <div className="relative">
                    <input
                      type={userForm.showPass ? "text" : "password"}
                      value={userForm.password}
                      onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Enter password"
                      className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2.5 pr-10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-white/50 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setUserForm((f) => ({ ...f, showPass: !f.showPass }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      {userForm.showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {userFormError && <p className="text-red-400 text-xs bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2">{userFormError}</p>}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowUserForm(false)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 text-sm transition">Cancel</button>
                  <button onClick={handleSaveUser} className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm transition flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> {editingUserId ? "Save" : "Add User"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
