import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";
import {
  CheckCircle, Vote, ChevronRight, User, BarChart3, ChevronDown, Timer, Clock, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

export default function UserPage() {
  const { candidates, currentUser, votedFor, castVote, totalVotes, voteEndTime, voteExpired } = useApp();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const remaining = useCountdown(voteEndTime);

  const myVote = currentUser ? votedFor[currentUser.id] : null;
  const hasVoted = myVote !== null && myVote !== undefined;
  const myCandidate = candidates.find((c) => c.id === myVote);
  const votingOpen = !voteExpired;
  const canVote = !hasVoted && votingOpen && candidates.length > 0;

  // Timer warning colour
  const timerColor =
    remaining < 60000 ? "text-red-400 border-red-400/30 bg-red-500/10" :
    remaining < 300000 ? "text-orange-400 border-orange-400/30 bg-orange-500/10" :
    "text-orange-300 border-orange-400/30 bg-orange-500/10";

  return (
    <div className="min-h-screen p-4 pb-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-2">
            <User className="w-4 h-4 text-blue-400" />
            <span>Voting Booth</span>
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-white">Cast Your Vote</h1>
              <p className="text-white/50 text-sm mt-1">Select a candidate and submit your vote. You can only vote once.</p>
            </div>
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition">
              Live Results <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Timer banner */}
        <AnimatePresence>
          {voteEndTime && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className={`mb-5 border rounded-2xl p-4 flex items-center gap-4 ${timerColor}`}
            >
              <div className="w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center flex-shrink-0 opacity-80">
                <Timer className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest mb-0.5 opacity-70">Voting Closes In</p>
                <p className="text-white font-semibold text-xl tabular-nums">{formatDuration(remaining)}</p>
              </div>
              <div className="text-xs opacity-60">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                {new Date(voteEndTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voting closed banner */}
        <AnimatePresence>
          {voteExpired && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              className="mb-5 bg-red-500/15 border border-red-400/30 rounded-2xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="text-red-400 w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium text-sm">Voting is now closed</p>
                <p className="text-red-400/60 text-xs mt-0.5">The voting round has ended. Votes have been reset for the next round.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vote success */}
        <AnimatePresence>
          {hasVoted && !voteExpired && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-5 bg-emerald-500/15 border border-emerald-400/30 rounded-2xl p-4 flex items-start gap-3"
            >
              <CheckCircle className="text-emerald-400 w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-emerald-300 font-medium text-sm">Your vote has been recorded!</p>
                <p className="text-emerald-400/60 text-xs mt-0.5">
                  You voted for <strong className="text-emerald-300">{myCandidate?.name}</strong> ({myCandidate?.party})
                </p>
                <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-emerald-400 text-xs mt-2 hover:text-emerald-300 transition">
                  View live results <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
            <div className="text-blue-400 mb-1"><BarChart3 className="w-4 h-4" /></div>
            <div className="text-white font-semibold text-lg">{totalVotes.toLocaleString()}</div>
            <div className="text-white/40 text-xs">Total Votes Cast</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
            <div className="text-purple-400 mb-1"><Vote className="w-4 h-4" /></div>
            <div className="text-white font-semibold text-lg">{candidates.length}</div>
            <div className="text-white/40 text-xs">Candidates Running</div>
          </div>
        </div>

        {/* Candidate list */}
        <div className="space-y-3 mb-6">
          {candidates.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <Vote className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No candidates available yet.</p>
            </div>
          ) : (
            candidates.map((c, idx) => {
              const isSelected = selectedId === c.id;
              const isMyVote = myVote === c.id;
              const isExpanded = expandedId === c.id;
              const clickable = canVote && !isMyVote;

              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                  <div
                    className={`bg-white/10 backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-200
                      ${isMyVote ? "border-emerald-400/50 bg-emerald-500/10" : ""}
                      ${isSelected && canVote ? "border-white/50 bg-white/15" : ""}
                      ${!isSelected && !isMyVote ? "border-white/15" : ""}
                      ${clickable ? "cursor-pointer hover:border-white/30 hover:bg-white/15" : ""}
                      ${voteExpired ? "opacity-60" : ""}
                    `}
                    onClick={() => { if (clickable) setSelectedId(isSelected ? null : c.id); }}
                  >
                    <div className="p-4 flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: c.color + "33", border: `2px solid ${c.color}66` }}>
                        {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : (
                          <span style={{ color: c.color }}>{c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-medium">{c.name}</span>
                          {isMyVote && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Your Vote</span>}
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full inline-block mt-0.5" style={{ backgroundColor: c.color + "22", color: c.color }}>
                          {c.party}
                        </span>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : c.id); }}
                          className="p-1.5 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/10 transition"
                        >
                          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        </button>
                        {canVote && !isMyVote && (
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? "border-white bg-white" : "border-white/30"}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-slate-900" />}
                          </div>
                        )}
                        {hasVoted && isMyVote && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                      </div>
                    </div>

                    {/* Description */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="mx-4 mb-4 p-3 rounded-xl text-sm text-white/70 leading-relaxed" style={{ backgroundColor: c.color + "11", borderLeft: `3px solid ${c.color}` }}>
                            {c.description}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Vote button */}
        <AnimatePresence>
          {selectedId && canVote && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="sticky bottom-4">
              <button
                onClick={() => {
                  if (!selectedId || !currentUser || hasVoted) return;
                  castVote(currentUser.id, selectedId);
                }}
                className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
              >
                <Vote className="w-5 h-5" />
                Vote for {candidates.find((c) => c.id === selectedId)?.name}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {hasVoted && !voteExpired && (
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-sm transition flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" /> View Live Results
          </button>
        )}
      </div>
    </div>
  );
}
