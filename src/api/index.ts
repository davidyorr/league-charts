import axios, { AxiosInstance, AxiosResponse } from "axios";

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

export type ParticipantStatsDto = {
  totalUnitsHealed: number;
  largestMultiKill: number;
  goldEarned: number;
  physicalDamageTaken: number;
  totalPlayerScore: number;
  champLevel: number;
  damageDealtToObjectives: number;
  totalDamageTaken: number;
  neutralMinionsKilled: number;
  deaths: number;
  tripleKills: number;
  magicDamageDealtToChampions: number;
  wardsKilled: number;
  pentaKills: number;
  damageSelfMitigated: number;
  largestCriticalStrike: number;
  totalTimeCrowdControlDealt: number;
  magicDamageDealt: number;
  wardsPlaced: number;
  totalDamageDealt: number;
  timeCCingOthers: number;
  largestKillingSpree: number;
  totalDamageDealtToChampions: number;
  physicalDamageDealtToChampions: number;
  neutralMinionsKilledTeamJungle: number;
  totalMinionsKilled: number;
  visionScore: number;
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

export type MatchParticipantFrameDto = {
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

// Data Dragon champion.json
// ----------------

type ChampionJson = {
  type: string;
  format: string;
  version: string;
  data: ChampionDto[];
};

type ChampionDto = {
  version: string;
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string;
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  tags: string[];
  partype: string;
  stats: any;
};

export type ChampionMap = {
  [index: string]: ChampionDto;
};

const X_RIOT_TOKEN_HEADER = "X-Riot-Token";

export class RiotApi {
  #instance: AxiosInstance;

  constructor(apiKey: string) {
    this.#instance = axios.create({
      baseURL: "https://na1.api.riotgames.com/lol/",
      headers: {
        [X_RIOT_TOKEN_HEADER]: apiKey,
      },
    });
  }

  dataDragonVersion = async (): Promise<string> => {
    let dataDragonVersion = "11.2.1";

    try {
      const versionsResponse = await this.#instance.get<string[]>(
        "https://ddragon.leagueoflegends.com/api/versions.json",
        {
          transformRequest: (_, headers) => {
            delete headers[X_RIOT_TOKEN_HEADER];
          },
        }
      );
      dataDragonVersion = versionsResponse.data[0];
    } catch (err) {
      console.log("error fetching data dragon versions", err);
    }

    return dataDragonVersion;
  };

  champions = async (
    dataDragonVersion: string
  ): Promise<AxiosResponse<ChampionMap>> => {
    return this.#instance.get<ChampionMap>(
      `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/data/en_US/champion.json`,
      {
        transformRequest: (_, headers) => {
          delete headers[X_RIOT_TOKEN_HEADER];
        },
        transformResponse: (data: string | undefined) => {
          if (data) {
            const championJson: ChampionJson = JSON.parse(data);
            const championMap: ChampionMap = {};

            Object.values(championJson.data).forEach((championDto) => {
              championMap[championDto.key] = championDto;
            });

            return championMap;
          }

          return data;
        },
      }
    );
  };

  championImageUrl = async (
    dataDragonVersion: string,
    imageName: string
  ): Promise<string> => {
    return `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${imageName}`;
  };

  summoner = {
    byName: (summonerName: string): Promise<AxiosResponse<SummonerDto>> => {
      return this.#instance.get<SummonerDto>(
        `summoner/v4/summoners/by-name/${summonerName}`
      );
    },
  };

  match = {
    byMatchId: (matchId: number): Promise<AxiosResponse<MatchDto>> => {
      return this.#instance.get<MatchDto>(`match/v4/matches/${matchId}`);
    },
  };

  matchList = {
    byAccountId: (accountId: string): Promise<AxiosResponse<MatchListDto>> => {
      return this.#instance.get<MatchListDto>(
        `match/v4/matchlists/by-account/${accountId}?endIndex=1`
      );
    },
  };

  timeline = {
    byMatchId: (matchId: number): Promise<AxiosResponse<MatchTimelineDto>> => {
      return this.#instance.get<MatchTimelineDto>(
        `match/v4/timelines/by-match/${matchId}?endIndex=1`
      );
    },
  };
}
