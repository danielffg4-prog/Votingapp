import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";
import {
  Trophy, Users, BarChart3, RefreshCw, TrendingUp, Vote, Activity, Timer, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";

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

export default function DashboardPage() {
  const { candidates, totalVotes, currentUser, voteEndTime } = useApp();
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [view, setView] = useState<"bar" | "pie">("bar");

  const remaining = useCountdown(voteEndTime);

  useEffect(() => {
    const interval = setInterval(() => setLastUpdated(new Date()), 5000);
    return () => clearInterval(interval);
  }, []);

  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  const leader = sorted[0];

  const chartData = sorted.map((c) => ({
    name: c.name.split(" ")[0],
    fullName: c.name,
    votes: c.votes,
    pct: totalVotes > 0 ? Math.round((c.votes / totalVotes) * 100) : 0,
    color: c.color,
  }));

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-white/20 rounded-xl px-3 py-2 text-sm">
          <p className="text-white font-medium">{data.fullName}</p>
          <p className="text-white/60">{data.votes.toLocaleString()} votes · {data.pct}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen p-4 pb-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-green-400">● Live</span>
            <span className="text-white/30">Updated at {formatTime(lastUpdated)}</span>
            <button
              onClick={() => setLastUpdated(new Date())}
              className="text-white/30 hover:text-white/60 transition ml-1"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-white">Live Vote Dashboard</h1>
              <p className="text-white/50 text-sm mt-1">Real-time election results and statistics.</p>
            </div>
            {currentUser?.role === "user" && (
              <button
                onClick={() => navigate("/user")}
                className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-400 text-white text-sm px-4 py-2 rounded-xl transition"
              >
                <Vote className="w-4 h-4" /> Cast Vote
              </button>
            )}
          </div>
        </motion.div>

        {/* Timer banner */}
        <AnimatePresence>
          {voteEndTime && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 bg-orange-500/15 border border-orange-400/30 rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Timer className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-orange-300 text-xs uppercase tracking-widest mb-0.5">Voting Round Ends In</p>
                <p className="text-white font-semibold text-xl tabular-nums">{formatDuration(remaining)}</p>
              </div>
              <div className="text-right text-white/40 text-xs">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                {new Date(voteEndTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Votes", value: totalVotes.toLocaleString(), icon: <BarChart3 className="w-4 h-4" />, color: "text-blue-400" },
            { label: "Candidates", value: candidates.length, icon: <Users className="w-4 h-4" />, color: "text-purple-400" },
            { label: "Leading", value: leader?.name.split(" ")[0] || "—", icon: <Trophy className="w-4 h-4" />, color: "text-yellow-400" },
            {
              label: "Lead %",
              value: leader && totalVotes > 0 ? `${Math.round((leader.votes / totalVotes) * 100)}%` : "—",
              icon: <TrendingUp className="w-4 h-4" />,
              color: "text-emerald-400",
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4"
            >
              <div className={`${stat.color} mb-1`}>{stat.icon}</div>
              <div className="text-white font-semibold text-xl">{stat.value}</div>
              <div className="text-white/40 text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Chart toggle */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-base">Vote Distribution</h2>
          <div className="flex bg-white/10 rounded-xl p-1">
            <button onClick={() => setView("bar")} className={`px-3 py-1.5 rounded-lg text-xs transition ${view === "bar" ? "bg-white text-slate-900" : "text-white/50 hover:text-white"}`}>Bar Chart</button>
            <button onClick={() => setView("pie")} className={`px-3 py-1.5 rounded-lg text-xs transition ${view === "pie" ? "bg-white text-slate-900" : "text-white/50 hover:text-white"}`}>Pie Chart</button>
          </div>
        </div>

        {/* Chart */}
        <motion.div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {candidates.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-white/30 text-sm">No candidates to display.</div>
          ) : view === "bar" ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
                <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={chartData} dataKey="votes" nameKey="fullName" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={3}
                  label={({ name, pct }) => `${name} ${pct}%`} labelLine={{ stroke: "rgba(255,255,255,0.2)" }}
                >
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Rankings */}
        <h2 className="text-white text-base mb-4">Candidate Rankings</h2>
        <div className="space-y-3">
          <AnimatePresence>
            {sorted.length === 0 ? (
              <div className="text-center py-10 text-white/30 text-sm">No candidates yet.</div>
            ) : (
              sorted.map((c, idx) => {
                const pct = totalVotes > 0 ? (c.votes / totalVotes) * 100 : 0;
                const isLeader = idx === 0 && c.votes > 0;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-4 overflow-hidden relative"
                  >
                    <div className="absolute inset-0 opacity-10 transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                    <div className="relative flex items-center gap-4">
                      <div className="text-white/30 w-6 text-center flex-shrink-0">
                        {isLeader ? <Trophy className="w-5 h-5 text-yellow-400 mx-auto" /> : <span className="text-sm">{idx + 1}</span>}
                      </div>
                      <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: c.color + "33", border: `2px solid ${c.color}55` }}>
                        {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : (
                          <span style={{ color: c.color }}>{c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{c.name}</span>
                          {isLeader && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">Leading</span>}
                        </div>
                        <p className="text-white/40 text-xs">{c.party}</p>
                        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{ backgroundColor: c.color }}
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }} />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-semibold" style={{ color: isLeader ? "#facc15" : "white" }}>
                          {Math.round(pct)}%
                        </div>
                        <div className="text-white/40 text-xs">{c.votes.toLocaleString()} votes</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          Auto-refreshes every 5 seconds
          {voteEndTime ? ` · Vote round ends ${new Date(voteEndTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
        </p>
      </div>
    </div>
  );
}
