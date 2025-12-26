
import { MatchData } from "../types";

const STORAGE_KEY = 'esports_tracker_matches';

export const saveMatch = (match: MatchData) => {
  const matches = getMatches();
  // Prevent duplicate uploads if we have some sort of unique key, 
  // though for screenshots it's hard. Let's just append for now.
  matches.unshift(match);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
};

export const getMatches = (): MatchData[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const deleteMatch = (id: string) => {
  const matches = getMatches().filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
};
