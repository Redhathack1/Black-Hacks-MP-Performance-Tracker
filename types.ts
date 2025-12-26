
export interface PlayerPerformance {
  name: string;
  score: number;
  kills: number;
  deaths: number;
  assists: number;
  time: string; // MM:SS
  impact: number;
  isTeamMember: boolean;
}

export interface MatchData {
  id: string;
  date: string;
  timestamp: number;
  map: string;
  mode: string;
  result: 'VICTORY' | 'DEFEAT' | 'DRAW';
  scoreline: string;
  players: PlayerPerformance[];
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  MATCHES = 'MATCHES',
  PLAYERS = 'PLAYERS',
  UPLOAD = 'UPLOAD',
  COLLATION = 'COLLATION'
}

export interface PlayerAggregateStats {
  name: string;
  matches: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  totalScore: number;
  totalImpact: number;
  avgKd: number;
  avgKda: number;
  avgScore: number;
  avgImpact: number;
  killsPerMatch: number;
}
