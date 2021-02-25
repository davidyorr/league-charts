import axios, { AxiosInstance, AxiosResponse } from "axios";
import { IAxiosCacheAdapterOptions, setupCache } from "axios-cache-adapter";

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

export type MatchDto = {
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
  stats: ParticipantStatsDto;
  teamId: number;
  timeline: any;
  spell1Id: number;
  spell2Id: number;
  highestAchievedSeasonTier: string;
};

export type ParticipantStatsDto = {
  item0?: number;
  item1?: number;
  item2?: number;
  item3?: number;
  item4?: number;
  item5?: number;
  item6?: number;
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
  kills: number;
  assists: number;
  visionScore: number;
  perk0: number; // rune
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

// Data Dragon
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

export type ItemJson = {
  type: string;
  version: string;
  basic: any;
  data: {
    [id: number]: ItemDto;
  };
  groups: any[];
  tree: any[];
};

type ItemDto = {
  name: string;
  description: string;
  colloq: string; // ;
  plaintext: string;
  stacks: number;
  consumed: boolean;
  inStore: boolean;
  hideFromAll: boolean;
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  gold: {
    base: number;
    purchasable: boolean;
    sell: number;
    total: number;
  };
  tags: string[];
  maps: string;
  stats: Record<string, unknown>;
  effect: {
    Effect1Amount: string;
  };
};

export type SummonerSpellJson = {
  type: string;
  version: string;
  data: {
    [id: string]: SummonerSpellDto;
  };
};

type SummonerSpellDto = {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  maxrank: number;
  key: string;
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
};

type RuneResponse = Array<{
  // this is the tree (Domination, Inspiration, Precision, Resolve, Sorcery)
  // and the individual runes are in the "slots" property
  id: number;
  key: string; // name without spaces
  icon: string;
  // slots are basically the rows, and runes are the columns
  slots: Array<{
    runes: Array<RuneDto>;
  }>;
}>;

type RuneDto = {
  id: number;
  key: string;
  icon: string;
};

export type RuneMap = {
  [id: number]: RuneDto;
};

const X_RIOT_TOKEN_HEADER = "X-Riot-Token";

export class Api {
  #riotInstance: AxiosInstance;
  #dataDragonInstance: AxiosInstance;

  constructor(apiKey: string, cacheOptions?: IAxiosCacheAdapterOptions) {
    const cache = cacheOptions
      ? setupCache({
          exclude: {
            query: false,
          },
          ...cacheOptions,
        })
      : undefined;

    this.#riotInstance = axios.create({
      adapter: cache?.adapter,
      baseURL: "https://na1.api.riotgames.com/lol/",
      headers: {
        [X_RIOT_TOKEN_HEADER]: apiKey,
      },
    });
    this.#dataDragonInstance = axios.create({
      baseURL: "https://ddragon.leagueoflegends.com/",
    });
  }

  setRegion = (region: string): void => {
    this.#riotInstance.defaults.baseURL = `https://${region.toLowerCase()}.api.riotgames.com/lol/`;
  };

  dataDragonVersion = async (gameVersion: string): Promise<string> => {
    try {
      const versionsResponse = await this.#dataDragonInstance.get<string[]>(
        "api/versions.json"
      );

      const [major, minor] = gameVersion.split(".");

      const version = versionsResponse.data.find((version) => {
        const [bMajor, bMinor] = version.split(".");

        return major === bMajor && minor === bMinor;
      });

      if (version === undefined) {
        throw new Error(
          `error finding data dragon version for game version ${major}.${minor}`
        );
      }

      return version;
    } catch (err) {
      console.log("error fetching data dragon versions", err);
      throw err;
    }
  };

  champions = (
    dataDragonVersion: string
  ): Promise<AxiosResponse<ChampionMap>> => {
    return this.#dataDragonInstance.get<ChampionMap>(
      `cdn/${dataDragonVersion}/data/en_US/champion.json`,
      {
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

  championImageSpriteSheetUrl = (
    dataDragonVersion: string,
    id: string
  ): string => {
    return `${
      this.#dataDragonInstance.defaults.baseURL
    }cdn/${dataDragonVersion}/img/sprite/${id}`;
  };

  championImageUrl = (dataDragonVersion: string, imageName: string): string => {
    return `${
      this.#dataDragonInstance.defaults.baseURL
    }cdn/${dataDragonVersion}/img/champion/${imageName}`;
  };

  items = (dataDragonVersion: string): Promise<AxiosResponse<ItemJson>> => {
    return this.#dataDragonInstance.get<ItemJson>(
      `cdn/${dataDragonVersion}/data/en_US/item.json`,
      {
        transformResponse: (data: string | undefined) => {
          if (data) {
            const itemJson: ItemJson = JSON.parse(data);

            return itemJson;
          }

          return data;
        },
      }
    );
  };

  itemSpriteSheetUrl = (dataDragonVersion: string, id: string): string => {
    return `${
      this.#dataDragonInstance.defaults.baseURL
    }cdn/${dataDragonVersion}/img/sprite/${id}`;
  };

  summonerSpells = (
    dataDragonVersion: string
  ): Promise<AxiosResponse<SummonerSpellJson>> => {
    return this.#dataDragonInstance.get<SummonerSpellJson>(
      `cdn/${dataDragonVersion}/data/en_US/summoner.json`,
      {
        transformResponse: (data: string | undefined) => {
          if (data) {
            const summonerSpellJson: SummonerSpellJson = JSON.parse(data);
            const remappedData: SummonerSpellJson["data"] = {};

            Object.values(summonerSpellJson.data).forEach(
              (summonerSpellDto) => {
                remappedData[summonerSpellDto.key] = summonerSpellDto;
              }
            );

            summonerSpellJson.data = remappedData;
            return summonerSpellJson;
          }

          return data;
        },
      }
    );
  };

  summonerSpellSpriteSheetUrl = (
    dataDragonVersion: string,
    id: string
  ): string => {
    return `${
      this.#dataDragonInstance.defaults.baseURL
    }cdn/${dataDragonVersion}/img/sprite/${id}`;
  };

  runes = (dataDragonVersion: string): Promise<AxiosResponse<RuneMap>> => {
    return this.#dataDragonInstance.get<RuneMap>(
      `cdn/${dataDragonVersion}/data/en_US/runesReforged.json`,
      {
        transformResponse: (data: string | undefined) => {
          if (data) {
            const runeResponse: RuneResponse = JSON.parse(data);
            const runeMap: RuneMap = {};

            runeResponse.forEach((tree) => {
              tree.slots.forEach((runeRow) => {
                runeRow.runes.forEach((rune) => {
                  runeMap[rune.id] = rune;
                });
              });
            });

            return runeMap;
          }

          return data;
        },
      }
    );
  };

  runeImageUrl = (imagePath: string): string => {
    return `${this.#dataDragonInstance.defaults.baseURL}cdn/img/${imagePath}`;
  };

  summoner = {
    byName: (summonerName: string): Promise<AxiosResponse<SummonerDto>> => {
      return this.#riotInstance.get<SummonerDto>(
        `summoner/v4/summoners/by-name/${encodeURI(summonerName)}`
      );
    },
  };

  match = {
    byMatchId: (matchId: number): Promise<AxiosResponse<MatchDto>> => {
      return this.#riotInstance.get<MatchDto>(`match/v4/matches/${matchId}`);
    },
  };

  matchList = {
    byAccountId: (accountId: string): Promise<AxiosResponse<MatchListDto>> => {
      return this.#riotInstance.get<MatchListDto>(
        `match/v4/matchlists/by-account/${accountId}?endIndex=1`
      );
    },
  };

  timeline = {
    byMatchId: (matchId: number): Promise<AxiosResponse<MatchTimelineDto>> => {
      return this.#riotInstance.get<MatchTimelineDto>(
        `match/v4/timelines/by-match/${matchId}?endIndex=1`
      );
    },
  };
}
