import {
  Problem,
  ChiitoitsuProblem,
  Mentsu,
  Jantou,
  Tile,
  TileSuit,
  MentsuType,
  WaitType,
  WinType,
  PlayerType,
  Difficulty,
} from './types';
import { createTile } from './tiles';
import { calculateYaku } from './yaku-calculator';
import { YakuResult } from './yaku-types';

// 難易度別設定
const DIFFICULTY_SETTINGS = {
  beginner: {
    kantsuRate: 0,
    honorRate: 0.1,
    openRate: 0.3,
    maxHan: 4,
  },
  intermediate: {
    kantsuRate: 0.15,
    honorRate: 0.25,
    openRate: 0.4,
    maxHan: 6,
  },
  advanced: {
    kantsuRate: 0.25,
    honorRate: 0.35,
    openRate: 0.5,
    maxHan: 8,
  },
};

// 牌の使用枚数を管理するクラス
class TileCounter {
  private counts: Map<string, number> = new Map();

  private getKey(tile: Tile): string {
    return `${tile.suit}-${tile.value}`;
  }

  getCount(tile: Tile): number {
    return this.counts.get(this.getKey(tile)) || 0;
  }

  canUse(tile: Tile, count: number): boolean {
    return this.getCount(tile) + count <= 4;
  }

  use(tile: Tile, count: number): void {
    const key = this.getKey(tile);
    this.counts.set(key, (this.counts.get(key) || 0) + count);
  }
}

// ランダムな整数を生成
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ランダムに要素を選択
function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// 確率でtrue/falseを返す
function randomBool(probability: number): boolean {
  return Math.random() < probability;
}

// 配列をシャッフル（Fisher-Yates）
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ランダムな数牌の種類を取得
function randomNumberSuit(): TileSuit {
  return randomChoice(['man', 'pin', 'sou']);
}

// ランダムなドラ表示牌を1枚生成（counter使用）
function generateSingleDoraIndicator(counter: TileCounter): Tile {
  // 最大20回試行
  for (let attempt = 0; attempt < 20; attempt++) {
    let tile: Tile;
    if (randomBool(0.7)) {
      tile = createTile(randomNumberSuit(), randomInt(1, 9));
    } else {
      tile = createTile('honor', randomInt(1, 7));
    }

    if (counter.canUse(tile, 1)) {
      counter.use(tile, 1);
      return tile;
    }
  }

  // 試行失敗時は使える牌を探す
  for (let suit of ['man', 'pin', 'sou'] as TileSuit[]) {
    for (let value = 1; value <= 9; value++) {
      const tile = createTile(suit, value);
      if (counter.canUse(tile, 1)) {
        counter.use(tile, 1);
        return tile;
      }
    }
  }

  // 最終手段
  return createTile('man', 1);
}

// ドラ表示牌の枚数を決定（カンがある場合は最低2枚）
function determineDoraCount(mentsu: Mentsu[]): number {
  const hasKantsu = mentsu.some(m => m.type === 'kantsu');

  if (hasKantsu) {
    // カンがある場合は2〜3枚（1:1の割合）
    return randomBool(0.5) ? 2 : 3;
  }

  // 通常: 1枚50%, 2枚25%, 3枚25%
  const rand = Math.random();
  if (rand < 0.5) return 1;
  if (rand < 0.75) return 2;
  return 3;
}

// ドラ表示牌を複数生成
function generateDoraIndicators(counter: TileCounter, mentsu: Mentsu[]): Tile[] {
  const count = determineDoraCount(mentsu);
  const indicators: Tile[] = [];

  for (let i = 0; i < count; i++) {
    indicators.push(generateSingleDoraIndicator(counter));
  }

  return indicators;
}

// 順子を生成（牌の枚数をチェック）
function generateShuntsu(isOpen: boolean, counter: TileCounter): Mentsu | null {
  // 最大10回試行
  for (let attempt = 0; attempt < 10; attempt++) {
    const suit = randomNumberSuit();
    const startValue = randomInt(1, 7);

    const tiles = [
      createTile(suit, startValue),
      createTile(suit, startValue + 1),
      createTile(suit, startValue + 2),
    ];

    // すべての牌が使用可能かチェック
    if (tiles.every(t => counter.canUse(t, 1))) {
      tiles.forEach(t => counter.use(t, 1));
      return {
        type: 'shuntsu',
        tiles,
        isOpen,
      };
    }
  }
  return null;
}

// 刻子を生成（牌の枚数をチェック）
function generateKoutsu(useHonor: boolean, isOpen: boolean, counter: TileCounter): Mentsu | null {
  // 最大10回試行
  for (let attempt = 0; attempt < 10; attempt++) {
    const tile = useHonor
      ? createTile('honor', randomInt(1, 7))
      : createTile(randomNumberSuit(), randomInt(1, 9));

    if (counter.canUse(tile, 3)) {
      counter.use(tile, 3);
      return {
        type: 'koutsu',
        tiles: [tile, { ...tile }, { ...tile }],
        isOpen,
      };
    }
  }
  return null;
}

// 槓子を生成（牌の枚数をチェック）
function generateKantsu(useHonor: boolean, isOpen: boolean, counter: TileCounter): Mentsu | null {
  // 最大10回試行
  for (let attempt = 0; attempt < 10; attempt++) {
    const tile = useHonor
      ? createTile('honor', randomInt(1, 7))
      : createTile(randomNumberSuit(), randomInt(1, 9));

    if (counter.canUse(tile, 4)) {
      counter.use(tile, 4);
      return {
        type: 'kantsu',
        tiles: [tile, { ...tile }, { ...tile }, { ...tile }],
        isOpen,
      };
    }
  }
  return null;
}

// 雀頭を生成（牌の枚数をチェック）
function generateJantou(useHonor: boolean, counter: TileCounter): Jantou | null {
  // 最大10回試行
  for (let attempt = 0; attempt < 10; attempt++) {
    const tile = useHonor
      ? createTile('honor', randomInt(1, 7))
      : createTile(randomNumberSuit(), randomInt(1, 9));

    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      return {
        tiles: [tile, { ...tile }],
      };
    }
  }
  return null;
}

// 和了牌と待ちタイプを決定（面子構成から導出）
interface WinningTileResult {
  tile: Tile;
  waitType: WaitType;
}

// 順子内の位置から待ちタイプを判定
function getWaitTypeFromShuntsuPosition(startValue: number, position: number): WaitType {
  // position: 0 = 最初の牌, 1 = 真ん中の牌, 2 = 最後の牌
  if (position === 1) {
    return 'kanchan'; // 真ん中ならカンチャン
  }
  // 端の牌の場合
  if (position === 0) {
    // 789順子の7を待つ → ペンチャン
    if (startValue === 7) {
      return 'penchan';
    }
    // それ以外は両面
    return 'ryanmen';
  }
  // position === 2
  // 123順子の3を待つ → ペンチャン
  if (startValue === 1) {
    return 'penchan';
  }
  // それ以外は両面
  return 'ryanmen';
}

// 牌が副露の刻子・槓子に含まれているかチェック
function isInOpenKoutsuOrKantsu(tile: Tile, mentsu: Mentsu[]): boolean {
  for (const m of mentsu) {
    if (m.isOpen && (m.type === 'koutsu' || m.type === 'kantsu')) {
      if (m.tiles[0].suit === tile.suit && m.tiles[0].value === tile.value) {
        return true;
      }
    }
  }
  return false;
}

// 牌が副露の順子に含まれているかチェック
function isInOpenShuntsu(tile: Tile, mentsu: Mentsu[]): boolean {
  for (const m of mentsu) {
    if (m.isOpen && m.type === 'shuntsu') {
      for (const t of m.tiles) {
        if (t.suit === tile.suit && t.value === tile.value) {
          return true;
        }
      }
    }
  }
  return false;
}

// 和了牌がロンの制約に違反していないかチェック
function isValidRonTile(tile: Tile, mentsu: Mentsu[]): boolean {
  // 副露の刻子・槓子に同じ牌があってはいけない
  if (isInOpenKoutsuOrKantsu(tile, mentsu)) {
    return false;
  }
  // 副露の順子に同じ牌があってはいけない
  if (isInOpenShuntsu(tile, mentsu)) {
    return false;
  }
  return true;
}

// 和了牌と待ちタイプを決定（面子構成から導出）
function determineWinningTileAndWaitType(
  mentsu: Mentsu[],
  jantou: Jantou,
  winType: WinType,
  counter: TileCounter
): WinningTileResult {
  // 和了牌候補を収集（各候補に待ちタイプも付与）
  interface Candidate {
    tile: Tile;
    waitType: WaitType;
  }
  const candidates: Candidate[] = [];

  // 門前の順子から候補を収集
  for (const m of mentsu) {
    if (m.isOpen || m.type !== 'shuntsu') continue;
    const startValue = m.tiles[0].value;

    // 各位置の牌を候補として追加
    for (let pos = 0; pos < 3; pos++) {
      const tile = m.tiles[pos];
      const waitType = getWaitTypeFromShuntsuPosition(startValue, pos);
      candidates.push({ tile: { ...tile }, waitType });
    }
  }

  // 門前の刻子から候補を収集（シャンポン待ち）
  for (const m of mentsu) {
    if (m.isOpen || (m.type !== 'koutsu' && m.type !== 'kantsu')) continue;
    candidates.push({ tile: { ...m.tiles[0] }, waitType: 'shanpon' });
  }

  // 雀頭から候補を収集（単騎待ち）
  candidates.push({ tile: { ...jantou.tiles[0] }, waitType: 'tanki' });

  // シャッフルしてランダムに選ぶ
  shuffleArray(candidates);

  // 使用可能な候補を探す
  for (const candidate of candidates) {
    if (!counter.canUse(candidate.tile, 1)) continue;
    if (winType === 'ron' && !isValidRonTile(candidate.tile, mentsu)) continue;

    counter.use(candidate.tile, 1);
    return candidate;
  }

  // どの候補も使えない場合（ありえないはずだが）フォールバック
  // 門前の面子から使える牌を探す
  for (const m of mentsu) {
    if (m.isOpen) continue;
    for (let i = 0; i < m.tiles.length; i++) {
      const tile = m.tiles[i];
      if (!counter.canUse(tile, 1)) continue;
      if (winType === 'ron' && !isValidRonTile(tile, mentsu)) continue;

      counter.use(tile, 1);
      let waitType: WaitType = 'tanki';
      if (m.type === 'shuntsu') {
        waitType = getWaitTypeFromShuntsuPosition(m.tiles[0].value, i);
      } else if (m.type === 'koutsu' || m.type === 'kantsu') {
        waitType = 'shanpon';
      }
      return { tile: { ...tile }, waitType };
    }
  }

  // 雀頭から
  const jantouTile = jantou.tiles[0];
  if (counter.canUse(jantouTile, 1) && (winType !== 'ron' || isValidRonTile(jantouTile, mentsu))) {
    counter.use(jantouTile, 1);
    return { tile: { ...jantouTile }, waitType: 'tanki' };
  }

  // 最終手段（ありえないはずだが）
  return { tile: createTile('man', 1), waitType: 'tanki' };
}

// 面子タイプを決定
function determineMentsuType(useHonor: boolean, kantsuRate: number): MentsuType {
  if (useHonor) {
    return randomBool(kantsuRate) ? 'kantsu' : 'koutsu';
  }

  const rand = Math.random();
  if (rand < kantsuRate) {
    return 'kantsu';
  }
  if (rand < 0.6) {
    return 'shuntsu';
  }
  return 'koutsu';
}

// 標準的な面子を生成（失敗時にフォールバックを試行）
function generateStandardMentsu(
  useHonor: boolean,
  isOpen: boolean,
  mentsuType: MentsuType,
  counter: TileCounter
): Mentsu | null {
  let generated: Mentsu | null = null;

  switch (mentsuType) {
    case 'shuntsu':
      generated = generateShuntsu(isOpen, counter);
      break;
    case 'koutsu':
      generated = generateKoutsu(useHonor, isOpen, counter);
      break;
    case 'kantsu':
      generated = generateKantsu(useHonor, isOpen, counter);
      break;
  }

  // 生成に失敗したら順子を試す
  if (!generated) {
    generated = generateShuntsu(isOpen, counter);
  }
  // それでも失敗したら刻子を試す
  if (!generated) {
    generated = generateKoutsu(false, isOpen, counter);
  }

  return generated;
}

// 完成した手牌から問題を構築（役判定含む）
function createProblemFromHand(
  mentsu: Mentsu[],
  jantou: Jantou,
  counter: TileCounter
): Problem | null {
  // 門前かどうか
  const isMenzen = !mentsu.some(m => m.isOpen);

  // 各種条件を決定
  const winType: WinType = randomChoice(['tsumo', 'ron']);
  const playerType: PlayerType = randomBool(0.25) ? 'oya' : 'ko';

  // 和了牌と待ちタイプを面子構成から導出
  const { tile: winningTile, waitType } = determineWinningTileAndWaitType(
    mentsu,
    jantou,
    winType,
    counter
  );

  const roundWind = randomChoice([1, 2]);
  const seatWind = randomInt(1, 4);

  const tempProblem: Problem = {
    mentsu,
    jantou,
    winType,
    playerType,
    waitType,
    winningTile,
    han: 0,
    isMenzen,
    seatWind,
    roundWind,
    doraIndicators: generateDoraIndicators(counter, mentsu),
  };

  const yakuResult = calculateYaku(tempProblem);

  // 役がない場合（ドラのみ）は無効
  if (yakuResult.yakuList.length === 0) {
    return null;
  }

  // 役満（13翻以上）の場合は無効（初心者向けドリルでは対象外）
  if (yakuResult.totalHan >= 13) {
    return null;
  }

  const problem: Problem = {
    ...tempProblem,
    han: yakuResult.totalHan,
  };

  (problem as ProblemWithYaku).yakuResult = yakuResult;

  return problem as ProblemWithYaku;
}

// 問題を生成
// 出現率の低い役を強制生成する確率設定
const RARE_YAKU_RATES: { yakuId: string; rate: number }[] = [
  // 有名どころ（各5%）
  { yakuId: 'ittsu', rate: 0.05 },           // 一気通貫
  { yakuId: 'sanshoku_doujun', rate: 0.05 }, // 三色同順
  { yakuId: 'sanshoku_doukou', rate: 0.05 }, // 三色同刻
  { yakuId: 'ryanpeikou', rate: 0.05 },      // 二盃口
  // その他の出現率低い役（各2%）
  { yakuId: 'junchan', rate: 0.02 },         // 純全帯么九
  { yakuId: 'chanta', rate: 0.02 },          // 混全帯么九
  { yakuId: 'shousangen', rate: 0.02 },      // 小三元
  { yakuId: 'sankantsu', rate: 0.02 },       // 三槓子
  { yakuId: 'honroutou', rate: 0.01 },       // 混老頭
  { yakuId: 'chinitsu', rate: 0.01 },        // 清一色
];

const MAX_RETRY_COUNT = 10;

// 問題生成が失敗した場合のフォールバック問題（シンプルな平和形）
function createFallbackProblem(_difficulty: Difficulty): ProblemWithYaku {
  // シンプルな順子4つ + 数牌の雀頭（平和形）
  const mentsu: Mentsu[] = [
    { type: 'shuntsu', tiles: [{ suit: 'man', value: 1 }, { suit: 'man', value: 2 }, { suit: 'man', value: 3 }], isOpen: false },
    { type: 'shuntsu', tiles: [{ suit: 'man', value: 4 }, { suit: 'man', value: 5 }, { suit: 'man', value: 6 }], isOpen: false },
    { type: 'shuntsu', tiles: [{ suit: 'pin', value: 2 }, { suit: 'pin', value: 3 }, { suit: 'pin', value: 4 }], isOpen: false },
    { type: 'shuntsu', tiles: [{ suit: 'sou', value: 5 }, { suit: 'sou', value: 6 }, { suit: 'sou', value: 7 }], isOpen: false },
  ];
  const jantou: Jantou = { tiles: [{ suit: 'sou', value: 2 }, { suit: 'sou', value: 2 }] };

  const problem: Problem = {
    mentsu,
    jantou,
    winType: 'ron',
    playerType: 'ko',
    seatWind: 2,    // 南
    roundWind: 1,   // 東
    waitType: 'ryanmen',
    winningTile: { suit: 'man', value: 3 },
    han: 2,
    isMenzen: true,
    doraIndicators: [{ suit: 'honor', value: 1, honorType: 'ton' }],
  };

  const yakuResult = calculateYaku(problem);
  (problem as ProblemWithYaku).yakuResult = yakuResult;

  return problem as ProblemWithYaku;
}

export function generateProblem(difficulty: Difficulty, retryCount = 0): Problem {
  const settings = DIFFICULTY_SETTINGS[difficulty];

  // 最大試行回数に達したらフォールバック問題を返す
  if (retryCount >= MAX_RETRY_COUNT) {
    return createFallbackProblem(difficulty);
  }

  // 5%の確率で七対子を出題
  if (randomBool(0.05)) {
    const counter = new TileCounter();
    const chiitoitsuProblem = createChiitoitsuProblem(counter);
    if (chiitoitsuProblem) {
      return chiitoitsuProblem;
    }
    // 七対子の生成に失敗したら通常生成にフォールバック
  }

  // 出現率の低い役を強制生成
  for (const { yakuId, rate } of RARE_YAKU_RATES) {
    if (randomBool(rate)) {
      const problem = generateProblemWithYaku(difficulty, yakuId);
      if (problem) {
        return problem;
      }
    }
  }

  // 牌の使用枚数を管理
  const counter = new TileCounter();

  // 副露するかどうか
  const hasOpen = randomBool(settings.openRate);

  // 面子を生成
  const mentsu: Mentsu[] = [];
  let openCount = 0;

  for (let i = 0; i < 4; i++) {
    const useHonor = randomBool(settings.honorRate);
    const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
    if (isOpen) openCount++;

    const mentsuType = determineMentsuType(useHonor, settings.kantsuRate);
    const generated = generateStandardMentsu(useHonor, isOpen, mentsuType, counter);

    if (generated) {
      mentsu.push(generated);
    }
  }

  // 雀頭を生成
  const jantouUseHonor = randomBool(settings.honorRate);
  let jantou = generateJantou(jantouUseHonor, counter);
  if (!jantou) {
    jantou = generateJantou(false, counter);
  }
  if (!jantou) {
    // 最終手段
    jantou = { tiles: [createTile('man', 1), createTile('man', 1)] };
  }

  // 問題を構築
  const problem = createProblemFromHand(mentsu, jantou, counter);

  // 役がない場合や役満の場合は再生成
  if (!problem) {
    return generateProblem(difficulty, retryCount + 1);
  }

  return problem;
}

// チャンタ用の手牌を直接生成
function generateChantaHand(counter: TileCounter, hasOpen: boolean): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];
  let openCount = 0;

  // 確実にチャンタになるようにシンプルなパターンで生成
  // 字牌刻子1つ + 123順子1つ（萬子）+ 789順子1つ（筒子）+ 123or789順子1つ（索子）

  const honorValues = [1, 2, 3, 4, 5, 6, 7];
  shuffleArray(honorValues);

  // 1. 字牌刻子を生成（必須）
  for (const hv of honorValues) {
    const tile = createTile('honor', hv);
    if (counter.canUse(tile, 3)) {
      counter.use(tile, 3);
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({
        type: 'koutsu',
        tiles: [tile, { ...tile }, { ...tile }],
        isOpen,
      });
      break;
    }
  }

  // 2. 萬子123順子
  {
    const tiles = [createTile('man', 1), createTile('man', 2), createTile('man', 3)];
    if (tiles.every(t => counter.canUse(t, 1))) {
      tiles.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles, isOpen });
    }
  }

  // 3. 筒子789順子
  {
    const tiles = [createTile('pin', 7), createTile('pin', 8), createTile('pin', 9)];
    if (tiles.every(t => counter.canUse(t, 1))) {
      tiles.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles, isOpen });
    }
  }

  // 4. 索子123 or 789順子
  if (mentsu.length < 4) {
    const souTiles123 = [createTile('sou', 1), createTile('sou', 2), createTile('sou', 3)];
    const souTiles789 = [createTile('sou', 7), createTile('sou', 8), createTile('sou', 9)];

    if (souTiles123.every(t => counter.canUse(t, 1))) {
      souTiles123.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles: souTiles123, isOpen });
    } else if (souTiles789.every(t => counter.canUse(t, 1))) {
      souTiles789.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles: souTiles789, isOpen });
    }
  }

  // 雀頭: 么九牌（字牌または1,9）
  let jantou: Jantou | null = null;

  // 字牌の雀頭を試す
  shuffleArray(honorValues);
  for (const hv of honorValues) {
    const tile = createTile('honor', hv);
    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      jantou = { tiles: [tile, { ...tile }] };
      break;
    }
  }

  // 字牌がダメなら1,9の雀頭
  if (!jantou) {
    const terminalCandidates = [
      createTile('man', 1), createTile('man', 9),
      createTile('pin', 1), createTile('pin', 9),
      createTile('sou', 1), createTile('sou', 9),
    ];
    shuffleArray(terminalCandidates);
    for (const tile of terminalCandidates) {
      if (counter.canUse(tile, 2)) {
        counter.use(tile, 2);
        jantou = { tiles: [tile, { ...tile }] };
        break;
      }
    }
  }

  return { mentsu, jantou };
}

// 純チャン用の手牌を直接生成
function generateJunchanHand(counter: TileCounter, hasOpen: boolean): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];
  let openCount = 0;

  // 純チャンは字牌なしで、全て1,9絡み
  // パターン: 123順子 + 789順子 + 1or9の刻子
  const suits: TileSuit[] = ['man', 'pin', 'sou'];
  shuffleArray(suits);

  // 123順子を2つ
  for (let i = 0; i < 2 && mentsu.length < 4; i++) {
    const suit = suits[i % 3];
    const tiles = [
      createTile(suit, 1),
      createTile(suit, 2),
      createTile(suit, 3),
    ];
    if (tiles.every(t => counter.canUse(t, 1))) {
      tiles.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles, isOpen });
    }
  }

  // 789順子を2つ
  for (let i = 0; i < 2 && mentsu.length < 4; i++) {
    const suit = suits[(i + 1) % 3];
    const tiles = [
      createTile(suit, 7),
      createTile(suit, 8),
      createTile(suit, 9),
    ];
    if (tiles.every(t => counter.canUse(t, 1))) {
      tiles.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles, isOpen });
    }
  }

  // 雀頭: 1 or 9
  let jantou: Jantou | null = null;
  const terminalCandidates = [
    createTile('man', 1), createTile('man', 9),
    createTile('pin', 1), createTile('pin', 9),
    createTile('sou', 1), createTile('sou', 9),
  ];
  shuffleArray(terminalCandidates);
  for (const tile of terminalCandidates) {
    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      jantou = { tiles: [tile, { ...tile }] };
      break;
    }
  }

  return { mentsu, jantou };
}

// 三色同順用の手牌を直接生成
function generateSanshokuDoujunHand(counter: TileCounter, hasOpen: boolean): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];
  let openCount = 0;

  // 同じ数字の順子を3種類作る（例: 123萬, 123筒, 123索）
  const startValue = randomInt(1, 7); // 1-7から選ぶ
  const suits: TileSuit[] = ['man', 'pin', 'sou'];

  for (const suit of suits) {
    const tiles = [
      createTile(suit, startValue),
      createTile(suit, startValue + 1),
      createTile(suit, startValue + 2),
    ];
    if (tiles.every(t => counter.canUse(t, 1))) {
      tiles.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles, isOpen });
    }
  }

  // 4つ目の面子（何でもOK）
  if (mentsu.length < 4) {
    const fourthSuit = randomChoice(suits);
    const fourthStart = randomInt(1, 7);
    const tiles = [
      createTile(fourthSuit, fourthStart),
      createTile(fourthSuit, fourthStart + 1),
      createTile(fourthSuit, fourthStart + 2),
    ];
    if (tiles.every(t => counter.canUse(t, 1))) {
      tiles.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles, isOpen });
    }
  }

  // 雀頭
  let jantou: Jantou | null = null;
  for (const suit of suits) {
    for (let v = 1; v <= 9; v++) {
      const tile = createTile(suit, v);
      if (counter.canUse(tile, 2)) {
        counter.use(tile, 2);
        jantou = { tiles: [tile, { ...tile }] };
        break;
      }
    }
    if (jantou) break;
  }

  return { mentsu, jantou };
}

// 一気通貫用の手牌を直接生成
function generateIttsuHand(counter: TileCounter, hasOpen: boolean): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];
  let openCount = 0;

  // 同じ種類で123, 456, 789を作る
  const suit = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);

  for (const start of [1, 4, 7]) {
    const tiles = [
      createTile(suit, start),
      createTile(suit, start + 1),
      createTile(suit, start + 2),
    ];
    if (tiles.every(t => counter.canUse(t, 1))) {
      tiles.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles, isOpen });
    }
  }

  // 4つ目の面子
  if (mentsu.length < 4) {
    const otherSuits = (['man', 'pin', 'sou'] as TileSuit[]).filter(s => s !== suit);
    const fourthSuit = randomChoice(otherSuits);
    const fourthStart = randomInt(1, 7);
    const tiles = [
      createTile(fourthSuit, fourthStart),
      createTile(fourthSuit, fourthStart + 1),
      createTile(fourthSuit, fourthStart + 2),
    ];
    if (tiles.every(t => counter.canUse(t, 1))) {
      tiles.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles, isOpen });
    }
  }

  // 雀頭
  let jantou: Jantou | null = null;
  for (let v = 1; v <= 9; v++) {
    const tile = createTile(suit, v);
    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      jantou = { tiles: [tile, { ...tile }] };
      break;
    }
  }
  // 同じ種類でダメなら別の種類
  if (!jantou) {
    const otherSuits = (['man', 'pin', 'sou'] as TileSuit[]).filter(s => s !== suit);
    for (const s of otherSuits) {
      for (let v = 1; v <= 9; v++) {
        const tile = createTile(s, v);
        if (counter.canUse(tile, 2)) {
          counter.use(tile, 2);
          jantou = { tiles: [tile, { ...tile }] };
          break;
        }
      }
      if (jantou) break;
    }
  }

  return { mentsu, jantou };
}

// 対々和用の手牌を直接生成
function generateToitoiHand(counter: TileCounter, hasOpen: boolean): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];
  let openCount = 0;

  // 4つの刻子を作る
  const allTiles: Tile[] = [];
  for (const suit of ['man', 'pin', 'sou'] as TileSuit[]) {
    for (let v = 1; v <= 9; v++) {
      allTiles.push(createTile(suit, v));
    }
  }
  for (let v = 1; v <= 7; v++) {
    allTiles.push(createTile('honor', v));
  }
  shuffleArray(allTiles);

  for (const tile of allTiles) {
    if (mentsu.length >= 4) break;
    if (counter.canUse(tile, 3)) {
      counter.use(tile, 3);
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({
        type: 'koutsu',
        tiles: [tile, { ...tile }, { ...tile }],
        isOpen,
      });
    }
  }

  // 雀頭
  let jantou: Jantou | null = null;
  shuffleArray(allTiles);
  for (const tile of allTiles) {
    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      jantou = { tiles: [tile, { ...tile }] };
      break;
    }
  }

  return { mentsu, jantou };
}

// 混一色用の手牌を直接生成
function generateHonitsuHand(counter: TileCounter, hasOpen: boolean): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];
  let openCount = 0;

  const suit = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);

  // 字牌の刻子を1つ
  const honorValues = [1, 2, 3, 4, 5, 6, 7];
  shuffleArray(honorValues);
  for (const hv of honorValues) {
    const tile = createTile('honor', hv);
    if (counter.canUse(tile, 3)) {
      counter.use(tile, 3);
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({
        type: 'koutsu',
        tiles: [tile, { ...tile }, { ...tile }],
        isOpen,
      });
      break;
    }
  }

  // 残り3つは同じ種類の順子
  while (mentsu.length < 4) {
    const start = randomInt(1, 7);
    const tiles = [
      createTile(suit, start),
      createTile(suit, start + 1),
      createTile(suit, start + 2),
    ];
    if (tiles.every(t => counter.canUse(t, 1))) {
      tiles.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles, isOpen });
    } else {
      break;
    }
  }

  // 雀頭（同じ種類か字牌）
  let jantou: Jantou | null = null;
  // まず字牌を試す
  shuffleArray(honorValues);
  for (const hv of honorValues) {
    const tile = createTile('honor', hv);
    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      jantou = { tiles: [tile, { ...tile }] };
      break;
    }
  }
  // 字牌がダメなら同じ種類
  if (!jantou) {
    for (let v = 1; v <= 9; v++) {
      const tile = createTile(suit, v);
      if (counter.canUse(tile, 2)) {
        counter.use(tile, 2);
        jantou = { tiles: [tile, { ...tile }] };
        break;
      }
    }
  }

  return { mentsu, jantou };
}

// 清一色用の手牌を直接生成
function generateChinitsuHand(counter: TileCounter, hasOpen: boolean): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];
  let openCount = 0;

  const suit = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);

  // 4つの順子（全て同じ種類）
  while (mentsu.length < 4) {
    const start = randomInt(1, 7);
    const tiles = [
      createTile(suit, start),
      createTile(suit, start + 1),
      createTile(suit, start + 2),
    ];
    if (tiles.every(t => counter.canUse(t, 1))) {
      tiles.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles, isOpen });
    } else {
      break;
    }
  }

  // 雀頭
  let jantou: Jantou | null = null;
  for (let v = 1; v <= 9; v++) {
    const tile = createTile(suit, v);
    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      jantou = { tiles: [tile, { ...tile }] };
      break;
    }
  }

  return { mentsu, jantou };
}

// 三暗刻用の手牌生成
function generateSanankouHand(counter: TileCounter, hasOpen: boolean): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];

  // 3つの暗刻（門前）
  const usedValues: { suit: TileSuit, value: number }[] = [];
  while (mentsu.length < 3) {
    const useHonor = randomBool(0.3);
    let tile: Tile;
    if (useHonor) {
      tile = createTile('honor', randomInt(1, 7));
    } else {
      const suit = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);
      tile = createTile(suit, randomInt(1, 9));
    }

    // 重複チェック
    if (usedValues.some(v => v.suit === tile.suit && v.value === tile.value)) {
      continue;
    }

    if (counter.canUse(tile, 3)) {
      counter.use(tile, 3);
      usedValues.push({ suit: tile.suit, value: tile.value });
      mentsu.push({
        type: 'koutsu',
        tiles: [tile, { ...tile }, { ...tile }],
        isOpen: false, // 暗刻なので必ず門前
      });
    }
  }

  // 4つ目は必ず順子にする（刻子だと四暗刻になる可能性があるため）
  if (mentsu.length === 3) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const suit = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);
      const start = randomInt(1, 7);
      const tiles = [
        createTile(suit, start),
        createTile(suit, start + 1),
        createTile(suit, start + 2),
      ];
      if (tiles.every(t => counter.canUse(t, 1))) {
        tiles.forEach(t => counter.use(t, 1));
        mentsu.push({ type: 'shuntsu', tiles, isOpen: hasOpen });
        break;
      }
    }
  }

  // 雀頭
  let jantou: Jantou | null = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const useHonor = randomBool(0.3);
    let tile: Tile;
    if (useHonor) {
      tile = createTile('honor', randomInt(1, 7));
    } else {
      const suit = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);
      tile = createTile(suit, randomInt(1, 9));
    }
    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      jantou = { tiles: [tile, { ...tile }] };
      break;
    }
  }

  return { mentsu, jantou };
}

// 七対子用の手牌生成（7つの対子）
function generateChiitoitsuHand(counter: TileCounter): { toitsu: Tile[][] } {
  const toitsu: Tile[][] = [];
  const usedTiles: { suit: TileSuit, value: number }[] = [];

  // 7つの対子を生成（全て異なる牌）
  while (toitsu.length < 7) {
    // ランダムな牌を選ぶ
    let tile: Tile;
    if (randomBool(0.15)) {
      // 15%の確率で字牌
      tile = createTile('honor', randomInt(1, 7));
    } else {
      // 85%の確率で数牌
      tile = createTile(randomNumberSuit(), randomInt(1, 9));
    }

    // 重複チェック（七対子は同じ牌4枚を2対子として使えない）
    if (usedTiles.some(t => t.suit === tile.suit && t.value === tile.value)) {
      continue;
    }

    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      usedTiles.push({ suit: tile.suit, value: tile.value });
      toitsu.push([tile, { ...tile }]);
    }
  }

  return { toitsu };
}

// 七対子の問題を構築
function createChiitoitsuProblem(counter: TileCounter): Problem | null {
  const { toitsu } = generateChiitoitsuHand(counter);

  if (toitsu.length < 7) {
    return null;
  }

  // 七対子は必ず門前
  const isMenzen = true;

  // 和了方法を決定
  const winType: WinType = randomChoice(['tsumo', 'ron']);
  const playerType: PlayerType = randomBool(0.25) ? 'oya' : 'ko';

  // 最後の対子のうち1枚を和了牌とする（単騎待ち）
  const winningToitsuIndex = randomInt(0, 6);
  const winningTile = { ...toitsu[winningToitsuIndex][0] };

  // 待ちは単騎待ち
  const waitType: WaitType = 'tanki';

  const roundWind = randomChoice([1, 2]);
  const seatWind = randomInt(1, 4);

  // ドラ表示牌を生成
  const doraIndicators = generateDoraIndicators(counter, []);

  // 七対子専用のProblemを作成
  const tempProblem: Problem = {
    mentsu: [], // 七対子は面子なし
    jantou: { tiles: [toitsu[0][0], toitsu[0][1]] as [Tile, Tile] }, // 仮の雀頭（最初の対子）
    winType,
    playerType,
    waitType,
    winningTile,
    han: 0,
    isMenzen,
    seatWind,
    roundWind,
    doraIndicators,
  };

  // 七対子の場合は特別な処理が必要なため、toitsuを保持
  (tempProblem as ChiitoitsuProblem).isChiitoitsu = true;
  (tempProblem as ChiitoitsuProblem).toitsu = toitsu;

  const yakuResult = calculateYaku(tempProblem);

  // 役がない場合は無効（七対子は必ず成立するはず）
  if (yakuResult.yakuList.length === 0) {
    return null;
  }

  const problem: Problem = {
    ...tempProblem,
    han: yakuResult.totalHan,
  };

  (problem as ProblemWithYaku).yakuResult = yakuResult;

  return problem as ProblemWithYaku;
}

// 混老頭用の手牌生成（全てが么九牌、字牌を含む）
function generateHonroutouHand(counter: TileCounter, hasOpen: boolean): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];
  let openCount = 0;
  let hasHonor = false;

  // 么九牌のリスト（老頭牌 + 字牌）
  const yaochuhai: Tile[] = [
    createTile('man', 1), createTile('man', 9),
    createTile('pin', 1), createTile('pin', 9),
    createTile('sou', 1), createTile('sou', 9),
    createTile('honor', 1), createTile('honor', 2), createTile('honor', 3), createTile('honor', 4),
    createTile('honor', 5), createTile('honor', 6), createTile('honor', 7),
  ];

  const usedTiles: Tile[] = [];

  // 4つの刻子（全て么九牌）
  while (mentsu.length < 4) {
    const tile = randomChoice(yaochuhai);

    // 重複チェック
    if (usedTiles.some(t => t.suit === tile.suit && t.value === tile.value)) {
      continue;
    }

    if (counter.canUse(tile, 3)) {
      counter.use(tile, 3);
      usedTiles.push(tile);
      if (tile.suit === 'honor') hasHonor = true;

      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;

      mentsu.push({
        type: 'koutsu',
        tiles: [tile, { ...tile }, { ...tile }],
        isOpen,
      });
    }
  }

  // 字牌が含まれていなければ、最後の刻子を字牌に変更
  if (!hasHonor && mentsu.length === 4) {
    // 一旦リセットして字牌を含む構成を再生成
    return generateHonroutouHand(counter, hasOpen);
  }

  // 雀頭（么九牌）
  let jantou: Jantou | null = null;
  for (const tile of yaochuhai) {
    if (usedTiles.some(t => t.suit === tile.suit && t.value === tile.value)) {
      continue;
    }
    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      jantou = { tiles: [tile, { ...tile }] };
      break;
    }
  }

  return { mentsu, jantou };
}

// 三色同刻用の手牌生成（萬子・筒子・索子で同じ数字の刻子3組）
function generateSanshokuDoukouHand(counter: TileCounter, hasOpen: boolean): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];
  let openCount = 0;

  // 同じ数字で萬子・筒子・索子の刻子を作る
  const value = randomInt(1, 9);
  const suits: TileSuit[] = ['man', 'pin', 'sou'];

  for (const suit of suits) {
    const tile = createTile(suit, value);
    if (counter.canUse(tile, 3)) {
      counter.use(tile, 3);
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({
        type: 'koutsu',
        tiles: [tile, { ...tile }, { ...tile }],
        isOpen,
      });
    }
  }

  // 4つ目の面子（順子か刻子）
  if (mentsu.length === 3) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const fourthSuit = randomChoice(suits);
      const fourthStart = randomInt(1, 7);
      const tiles = [
        createTile(fourthSuit, fourthStart),
        createTile(fourthSuit, fourthStart + 1),
        createTile(fourthSuit, fourthStart + 2),
      ];
      if (tiles.every(t => counter.canUse(t, 1))) {
        tiles.forEach(t => counter.use(t, 1));
        const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
        if (isOpen) openCount++;
        mentsu.push({ type: 'shuntsu', tiles, isOpen });
        break;
      }
    }
  }

  // 雀頭
  let jantou: Jantou | null = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const useHonor = randomBool(0.3);
    let tile: Tile;
    if (useHonor) {
      tile = createTile('honor', randomInt(1, 7));
    } else {
      const suit = randomChoice(suits);
      tile = createTile(suit, randomInt(1, 9));
    }
    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      jantou = { tiles: [tile, { ...tile }] };
      break;
    }
  }

  return { mentsu, jantou };
}

// 三槓子用の手牌生成（槓子が3組）
function generateSankantsuHand(counter: TileCounter, hasOpen: boolean): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];
  let openCount = 0;

  // 3つの槓子を作る
  const usedValues: { suit: TileSuit, value: number }[] = [];
  while (mentsu.length < 3) {
    const useHonor = randomBool(0.3);
    let tile: Tile;
    if (useHonor) {
      tile = createTile('honor', randomInt(1, 7));
    } else {
      const suit = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);
      tile = createTile(suit, randomInt(1, 9));
    }

    // 重複チェック
    if (usedValues.some(v => v.suit === tile.suit && v.value === tile.value)) {
      continue;
    }

    if (counter.canUse(tile, 4)) {
      counter.use(tile, 4);
      usedValues.push({ suit: tile.suit, value: tile.value });
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({
        type: 'kantsu',
        tiles: [tile, { ...tile }, { ...tile }, { ...tile }],
        isOpen,
      });
    }
  }

  // 4つ目は順子か刻子
  if (mentsu.length === 3) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const suit = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);
      const start = randomInt(1, 7);
      const tiles = [
        createTile(suit, start),
        createTile(suit, start + 1),
        createTile(suit, start + 2),
      ];
      if (tiles.every(t => counter.canUse(t, 1))) {
        tiles.forEach(t => counter.use(t, 1));
        const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
        if (isOpen) openCount++;
        mentsu.push({ type: 'shuntsu', tiles, isOpen });
        break;
      }
    }
  }

  // 雀頭
  let jantou: Jantou | null = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const useHonor = randomBool(0.3);
    let tile: Tile;
    if (useHonor) {
      tile = createTile('honor', randomInt(1, 7));
    } else {
      const suit = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);
      tile = createTile(suit, randomInt(1, 9));
    }
    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      jantou = { tiles: [tile, { ...tile }] };
      break;
    }
  }

  return { mentsu, jantou };
}

// 小三元用の手牌生成（三元牌2刻子+1雀頭）
function generateShousangenHand(counter: TileCounter, hasOpen: boolean): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];
  let openCount = 0;

  // 三元牌: 白=5, 發=6, 中=7
  const sangenValues = [5, 6, 7];
  shuffleArray(sangenValues);

  // 2つの三元牌刻子
  const usedSangen: number[] = [];
  for (let i = 0; i < 2 && usedSangen.length < 2; i++) {
    const value = sangenValues[i];
    const tile = createTile('honor', value);
    if (counter.canUse(tile, 3)) {
      counter.use(tile, 3);
      usedSangen.push(value);
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({
        type: 'koutsu',
        tiles: [tile, { ...tile }, { ...tile }],
        isOpen,
      });
    }
  }

  // 残り2つは数牌の順子
  while (mentsu.length < 4) {
    const suit = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);
    const start = randomInt(1, 7);
    const tiles = [
      createTile(suit, start),
      createTile(suit, start + 1),
      createTile(suit, start + 2),
    ];
    if (tiles.every(t => counter.canUse(t, 1))) {
      tiles.forEach(t => counter.use(t, 1));
      const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
      if (isOpen) openCount++;
      mentsu.push({ type: 'shuntsu', tiles, isOpen });
    } else {
      break;
    }
  }

  // 雀頭は残りの三元牌
  let jantou: Jantou | null = null;
  const remainingSangen = sangenValues.find(v => !usedSangen.includes(v));
  if (remainingSangen !== undefined) {
    const tile = createTile('honor', remainingSangen);
    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      jantou = { tiles: [tile, { ...tile }] };
    }
  }

  // 三元牌の雀頭が作れなければ失敗
  if (!jantou) {
    return { mentsu: [], jantou: null };
  }

  return { mentsu, jantou };
}

// 二盃口用の手牌生成（同じ順子2組×2、門前限定）
function generateRyanpeikouHand(counter: TileCounter): { mentsu: Mentsu[], jantou: Jantou | null } {
  const mentsu: Mentsu[] = [];

  // 1組目の一盃口（同じ順子2つ）
  const suit1 = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);
  const start1 = randomInt(1, 7);
  const tiles1 = [
    createTile(suit1, start1),
    createTile(suit1, start1 + 1),
    createTile(suit1, start1 + 2),
  ];

  // 2回追加（同じ順子）
  for (let i = 0; i < 2; i++) {
    if (tiles1.every(t => counter.canUse(t, 1))) {
      tiles1.forEach(t => counter.use(t, 1));
      mentsu.push({
        type: 'shuntsu',
        tiles: tiles1.map(t => ({ ...t })),
        isOpen: false, // 門前限定
      });
    }
  }

  // 2組目の一盃口（異なる順子2つ）
  let suit2 = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);
  let start2 = randomInt(1, 7);
  // 1組目と異なる順子を選ぶ
  for (let attempt = 0; attempt < 20; attempt++) {
    if (suit2 !== suit1 || start2 !== start1) break;
    suit2 = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);
    start2 = randomInt(1, 7);
  }

  const tiles2 = [
    createTile(suit2, start2),
    createTile(suit2, start2 + 1),
    createTile(suit2, start2 + 2),
  ];

  // 2回追加（同じ順子）
  for (let i = 0; i < 2; i++) {
    if (tiles2.every(t => counter.canUse(t, 1))) {
      tiles2.forEach(t => counter.use(t, 1));
      mentsu.push({
        type: 'shuntsu',
        tiles: tiles2.map(t => ({ ...t })),
        isOpen: false, // 門前限定
      });
    }
  }

  // 雀頭
  let jantou: Jantou | null = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    const suit = randomChoice(['man', 'pin', 'sou'] as TileSuit[]);
    const value = randomInt(1, 9);
    const tile = createTile(suit, value);
    if (counter.canUse(tile, 2)) {
      counter.use(tile, 2);
      jantou = { tiles: [tile, { ...tile }] };
      break;
    }
  }

  return { mentsu, jantou };
}

// 特定の役を含む問題を生成する関数（デバッグ用）
export function generateProblemWithYaku(difficulty: Difficulty, targetYakuId: string): Problem {
  const settings = DIFFICULTY_SETTINGS[difficulty];

  // 最大100回まで生成を試みる
  for (let mainAttempt = 0; mainAttempt < 100; mainAttempt++) {
    const counter = new TileCounter();
    let mentsu: Mentsu[] = [];
    let jantou: Jantou | null = null;
    let hasOpen = randomBool(settings.openRate);

    // 特定の役に応じた生成
    if (targetYakuId === 'chiitoitsu') {
      // 七対子: 専用の生成関数を使用
      const problem = createChiitoitsuProblem(counter);
      if (problem) {
        return problem;
      }
      continue; // 生成失敗時は次の試行へ
    } else if (targetYakuId === 'chanta') {
      // 混全帯么九: 専用の生成関数を使用
      const result = generateChantaHand(counter, hasOpen);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else if (targetYakuId === 'junchan') {
      // 純全帯么九: 専用の生成関数を使用
      const result = generateJunchanHand(counter, hasOpen);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else if (targetYakuId === 'sanshoku_doujun') {
      // 三色同順: 専用の生成関数を使用
      const result = generateSanshokuDoujunHand(counter, hasOpen);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else if (targetYakuId === 'ittsu') {
      // 一気通貫: 専用の生成関数を使用
      const result = generateIttsuHand(counter, hasOpen);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else if (targetYakuId === 'toitoi') {
      // 対々和: 専用の生成関数を使用
      const result = generateToitoiHand(counter, hasOpen);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else if (targetYakuId === 'honitsu') {
      // 混一色: 専用の生成関数を使用
      const result = generateHonitsuHand(counter, hasOpen);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else if (targetYakuId === 'chinitsu') {
      // 清一色: 専用の生成関数を使用
      const result = generateChinitsuHand(counter, hasOpen);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else if (targetYakuId === 'sanankou') {
      // 三暗刻: 専用の生成関数を使用
      const result = generateSanankouHand(counter, hasOpen);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else if (targetYakuId === 'honroutou') {
      // 混老頭: 専用の生成関数を使用
      const result = generateHonroutouHand(counter, hasOpen);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else if (targetYakuId === 'sanshoku_doukou') {
      // 三色同刻: 専用の生成関数を使用
      const result = generateSanshokuDoukouHand(counter, hasOpen);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else if (targetYakuId === 'sankantsu') {
      // 三槓子: 専用の生成関数を使用
      const result = generateSankantsuHand(counter, hasOpen);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else if (targetYakuId === 'shousangen') {
      // 小三元: 専用の生成関数を使用
      const result = generateShousangenHand(counter, hasOpen);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else if (targetYakuId === 'ryanpeikou') {
      // 二盃口: 専用の生成関数を使用（門前限定）
      const result = generateRyanpeikouHand(counter);
      mentsu = result.mentsu;
      jantou = result.jantou;
    } else {
      // その他の役は通常生成して後でフィルタリング
      // 通常の面子生成
      hasOpen = randomBool(settings.openRate);
      let openCount = 0;

      for (let i = 0; i < 4; i++) {
        const useHonor = randomBool(settings.honorRate);
        const isOpen = hasOpen && openCount < 2 && randomBool(0.5);
        if (isOpen) openCount++;

        const mentsuType = determineMentsuType(useHonor, settings.kantsuRate);
        const generated = generateStandardMentsu(useHonor, isOpen, mentsuType, counter);

        if (generated) {
          mentsu.push(generated);
        }
      }

      // 雀頭を生成
      const jantouUseHonor = randomBool(settings.honorRate);
      jantou = generateJantou(jantouUseHonor, counter);
      if (!jantou) {
        jantou = generateJantou(false, counter);
      }
    }

    // 面子が足りない場合は次のループで再試行
    if (mentsu.length < 4 || !jantou) {
      continue;
    }

    // 問題を構築
    const problem = createProblemFromHand(mentsu, jantou, counter);

    // 役がない場合や役満の場合は次のループで再試行
    if (!problem) {
      continue;
    }

    // 指定した役が含まれているかチェック
    const yakuResult = (problem as ProblemWithYaku).yakuResult;
    const hasTargetYaku = yakuResult.yakuList.some(y => y.id === targetYakuId);
    if (!hasTargetYaku) {
      continue;
    }

    return problem;
  }

  // 100回試して失敗したら通常生成にフォールバック
  return generateProblem(difficulty);
}

// 役判定結果付きProblem型
export interface ProblemWithYaku extends Problem {
  yakuResult: YakuResult;
}

// 待ちの日本語名
export function getWaitTypeName(waitType: WaitType): string {
  const names: Record<WaitType, string> = {
    ryanmen: '両面待ち',
    kanchan: 'カンチャン待ち',
    penchan: 'ペンチャン待ち',
    shanpon: 'シャンポン待ち',
    tanki: '単騎待ち',
  };
  return names[waitType];
}

// 風の日本語名
export function getWindName(wind: number): string {
  const names = ['', '東', '南', '西', '北'];
  return names[wind] || '';
}
