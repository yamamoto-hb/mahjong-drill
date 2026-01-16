import { Problem, ScoreResult, PlayerType, WinType } from './types';
import { calculateFu } from './fu-calculator';

// 満貫以上の点数テーブル
const LIMIT_SCORES = {
  mangan: { ko_ron: 8000, oya_ron: 12000, ko_tsumo_ko: 2000, ko_tsumo_oya: 4000, oya_tsumo: 4000 },
  haneman: { ko_ron: 12000, oya_ron: 18000, ko_tsumo_ko: 3000, ko_tsumo_oya: 6000, oya_tsumo: 6000 },
  baiman: { ko_ron: 16000, oya_ron: 24000, ko_tsumo_ko: 4000, ko_tsumo_oya: 8000, oya_tsumo: 8000 },
  sanbaiman: { ko_ron: 24000, oya_ron: 36000, ko_tsumo_ko: 6000, ko_tsumo_oya: 12000, oya_tsumo: 12000 },
  yakuman: { ko_ron: 32000, oya_ron: 48000, ko_tsumo_ko: 8000, ko_tsumo_oya: 16000, oya_tsumo: 16000 },
};

// 100点未満切り上げ
function roundUp100(value: number): number {
  return Math.ceil(value / 100) * 100;
}

// 満貫以上かどうかをチェックし、該当する点数を返す
function checkLimit(fu: number, han: number): { limitName: string; scores: typeof LIMIT_SCORES.mangan } | null {
  // 役満（13翻以上）
  if (han >= 13) {
    return { limitName: '役満', scores: LIMIT_SCORES.yakuman };
  }

  // 三倍満（11-12翻）
  if (han >= 11) {
    return { limitName: '三倍満', scores: LIMIT_SCORES.sanbaiman };
  }

  // 倍満（8-10翻）
  if (han >= 8) {
    return { limitName: '倍満', scores: LIMIT_SCORES.baiman };
  }

  // 跳満（6-7翻）
  if (han >= 6) {
    return { limitName: '跳満', scores: LIMIT_SCORES.haneman };
  }

  // 満貫（5翻）
  if (han >= 5) {
    return { limitName: '満貫', scores: LIMIT_SCORES.mangan };
  }

  // 満貫（4翻40符以上、3翻70符以上）
  if (han === 4 && fu >= 40) {
    return { limitName: '満貫', scores: LIMIT_SCORES.mangan };
  }
  if (han === 3 && fu >= 70) {
    return { limitName: '満貫', scores: LIMIT_SCORES.mangan };
  }

  return null;
}

// 基本点を計算
function calculateBasePoints(fu: number, han: number): number {
  return fu * Math.pow(2, han + 2);
}

// 点数計算のメイン関数
export function calculateScore(problem: Problem): ScoreResult {
  const fuBreakdown = calculateFu(problem);
  const fu = fuBreakdown.total;
  const han = problem.han;

  const result: ScoreResult = {
    fu,
    han,
    basePoints: 0,
  };

  // 満貫以上のチェック
  const limit = checkLimit(fu, han);

  if (limit) {
    result.limitName = limit.limitName;

    if (problem.winType === 'ron') {
      if (problem.playerType === 'oya') {
        result.ronPoints = limit.scores.oya_ron;
      } else {
        result.ronPoints = limit.scores.ko_ron;
      }
    } else {
      // ツモ
      if (problem.playerType === 'oya') {
        result.tsumoPointsKo = limit.scores.oya_tsumo;
      } else {
        result.tsumoPointsKo = limit.scores.ko_tsumo_ko;
        result.tsumoPointsOya = limit.scores.ko_tsumo_oya;
      }
    }

    result.basePoints = calculateBasePoints(fu, han);
    return result;
  }

  // 通常の点数計算
  const basePoints = calculateBasePoints(fu, han);
  result.basePoints = basePoints;

  if (problem.winType === 'ron') {
    if (problem.playerType === 'oya') {
      // 親のロン: 基本点 × 6
      result.ronPoints = roundUp100(basePoints * 6);
    } else {
      // 子のロン: 基本点 × 4
      result.ronPoints = roundUp100(basePoints * 4);
    }
  } else {
    // ツモ
    if (problem.playerType === 'oya') {
      // 親のツモ: 全員から基本点 × 2
      result.tsumoPointsKo = roundUp100(basePoints * 2);
    } else {
      // 子のツモ: 子から基本点、親から基本点 × 2
      result.tsumoPointsKo = roundUp100(basePoints);
      result.tsumoPointsOya = roundUp100(basePoints * 2);
    }
  }

  return result;
}

// 点数を文字列で表現
export function formatScore(result: ScoreResult, playerType: PlayerType, winType: WinType): string {
  if (winType === 'ron') {
    return `${result.ronPoints?.toLocaleString()}点`;
  } else {
    if (playerType === 'oya') {
      return `${result.tsumoPointsKo?.toLocaleString()}点オール`;
    } else {
      return `${result.tsumoPointsKo?.toLocaleString()}/${result.tsumoPointsOya?.toLocaleString()}点`;
    }
  }
}

// ツモの合計点を計算（回答チェック用）
export function getTsumoTotal(result: ScoreResult, playerType: PlayerType): number {
  if (playerType === 'oya') {
    // 親: 子3人から同額
    return (result.tsumoPointsKo || 0) * 3;
  } else {
    // 子: 子2人 + 親1人
    return (result.tsumoPointsKo || 0) * 2 + (result.tsumoPointsOya || 0);
  }
}
