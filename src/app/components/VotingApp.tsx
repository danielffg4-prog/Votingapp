import { useState } from "react";
import { CheckCircle, Users, BarChart3, Vote, Trophy } from "lucide-react";

interface Candidate {
  id: number;
  name: string;
  party: string;
  color: string;
  bgColor: string;
  borderColor: string;
  votes: number;
  avatar: string;
}

const initialCandidates: Candidate[] = [
  {
    id: 1,
    name: "Alexandra Rivera",
    party: "Progressive Alliance",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    votes: 142,
    avatar: "AR",
  },
  {
    id: 2,
    name: "Marcus Thompson",
    party: "Liberty Forward",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    votes: 98,
    avatar: "MT",
  },
  {
    id: 3,
    name: "Priya Patel",
    party: "Unity Coalition",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    votes: 175,
    avatar: "PP",
  },
  {
    id: 4,
    name: "James O'Connor",
    party: "New Democracy",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    votes: 63,
    avatar: "JO",
  },
];

const avatarBgColors = [
  "bg-blue-500",
  "bg-red-500",
  "bg-emerald-500",
  "bg-purple-500",
];

const barColors = [
  "bg-blue-500",
  "bg-red-500",
  "bg-emerald-500",
  "bg-purple-500",
];

export default function VotingApp() {
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [votedFor, setVotedFor] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
  const leaderId = sortedCandidates[0]?.id;

  const handleVote = (candidateId: number) => {
    if (votedFor !== null) return;
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
      )
    );
    setVotedFor(candidateId);
    setShowResults(true);
  };

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  const displayCandidates = showResults ? sortedCandidates : candidates;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Vote className="text-white w-7 h-7" />
            <span className="text-white/60 text-sm tracking-widest uppercase">Live Poll</span>
          </div>
          <h1 className="text-white mb-2">2026 Community Election</h1>
          <p className="text-white/50 text-sm">Cast your vote for your preferred candidate</p>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-6 mt-5">
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <Users className="w-4 h-4" />
              <span>{totalVotes.toLocaleString()} votes cast</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-1.5 text-white/60 text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>{candidates.length} candidates</span>
            </div>
          </div>
        </div>

        {/* Voted Banner */}
        {votedFor !== null && (
          <div className="mb-5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-3.5 flex items-center gap-3">
            <CheckCircle className="text-emerald-400 w-5 h-5 flex-shrink-0" />
            <div>
              <p className="text-emerald-300 text-sm">
                Your vote for <span className="font-medium">{candidates.find((c) => c.id === votedFor)?.name}</span> has been recorded!
              </p>
              <p className="text-emerald-400/60 text-xs mt-0.5">Results update in real-time</p>
            </div>
          </div>
        )}

        {/* Candidates */}
        <div className="space-y-3">
          {displayCandidates.map((candidate, idx) => {
            const percentage = getPercentage(candidate.votes);
            const isLeader = candidate.id === leaderId && showResults;
            const hasVoted = votedFor !== null;
            const isMyVote = votedFor === candidate.id;
            const originalIdx = initialCandidates.findIndex((c) => c.id === candidate.id);

            return (
              <div
                key={candidate.id}
                className={`relative rounded-2xl border transition-all duration-300 overflow-hidden
                  ${hasVoted
                    ? "cursor-default border-white/10 bg-white/5"
                    : hoveredId === candidate.id
                    ? "cursor-pointer border-white/30 bg-white/10 scale-[1.01]"
                    : "cursor-pointer border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                  }
                  ${isMyVote ? "border-emerald-500/40 bg-emerald-500/10" : ""}
                  ${isLeader ? "border-yellow-400/30" : ""}
                `}
                onClick={() => !hasVoted && handleVote(candidate.id)}
                onMouseEnter={() => !hasVoted && setHoveredId(candidate.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Progress bar background */}
                {showResults && (
                  <div
                    className={`absolute inset-0 ${barColors[originalIdx]} opacity-[0.07] transition-all duration-700`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                <div className="relative flex items-center gap-4 p-4">
                  {/* Rank (only shown after voting) */}
                  {showResults && (
                    <div className="text-white/30 w-4 text-sm text-center">
                      {idx + 1}
                    </div>
                  )}

                  {/* Avatar */}
                  <div
                    className={`${avatarBgColors[originalIdx]} w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}
                  >
                    {candidate.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">{candidate.name}</span>
                      {isLeader && showResults && (
                        <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      )}
                      {isMyVote && (
                        <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full flex-shrink-0">
                          Your vote
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-sm">{candidate.party}</p>

                    {/* Progress bar */}
                    {showResults && (
                      <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColors[originalIdx]} rounded-full transition-all duration-700`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right side */}
                  <div className="flex-shrink-0 text-right">
                    {showResults ? (
                      <>
                        <div className={`text-lg font-semibold ${isLeader ? "text-yellow-400" : "text-white"}`}>
                          {percentage}%
                        </div>
                        <div className="text-white/40 text-xs">
                          {candidate.votes.toLocaleString()} votes
                        </div>
                      </>
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-200
                          ${hoveredId === candidate.id
                            ? "border-white bg-white scale-110"
                            : "border-white/30"
                          }`}
                      >
                        {hoveredId === candidate.id && (
                          <div className="w-3 h-3 rounded-full bg-slate-900" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Toggle results button */}
        {!votedFor && (
          <div className="mt-5 text-center">
            <button
              onClick={() => setShowResults(!showResults)}
              className="text-white/40 text-sm hover:text-white/70 transition-colors underline underline-offset-4"
            >
              {showResults ? "Hide results" : "View current results"}
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-8">
          Poll closes March 15, 2026 · One vote per session
        </p>
      </div>
    </div>
  );
}
