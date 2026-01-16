// 牌の種類
export type TileSuit = 'man' | 'pin' | 'sou' | 'honor';

// 字牌の種類
export type HonorType = 'ton' | 'nan' | 'sha' | 'pei' | 'haku' | 'hatsu' | 'chun';

// 牌
export interface Tile {
  suit: TileSuit;
  value: number; // 数牌: 1-9, 字牌: 1-7 (東南西北白發中)
  honorType?: HonorType;
}

// 面子の種類
export type MentsuType = 'shuntsu' | 'koutsu' | 'kantsu';

// 面子
export interface Mentsu {
  type: MentsuType;
  tiles: Tile[];
  isOpen: boolean; // 副露しているかどうか
}

// 雀頭
export interface Jantou {
  tiles: [Tile, Tile];
}

// 待ちの種類
export type WaitType = 'ryanmen' | 'kanchan' | 'penchan' | 'shanpon' | 'tanki';

// 和了方法
export type WinType = 'tsumo' | 'ron';

// 親子
export type PlayerType = 'oya' | 'ko';

// 難易度
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// 問題（基本型）
export interface Problem {
  mentsu: Mentsu[]; // 4つの面子
  jantou: Jantou; // 雀頭
  winType: WinType; // ツモ/ロン
  playerType: PlayerType; // 親/子
  waitType: WaitType; // 待ちの種類
  winningTile: Tile; // 和了牌
  han: number; // 翻数
  isMenzen: boolean; // 門前かどうか
  seatWind: number; // 自風 (1=東, 2=南, 3=西, 4=北)
  roundWind: number; // 場風 (1=東, 2=南)
  doraIndicators: Tile[]; // ドラ表示牌（1〜3枚）
}

// 七対子の問題（通常の面子構成とは異なる）
export interface ChiitoitsuProblem extends Problem {
  isChiitoitsu: true;
  toitsu: Tile[][]; // 7つの対子
}

// 型ガード: 七対子かどうかを判定
export function isChiitoitsuProblem(problem: Problem): problem is ChiitoitsuProblem {
  return 'isChiitoitsu' in problem && (problem as ChiitoitsuProblem).isChiitoitsu === true;
}

// 符の内訳
export interface FuBreakdown {
  base: number; // 副底 (20)
  menzenRon: number; // 門前ロン加符 (10)
  tsumo: number; // ツモ符 (2)
  mentsuFu: { mentsu: Mentsu; fu: number }[]; // 各面子の符
  jantouFu: number; // 雀頭の符
  waitFu: number; // 待ちの符
  total: number; // 合計（切り上げ後）
}

// 点数結果
export interface ScoreResult {
  fu: number;
  han: number;
  basePoints: number;
  ronPoints?: number;
  tsumoPointsKo?: number;
  tsumoPointsOya?: number;
  limitName?: string; // 満貫、跳満など
}

// 学習ステップ
export type LearningStep = 'yaku' | 'fu' | 'score' | 'complete';

// 各ステップの回答状態
export interface StepAnswerState {
  yaku: {
    selectedYakuIds: string[];
    selectedDoraCount: number;
    isCorrect: boolean | null;
    submitted: boolean;
  };
  fu: {
    selectedFu: number | null;
    isCorrect: boolean | null;
    submitted: boolean;
    // 各項目の詳細
    details?: {
      agariMethodFu: { selected: number; correct: number; isCorrect: boolean };
      mentsuFu: { selected: number; correct: number; isCorrect: boolean }[];
      jantouFu: { selected: number; correct: number; isCorrect: boolean };
      waitFu: { selected: number; correct: number; isCorrect: boolean };
    };
  };
  score: {
    inputScore: number | null;
    isCorrect: boolean | null;
    submitted: boolean;
  };
}
