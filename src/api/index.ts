import axios from "axios";
import { DEV_TOKEN } from "../token.dev";

const instance = axios.create({
  baseURL: "https://na1.api.riotgames.com/lol/",
  headers: {
    "X-Riot-Token": DEV_TOKEN,
  },
});

// Summoner
// ----------------

type SummonerDto = {
  accountId: string;
  profileIconId: number;
  revisionDate: number;
  name: string;
  id: string;
  puuid: string;
  summonerLevel: number;
};

const summoner = {
  byName: (summonerName: string) => {
    return instance.get<SummonerDto>(
      `summoner/v4/summoners/by-name/${summonerName}`
    );
  },
};

// Match
// ----------------

type MatchDto = {
  gameId: number;
  participantIdentities: ParticipantIdentityDto[];
  queueId: number;
  gameType: string;
  gameDuration: number;
  teams: any;
  platformId: string;
  gameCreation: number;
  seasonId: number;
  gameVersion: string;
  MapId: number;
  gameMode: string;
  participants: ParticipantDto[];
};

type ParticipantIdentityDto = {
  participantId: number;
  player: PlayerDto;
};

type PlayerDto = {
  profileIcon: number;
  accountId: string;
  matchHistoryUri: string;
  currentAccountId: string;
  currentPlatformId: string;
  summonerName: string;
  summonerId: string;
  platformId: string;
};

type ParticipantDto = {
  participantId: number;
  championId: number;
  runes: any[];
  stats: ParticipantStatsDto;
  teamId: number;
  timeline: any;
  spell1Id: number;
  spell2Id: number;
  highestAchievedSeasonTier: string;
  masteries: any[];
};

type ParticipantStatsDto = {
  goldEarned: number;
  totalDamageDealtToChampions: number;
};

const match = {
  byMatchId: (matchId: number) => {
    return instance.get<MatchDto>(`match/v4/matches/${matchId}`);
  },
};

// Match List
// ----------------

type MatchReferenceDto = {
  gameId: number;
  role: string;
  season: number;
  platformId: string;
  champion: number;
  queue: number;
  lane: string;
  timestamp: number;
};

type MatchListDto = {
  startIndex: number;
  totalGames: number;
  endIndex: number;
  matches: MatchReferenceDto[];
};

const matchList = {
  byAccountId: (accountId: string) => {
    return instance.get<MatchListDto>(
      `match/v4/matchlists/by-account/${accountId}?endIndex=1`
    );
  },
};

// Timelines
// ----------------

type MatchTimelineDto = {
  frames: MatchFrameDto[];
  frameInterval: number;
};

type MatchFrameDto = {
  participantFrames: {
    [key: string]: MatchParticipantFrameDto; // the keys are just the numbers 1-10
  };
  events: MatchEventDto[];
  timestamp: number;
};

type MatchParticipantFrameDto = {
  participantId: number;
  minionsKilled: number;
  teamScore: number;
  dominionScore: number;
  totalGold: number;
  level: number;
  xp: number;
  currentGold: number;
  position: MatchPositionDto;
  jungleMinionsKilled: number;
};

type MatchPositionDto = {
  x: number;
  y: number;
};

type MatchEventDto = {
  laneType: string;
  skillSlot: number;
  ascendedType: string;
  creatorId: number;
  afterId: number;
  eventType: string;
  type:
    | "CHAMPION_KILL"
    | "WARD_PLACED"
    | "WARD_KILL"
    | "BUILDING_KILL"
    | "ELITE_MONSTER_KILL"
    | "ITEM_PURCHASED"
    | "ITEM_SOLD"
    | "ITEM_DESTROYED"
    | "ITEM_SOLD"
    | "ITEM_UNDO"
    | "SKILL_LEVEL_UP"
    | "ASCENDED_EVENT"
    | "CAPTURE_POINT"
    | "PORO_KING_SUMMON";
  levelUpType: string;
  wardType: string;
  participantId: number;
  towerType: string;
  itemId: number;
  beforeId: number;
  pointCaptured: string;
  monsterSubType: string;
  teamId: number;
  position: MatchPositionDto;
  killerId: number;
  timestamp: number;
  assistingParticipantIds: number[];
  buildingType: string;
  victimId: number;
};

const timeline = {
  byMatchId: (matchId: number) => {
    return instance.get<MatchTimelineDto>(
      `match/v4/timelines/by-match/${matchId}?endIndex=1`
    );
  },
};

export const api = {
  summoner,
  match,
  matchList,
  timeline,
};
