import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface Candidate {
  id: string;
  name: string;
  party: string;
  description: string;
  image: string | null;
  votes: number;
  color: string;
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "user";
}

export interface ManagedUser {
  id: string;
  username: string;
  password: string;
  createdBy: "demo" | "admin" | "self";
}

interface AppState {
  // Candidates
  candidates: Candidate[];
  setCandidates: (c: Candidate[]) => void;
  // Auth
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  logout: () => void;
  // Background
  background: string | null;
  setBackground: (b: string | null) => void;
  // Votes
  votedFor: Record<string, string>;
  castVote: (userId: string, candidateId: string) => void;
  resetVotes: () => void;
  totalVotes: number;
  // Timer
  voteEndTime: number | null;
  setVoteTimer: (endTime: number | null) => void;
  voteExpired: boolean;
  // Users
  managedUsers: ManagedUser[];
  addManagedUser: (username: string, password: string, createdBy?: "admin" | "self") => string | null; // returns error or null
  editManagedUser: (id: string, username: string, password: string) => string | null;
  deleteManagedUser: (id: string) => void;
  findUser: (username: string, password: string) => ManagedUser | null;
}

const AppContext = createContext<AppState | null>(null);

const COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#f97316",
];

const DEFAULT_CANDIDATES: Candidate[] = [
  {
    id: "1",
    name: "Alexandra Rivera",
    party: "Progressive Alliance",
    description: "Dedicated to sustainable development, education reform, and creating equal opportunities for every citizen in our community.",
    image: null,
    votes: 142,
    color: "#3b82f6",
  },
  {
    id: "2",
    name: "Marcus Thompson",
    party: "Liberty Forward",
    description: "Champion of economic freedom, small business growth, and reducing bureaucracy to empower individuals and families.",
    image: null,
    votes: 98,
    color: "#ef4444",
  },
  {
    id: "3",
    name: "Priya Patel",
    party: "Unity Coalition",
    description: "Focused on healthcare accessibility, community infrastructure, and building a united society that leaves no one behind.",
    image: null,
    votes: 175,
    color: "#10b981",
  },
];

const DEMO_USERS: ManagedUser[] = [
  { id: "u1", username: "alice", password: "user123", createdBy: "demo" },
  { id: "u2", username: "bob", password: "user123", createdBy: "demo" },
  { id: "u3", username: "carol", password: "user123", createdBy: "demo" },
];

function loadManagedUsers(): ManagedUser[] {
  try {
    const stored = localStorage.getItem("voteapp_managed_users");
    if (stored) return JSON.parse(stored);
    // Migrate old registered users if any
    const oldReg = localStorage.getItem("voteapp_registered");
    if (oldReg) {
      const old = JSON.parse(oldReg) as any[];
      return old.map((u) => ({ ...u, createdBy: "self" as const }));
    }
    return [];
  } catch {
    return [];
  }
}

function saveManagedUsers(users: ManagedUser[]) {
  localStorage.setItem("voteapp_managed_users", JSON.stringify(users));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [candidates, setCandidatesState] = useState<Candidate[]>(() => {
    try {
      const s = localStorage.getItem("voteapp_candidates");
      return s ? JSON.parse(s) : DEFAULT_CANDIDATES;
    } catch { return DEFAULT_CANDIDATES; }
  });

  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem("voteapp_user");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  const [background, setBackgroundState] = useState<string | null>(() => {
    try { return localStorage.getItem("voteapp_bg") || null; }
    catch { return null; }
  });

  const [votedFor, setVotedFor] = useState<Record<string, string>>(() => {
    try {
      const s = localStorage.getItem("voteapp_votes");
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });

  const [voteEndTime, setVoteEndTimeState] = useState<number | null>(() => {
    try {
      const s = localStorage.getItem("voteapp_end_time");
      return s ? Number(s) : null;
    } catch { return null; }
  });

  const [managedUsers, setManagedUsersState] = useState<ManagedUser[]>(() => loadManagedUsers());

  const [voteExpired, setVoteExpired] = useState(false);

  // Check timer every second
  useEffect(() => {
    if (!voteEndTime) {
      setVoteExpired(false);
      return;
    }
    const check = () => {
      const now = Date.now();
      if (now >= voteEndTime) {
        setVoteExpired(true);
      } else {
        setVoteExpired(false);
      }
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }, [voteEndTime]);

  // Auto-reset when timer expires
  useEffect(() => {
    if (!voteExpired || !voteEndTime) return;
    // Reset votes using functional update to avoid stale closure
    setCandidatesState((prev) => {
      const reset = prev.map((c) => ({ ...c, votes: 0 }));
      localStorage.setItem("voteapp_candidates", JSON.stringify(reset));
      return reset;
    });
    setVotedFor({});
    localStorage.removeItem("voteapp_votes");
    // Clear timer
    setVoteEndTimeState(null);
    localStorage.removeItem("voteapp_end_time");
    setVoteExpired(false);
  }, [voteExpired]);

  const setCandidates = (c: Candidate[]) => {
    setCandidatesState(c);
    localStorage.setItem("voteapp_candidates", JSON.stringify(c));
  };

  const setCurrentUser = (u: User | null) => {
    setCurrentUserState(u);
    if (u) localStorage.setItem("voteapp_user", JSON.stringify(u));
    else localStorage.removeItem("voteapp_user");
  };

  const setBackground = (b: string | null) => {
    setBackgroundState(b);
    if (b) localStorage.setItem("voteapp_bg", b);
    else localStorage.removeItem("voteapp_bg");
  };

  const castVote = (userId: string, candidateId: string) => {
    const updated = { ...votedFor, [userId]: candidateId };
    setVotedFor(updated);
    localStorage.setItem("voteapp_votes", JSON.stringify(updated));
    const updatedCandidates = candidates.map((c) =>
      c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
    );
    setCandidates(updatedCandidates);
  };

  const resetVotes = () => {
    const reset = candidates.map((c) => ({ ...c, votes: 0 }));
    setCandidates(reset);
    setVotedFor({});
    localStorage.removeItem("voteapp_votes");
    // Also clear timer when manually resetting
    setVoteEndTimeState(null);
    localStorage.removeItem("voteapp_end_time");
  };

  const setVoteTimer = (endTime: number | null) => {
    setVoteEndTimeState(endTime);
    if (endTime) localStorage.setItem("voteapp_end_time", String(endTime));
    else localStorage.removeItem("voteapp_end_time");
  };

  const logout = () => setCurrentUser(null);

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);

  // ---- User management ----
  const allUsernames = () => {
    const demoNames = DEMO_USERS.map((u) => u.username);
    const managedNames = managedUsers.map((u) => u.username);
    return [...demoNames, ...managedNames, "admin"];
  };

  const addManagedUser = (username: string, password: string, createdBy: "admin" | "self" = "admin"): string | null => {
    if (!username.trim() || !password.trim()) return "Username and password are required.";
    const lc = username.toLowerCase().trim();
    const taken = [...DEMO_USERS, ...managedUsers].some((u) => u.username.toLowerCase() === lc) || lc === "admin";
    if (taken) return "Username already taken.";
    const newUser: ManagedUser = {
      id: `u_${Date.now()}`,
      username: username.trim(),
      password,
      createdBy,
    };
    const updated = [...managedUsers, newUser];
    setManagedUsersState(updated);
    saveManagedUsers(updated);
    return null;
  };

  const editManagedUser = (id: string, username: string, password: string): string | null => {
    if (!username.trim() || !password.trim()) return "Username and password are required.";
    const lc = username.toLowerCase().trim();
    const taken = [...DEMO_USERS, ...managedUsers].some(
      (u) => u.username.toLowerCase() === lc && u.id !== id
    ) || lc === "admin";
    if (taken) return "Username already taken.";
    const updated = managedUsers.map((u) =>
      u.id === id ? { ...u, username: username.trim(), password } : u
    );
    setManagedUsersState(updated);
    saveManagedUsers(updated);
    return null;
  };

  const deleteManagedUser = (id: string) => {
    const updated = managedUsers.filter((u) => u.id !== id);
    setManagedUsersState(updated);
    saveManagedUsers(updated);
    // Remove their votes
    if (votedFor[id]) {
      const newVotedFor = { ...votedFor };
      const candidateId = newVotedFor[id];
      delete newVotedFor[id];
      setVotedFor(newVotedFor);
      localStorage.setItem("voteapp_votes", JSON.stringify(newVotedFor));
      // Deduct that vote
      const updatedCandidates = candidates.map((c) =>
        c.id === candidateId ? { ...c, votes: Math.max(0, c.votes - 1) } : c
      );
      setCandidates(updatedCandidates);
    }
  };

  const findUser = (username: string, password: string): ManagedUser | null => {
    const lc = username.toLowerCase().trim();
    const demo = DEMO_USERS.find((u) => u.username.toLowerCase() === lc && u.password === password);
    if (demo) return demo;
    const managed = managedUsers.find((u) => u.username.toLowerCase() === lc && u.password === password);
    return managed || null;
  };

  return (
    <AppContext.Provider
      value={{
        candidates,
        setCandidates,
        currentUser,
        setCurrentUser,
        logout,
        background,
        setBackground,
        votedFor,
        castVote,
        resetVotes,
        totalVotes,
        voteEndTime,
        setVoteTimer,
        voteExpired,
        managedUsers,
        addManagedUser,
        editManagedUser,
        deleteManagedUser,
        findUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export const CANDIDATE_COLORS = COLORS;
export { DEMO_USERS };