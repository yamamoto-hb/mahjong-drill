import { Problem, FuBreakdown, Mentsu, Jantou, WaitType, isChiitoitsuProblem } from './types';
import { isYaochuhai, isYakuhai, isDoubleWind } from './tiles';

// 面子の符を計算
function calculateMentsuFu(mentsu: Mentsu): number {
  const baseTile = mentsu.tiles[0];
  const isYaochu = isYaochuhai(baseTile);

  switch (mentsu.type) {
    case 'shuntsu':
      // 順子は0符
      return 0;

    case 'koutsu':
      // 刻子
      if (mentsu.isOpen) {
        // 明刻: 中張牌2符、么九牌4符
        return isYaochu ? 4 : 2;
      } else {
        // 暗刻: 中張牌4符、么九牌8符
        return isYaochu ? 8 : 4;
      }

    case 'kantsu':
      // 槓子
      if (mentsu.isOpen) {
        // 明槓: 中張牌8符、么九牌16符
        return isYaochu ? 16 : 8;
      } else {
        // 暗槓: 中張牌16符、么九牌32符
        return isYaochu ? 32 : 16;
      }

    default:
      return 0;
  }
}

// 雀頭の符を計算
function calculateJantouFu(jantou: Jantou, seatWind: number, roundWind: number): number {
  const tile = jantou.tiles[0];

  // 連風牌（自風と場風が同じ）: 4符
  if (isDoubleWind(tile, seatWind, roundWind)) {
    return 4;
  }

  // 役牌: 2符
  if (isYakuhai(tile, seatWind, roundWind)) {
    return 2;
  }

  return 0;
}

// 待ちの符を計算
function calculateWaitFu(waitType: WaitType): number {
  switch (waitType) {
    case 'kanchan': // カンチャン待ち
    case 'penchan': // ペンチャン待ち
    case 'tanki': // 単騎待ち
      return 2;
    case 'ryanmen': // 両面待ち
    case 'shanpon': // シャンポン待ち
      return 0;
    default:
      return 0;
  }
}

// 平和形かどうかをチェック
export function isPinfu(problem: Problem): boolean {
  // 門前でない場合は平和ではない
  if (!problem.isMenzen) return false;

  // 全て順子である必要がある
  const allShuntsu = problem.mentsu.every((m) => m.type === 'shuntsu');
  if (!allShuntsu) return false;

  // 雀頭が役牌でない
  const jantouTile = problem.jantou.tiles[0];
  if (isYakuhai(jantouTile, problem.seatWind, problem.roundWind)) return false;

  // 両面待ち
  if (problem.waitType !== 'ryanmen') return false;

  return true;
}

// 七対子かどうかを判定（型ガードを使用）
function isChiitoitsu(problem: Problem): boolean {
  return isChiitoitsuProblem(problem);
}

// 符計算のメイン関数
export function calculateFu(problem: Problem): FuBreakdown {
  const breakdown: FuBreakdown = {
    base: 20, // 副底
    menzenRon: 0,
    tsumo: 0,
    mentsuFu: [],
    jantouFu: 0,
    waitFu: 0,
    total: 0,
  };

  // 七対子は25符固定
  if (isChiitoitsu(problem)) {
    breakdown.total = 25;
    return breakdown;
  }

  // 平和形の特殊処理
  if (isPinfu(problem)) {
    // 平和の場合も面子・雀頭・待ちの符は計算する（学習のため）
    for (const mentsu of problem.mentsu) {
      const fu = calculateMentsuFu(mentsu);
      breakdown.mentsuFu.push({ mentsu, fu });
    }
    breakdown.jantouFu = calculateJantouFu(problem.jantou, problem.seatWind, problem.roundWind);
    breakdown.waitFu = calculateWaitFu(problem.waitType);

    if (problem.winType === 'tsumo') {
      // 平和ツモは20符固定（ツモ符2符がつかない）
      breakdown.total = 20;
      return breakdown;
    } else {
      // 平和ロンは30符固定（門前ロン10符がつかない）
      breakdown.total = 30;
      return breakdown;
    }
  }

  // 門前ロン加符
  if (problem.isMenzen && problem.winType === 'ron') {
    breakdown.menzenRon = 10;
  }

  // ツモ符（門前ツモ）
  if (problem.winType === 'tsumo') {
    breakdown.tsumo = 2;
  }

  // 各面子の符
  for (const mentsu of problem.mentsu) {
    const fu = calculateMentsuFu(mentsu);
    breakdown.mentsuFu.push({ mentsu, fu });
  }

  // 雀頭の符
  breakdown.jantouFu = calculateJantouFu(problem.jantou, problem.seatWind, problem.roundWind);

  // 待ちの符
  breakdown.waitFu = calculateWaitFu(problem.waitType);

  // 合計
  let total = breakdown.base
    + breakdown.menzenRon
    + breakdown.tsumo
    + breakdown.mentsuFu.reduce((sum, m) => sum + m.fu, 0)
    + breakdown.jantouFu
    + breakdown.waitFu;

  // 喰い平和形（副露あり、面子が全て順子、20符）は30符に繰り上げ
  if (!problem.isMenzen && total === 20) {
    total = 30;
  }

  // 10符未満切り上げ
  breakdown.total = Math.ceil(total / 10) * 10;

  return breakdown;
}

// 符の内訳を日本語で説明
export function getFuBreakdownDescription(breakdown: FuBreakdown, isPinfuHand?: boolean, winType?: 'ron' | 'tsumo'): string[] {
  const descriptions: string[] = [];

  // 平和の場合は特別な説明
  if (isPinfuHand) {
    if (winType === 'tsumo') {
      descriptions.push('平和ツモ: 20符固定');
      return descriptions;
    } else {
      descriptions.push('平和ロン: 30符固定');
      descriptions.push('（門前ロン10符がつかない）');
      return descriptions;
    }
  }

  descriptions.push(`副底: ${breakdown.base}符`);

  if (breakdown.menzenRon > 0) {
    descriptions.push(`門前ロン: ${breakdown.menzenRon}符`);
  }

  if (breakdown.tsumo > 0) {
    descriptions.push(`ツモ: ${breakdown.tsumo}符`);
  }

  for (const { mentsu, fu } of breakdown.mentsuFu) {
    if (fu > 0) {
      const mentsuTypeName = {
        shuntsu: '順子',
        koutsu: mentsu.isOpen ? '明刻' : '暗刻',
        kantsu: mentsu.isOpen ? '明槓' : '暗槓',
      }[mentsu.type];
      descriptions.push(`${mentsuTypeName}: ${fu}符`);
    }
  }

  if (breakdown.jantouFu > 0) {
    descriptions.push(`雀頭: ${breakdown.jantouFu}符`);
  }

  if (breakdown.waitFu > 0) {
    descriptions.push(`待ち: ${breakdown.waitFu}符`);
  }

  // 切り上げ前の小計を計算
  const rawTotal = breakdown.base
    + breakdown.menzenRon
    + breakdown.tsumo
    + breakdown.mentsuFu.reduce((sum, m) => sum + m.fu, 0)
    + breakdown.jantouFu
    + breakdown.waitFu;

  // 小計と切り上げ後が異なる場合は両方表示
  if (rawTotal !== breakdown.total && rawTotal > 0) {
    descriptions.push(`小計: ${rawTotal}符`);
    descriptions.push(`切り上げ: ${breakdown.total}符`);
  } else {
    descriptions.push(`合計: ${breakdown.total}符`);
  }

  return descriptions;
}
