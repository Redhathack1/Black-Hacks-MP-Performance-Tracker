
import { MatchData } from "../types";
import * as XLSX from "xlsx";

export const exportMatchesToExcel = (matches: MatchData[], reportLabel: string = "Recon_Intel") => {
  if (matches.length === 0) return;

  // 1. SQUAD PERFORMANCE AGGREGATION
  const playerAggr: Record<string, {
    matches: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    totalImpact: number;
  }> = {};

  // 2. MAP & MODE CROSS-ANALYSIS
  const mapModeAggr: Record<string, {
    matches: number;
    wins: number;
    totalKills: number;
    totalDeaths: number;
    totalImpact: number;
  }> = {};

  // 3. MODE EFFICIENCY
  const modeAggr: Record<string, {
    matches: number;
    wins: number;
  }> = {};

  // 4. INDIVIDUAL MASTERY
  const masteryAggr: Record<string, {
    matches: number;
    wins: number;
    totalKills: number;
    totalDeaths: number;
    totalImpact: number;
  }> = {};

  matches.forEach(m => {
    const mapModeKey = `${m.map} | ${m.mode}`;
    
    // Process Map/Mode Cross
    if (!mapModeAggr[mapModeKey]) {
      mapModeAggr[mapModeKey] = { matches: 0, wins: 0, totalKills: 0, totalDeaths: 0, totalImpact: 0 };
    }
    mapModeAggr[mapModeKey].matches += 1;
    if (m.result === 'VICTORY') mapModeAggr[mapModeKey].wins += 1;

    // Process Mode
    if (!modeAggr[m.mode]) {
      modeAggr[m.mode] = { matches: 0, wins: 0 };
    }
    modeAggr[m.mode].matches += 1;
    if (m.result === 'VICTORY') modeAggr[m.mode].wins += 1;

    // Process Team Players
    const teamPlayers = m.players.filter(p => p.isTeamMember);
    teamPlayers.forEach(p => {
      // Player-level total stats
      if (!playerAggr[p.name]) {
        playerAggr[p.name] = { matches: 0, totalKills: 0, totalDeaths: 0, totalAssists: 0, totalImpact: 0 };
      }
      playerAggr[p.name].matches += 1;
      playerAggr[p.name].totalKills += p.kills;
      playerAggr[p.name].totalDeaths += p.deaths;
      playerAggr[p.name].totalAssists += p.assists;
      playerAggr[p.name].totalImpact += p.impact;

      // Deep Mastery Key: PlayerName | Map | Mode
      const masterKey = `${p.name} >> ${m.map} (${m.mode})`;
      if (!masteryAggr[masterKey]) {
        masteryAggr[masterKey] = { matches: 0, wins: 0, totalKills: 0, totalDeaths: 0, totalImpact: 0 };
      }
      masteryAggr[masterKey].matches += 1;
      if (m.result === 'VICTORY') masteryAggr[masterKey].wins += 1;
      masteryAggr[masterKey].totalKills += p.kills;
      masteryAggr[masterKey].totalDeaths += p.deaths;
      masteryAggr[masterKey].totalImpact += p.impact;
    });
  });

  // Transform Squad Performance (Header requested: K/D and Impact)
  const squadData = Object.entries(playerAggr).map(([name, stats]) => {
    const deaths = Math.max(1, stats.totalDeaths);
    return {
      "Operator": name,
      "Matches": stats.matches,
      "K/D": Number((stats.totalKills / deaths).toFixed(2)),
      "Impact": Math.round(stats.totalImpact / stats.matches),
      "KDA": Number(((stats.totalKills + stats.totalAssists) / deaths).toFixed(2)),
      "Total Kills": stats.totalKills,
      "Total Deaths": stats.totalDeaths,
      "Total Assists": stats.totalAssists
    };
  }).sort((a, b) => b["Impact"] - a["Impact"]);

  // Map/Mode Intel
  const mapModeData = Object.entries(mapModeAggr).map(([key, stats]) => {
    const [map, mode] = key.split(' | ');
    return {
      "Map": map,
      "Mode": mode,
      "Deployments": stats.matches,
      "Win Rate %": `${Math.round((stats.wins / stats.matches) * 100)}%`,
      "Avg K/D": Number((stats.totalKills / Math.max(1, stats.totalDeaths)).toFixed(2))
    };
  }).sort((a, b) => parseInt(b["Win Rate %"]) - parseInt(a["Win Rate %"]));

  // Mode Efficiency
  const modeData = Object.entries(modeAggr).map(([mode, stats]) => ({
    "Game Mode": mode,
    "Deployments": stats.matches,
    "Win Rate %": `${Math.round((stats.wins / stats.matches) * 100)}%`,
    "Wins": stats.wins,
    "Losses": stats.matches - stats.wins
  })).sort((a, b) => parseInt(b["Win Rate %"]) - parseInt(a["Win Rate %"]));

  // Mastery
  const masterData = Object.entries(masteryAggr).map(([key, stats]) => {
    const [name, loc] = key.split(' >> ');
    return {
      "Operator": name,
      "Environment": loc,
      "Matches": stats.matches,
      "Win Rate %": `${Math.round((stats.wins / stats.matches) * 100)}%`,
      "Avg K/D": Number((stats.totalKills / Math.max(1, stats.totalDeaths)).toFixed(2)),
      "Avg Impact": Math.round(stats.totalImpact / stats.matches)
    };
  }).sort((a, b) => a.Operator.localeCompare(b.Operator));

  // Create Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(squadData), "Squad Performance");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(mapModeData), "Map-Mode Intel");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(modeData), "Mode Efficiency");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(masterData), "Individual Mastery");

  // Dynamic Filename Formatting
  const safeLabel = reportLabel.replace(/\s+/g, '_');
  XLSX.writeFile(workbook, `${safeLabel}.xlsx`);
};
