import { Problem, Tile, TileSuit, isChiitoitsuProblem } from './types';
import { YakuId, JudgedYaku, YakuResult } from './yaku-types';
import { YAKU_LIST } from './yaku-list';
import { isChunchanhai, isSameTile, isYaochuhai } from './tiles';
import { isPinfu } from './fu-calculator';

// 七対子かどうかを判定（型ガードを使用）
function isChiitoitsu(problem: Problem): boolean {
  return isChiitoitsuProblem(problem);
}

// メインの役判定関数
export function calculateYaku(problem: Problem): YakuResult {
  const yakuList: JudgedYaku[] = [];

  // 七対子の場合は特別処理
  if (isChiitoitsu(problem)) {
    addYaku(yakuList, 'chiitoitsu', true);
    // 七対子 + リーチ（門前なので常にあり）
    addYaku(yakuList, 'riichi', true);
    // 七対子 + ツモ
    if (problem.winType === 'tsumo') {
      addYaku(yakuList, 'menzen_tsumo', true);
    }
    // ドラカウント
    const doraCount = countDoraForChiitoitsu(problem);
    return {
      yakuList,
      totalHan: yakuList.reduce((sum, y) => sum + y.han, 0) + doraCount,
      doraCount,
    };
  }

  // リーチ（門前なら常にあり）
  if (problem.isMenzen) {
    addYaku(yakuList, 'riichi', problem.isMenzen);
  }

  // 門前清自摸和
  if (problem.isMenzen && problem.winType === 'tsumo') {
    addYaku(yakuList, 'menzen_tsumo', problem.isMenzen);
  }

  // 断么九
  if (checkTanyao(problem)) {
    addYaku(yakuList, 'tanyao', problem.isMenzen);
  }

  // 平和
  if (isPinfu(problem)) {
    addYaku(yakuList, 'pinfu', problem.isMenzen);
  }

  // 対々和
  if (checkToitoi(problem)) {
    addYaku(yakuList, 'toitoi', problem.isMenzen);
  }

  // 三暗刻
  if (checkSanankou(problem)) {
    addYaku(yakuList, 'sanankou', problem.isMenzen);
  }

  // 役牌
  checkYakuhai(problem, yakuList);

  // 混一色
  if (checkHonitsu(problem)) {
    addYaku(yakuList, 'honitsu', problem.isMenzen);
  }

  // 清一色
  if (checkChinitsu(problem)) {
    addYaku(yakuList, 'chinitsu', problem.isMenzen);
  }

  // 一盃口（二盃口が成立する場合は除外）
  if (checkIipeikou(problem) && !checkRyanpeikou(problem)) {
    addYaku(yakuList, 'iipeikou', problem.isMenzen);
  }

  // 混老頭
  if (checkHonroutou(problem)) {
    addYaku(yakuList, 'honroutou', problem.isMenzen);
  }

  // 三色同順
  if (checkSanshokuDoujun(problem)) {
    addYaku(yakuList, 'sanshoku_doujun', problem.isMenzen);
  }

  // 一気通貫
  if (checkIttsu(problem)) {
    addYaku(yakuList, 'ittsu', problem.isMenzen);
  }

  // 混全帯么九
  if (checkChanta(problem)) {
    addYaku(yakuList, 'chanta', problem.isMenzen);
  }

  // 純全帯么九
  if (checkJunchan(problem)) {
    addYaku(yakuList, 'junchan', problem.isMenzen);
  }

  // 三色同刻
  if (checkSanshokuDoukou(problem)) {
    addYaku(yakuList, 'sanshoku_doukou', problem.isMenzen);
  }

  // 三槓子
  if (checkSankantsu(problem)) {
    addYaku(yakuList, 'sankantsu', problem.isMenzen);
  }

  // 小三元
  if (checkShousangen(problem)) {
    addYaku(yakuList, 'shousangen', problem.isMenzen);
  }

  // 二盃口
  if (checkRyanpeikou(problem)) {
    addYaku(yakuList, 'ryanpeikou', problem.isMenzen);
  }

  // ドラカウント
  const doraCount = countDora(problem);

  return {
    yakuList,
    totalHan: yakuList.reduce((sum, y) => sum + y.han, 0) + doraCount,
    doraCount,
  };
}

// 役を追加するヘルパー
function addYaku(list: JudgedYaku[], id: YakuId, isMenzen: boolean): void {
  const def = YAKU_LIST.find((y) => y.id === id);
  if (!def) return;

  const han = isMenzen ? def.han : def.hanOpen;
  if (han === null) return; // 門前限定役だが副露している

  list.push({ id, han });
}

// 全ての牌を取得
function getAllTiles(problem: Problem): Tile[] {
  const tiles: Tile[] = [];
  for (const mentsu of problem.mentsu) {
    tiles.push(...mentsu.tiles);
  }
  tiles.push(...problem.jantou.tiles);
  return tiles;
}

// 断么九の判定
function checkTanyao(problem: Problem): boolean {
  const allTiles = getAllTiles(problem);
  return allTiles.every((tile) => isChunchanhai(tile));
}

// 対々和の判定
function checkToitoi(problem: Problem): boolean {
  return problem.mentsu.every((m) => m.type === 'koutsu' || m.type === 'kantsu');
}

// 三暗刻の判定
function checkSanankou(problem: Problem): boolean {
  let ankou = 0;
  for (const mentsu of problem.mentsu) {
    if ((mentsu.type === 'koutsu' || mentsu.type === 'kantsu') && !mentsu.isOpen) {
      // ロンで和了った面子は暗刻にならない
      if (problem.winType === 'ron' && problem.waitType === 'shanpon') {
        // シャンポン待ちのロンの場合、和了牌を含む刻子は明刻扱い
        if (mentsu.tiles.some((t) => isSameTile(t, problem.winningTile))) {
          continue;
        }
      }
      ankou++;
    }
  }
  return ankou >= 3;
}

// 役牌の判定
function checkYakuhai(problem: Problem, yakuList: JudgedYaku[]): void {
  for (const mentsu of problem.mentsu) {
    if (mentsu.type !== 'koutsu' && mentsu.type !== 'kantsu') continue;

    const tile = mentsu.tiles[0];
    if (tile.suit !== 'honor') continue;

    // 三元牌（value 5=發, 6=白, 7=中）
    if (tile.value === 5) addYaku(yakuList, 'yakuhai_hatsu', problem.isMenzen);
    if (tile.value === 6) addYaku(yakuList, 'yakuhai_haku', problem.isMenzen);
    if (tile.value === 7) addYaku(yakuList, 'yakuhai_chun', problem.isMenzen);

    // 場風
    if (tile.value === problem.roundWind) {
      addYaku(yakuList, 'yakuhai_bakaze', problem.isMenzen);
    }
    // 自風（場風と同じ場合は既に追加済みなので、別の場合のみ）
    if (tile.value === problem.seatWind && tile.value !== problem.roundWind) {
      addYaku(yakuList, 'yakuhai_jikaze', problem.isMenzen);
    }
    // 連風牌の場合は場風と自風の両方を追加
    if (tile.value === problem.seatWind && tile.value === problem.roundWind) {
      addYaku(yakuList, 'yakuhai_jikaze', problem.isMenzen);
    }
  }
}

// 混一色の判定
function checkHonitsu(problem: Problem): boolean {
  const allTiles = getAllTiles(problem);
  const suits = new Set<TileSuit>();
  let hasHonor = false;
  let hasNumber = false;

  for (const tile of allTiles) {
    if (tile.suit === 'honor') {
      hasHonor = true;
    } else {
      suits.add(tile.suit);
      hasNumber = true;
    }
  }

  // 数牌が1種類のみで、字牌も含む場合
  return suits.size === 1 && hasHonor && hasNumber;
}

// 清一色の判定
function checkChinitsu(problem: Problem): boolean {
  const allTiles = getAllTiles(problem);
  const suits = new Set<TileSuit>();

  for (const tile of allTiles) {
    if (tile.suit === 'honor') return false; // 字牌があれば清一色ではない
    suits.add(tile.suit);
  }

  return suits.size === 1;
}

// 一盃口の判定
function checkIipeikou(problem: Problem): boolean {
  if (!problem.isMenzen) return false;

  const shuntsuList = problem.mentsu.filter((m) => m.type === 'shuntsu');
  if (shuntsuList.length < 2) return false;

  // 同じ順子があるかチェック
  for (let i = 0; i < shuntsuList.length; i++) {
    for (let j = i + 1; j < shuntsuList.length; j++) {
      const a = shuntsuList[i].tiles[0];
      const b = shuntsuList[j].tiles[0];
      if (isSameTile(a, b)) {
        return true;
      }
    }
  }
  return false;
}

// 混老頭の判定
function checkHonroutou(problem: Problem): boolean {
  const allTiles = getAllTiles(problem);
  return allTiles.every((tile) => isYaochuhai(tile));
}

// 三色同順の判定
function checkSanshokuDoujun(problem: Problem): boolean {
  const shuntsuList = problem.mentsu.filter((m) => m.type === 'shuntsu');
  if (shuntsuList.length < 3) return false;

  // 各順子の開始数字とスート
  const shuntsuData = shuntsuList.map((m) => ({
    suit: m.tiles[0].suit,
    startValue: m.tiles[0].value,
  }));

  // 同じ開始数字で3種類のスートがあるかチェック
  const byStartValue = new Map<number, Set<TileSuit>>();
  for (const data of shuntsuData) {
    if (!byStartValue.has(data.startValue)) {
      byStartValue.set(data.startValue, new Set());
    }
    byStartValue.get(data.startValue)!.add(data.suit);
  }

  for (const suits of byStartValue.values()) {
    if (suits.has('man') && suits.has('pin') && suits.has('sou')) {
      return true;
    }
  }
  return false;
}

// 一気通貫の判定
function checkIttsu(problem: Problem): boolean {
  const shuntsuList = problem.mentsu.filter((m) => m.type === 'shuntsu');
  if (shuntsuList.length < 3) return false;

  // 各スートごとの順子の開始値を収集
  const bySuit = new Map<TileSuit, Set<number>>();
  for (const mentsu of shuntsuList) {
    const suit = mentsu.tiles[0].suit;
    const startValue = mentsu.tiles[0].value;
    if (!bySuit.has(suit)) {
      bySuit.set(suit, new Set());
    }
    bySuit.get(suit)!.add(startValue);
  }

  // 1, 4, 7の順子がある場合は一気通貫
  for (const startValues of bySuit.values()) {
    if (startValues.has(1) && startValues.has(4) && startValues.has(7)) {
      return true;
    }
  }
  return false;
}

// 混全帯么九の判定
function checkChanta(problem: Problem): boolean {
  // 全ての面子と雀頭が么九牌を含む必要がある
  let hasHonor = false;

  // 雀頭のチェック
  const jantouHasYaochuhai = problem.jantou.tiles.some((t) => isYaochuhai(t));
  if (!jantouHasYaochuhai) return false;

  // 雀頭が字牌なら字牌フラグを立てる
  if (problem.jantou.tiles[0].suit === 'honor') {
    hasHonor = true;
  }

  // 各面子のチェック
  for (const mentsu of problem.mentsu) {
    // 順子の場合、123または789のみ有効
    if (mentsu.type === 'shuntsu') {
      const startValue = mentsu.tiles[0].value;
      if (startValue !== 1 && startValue !== 7) {
        return false; // 123, 789以外の順子があればNG
      }
    } else {
      // 刻子・槓子の場合、么九牌である必要がある
      const tile = mentsu.tiles[0];
      if (!isYaochuhai(tile)) return false;

      // 字牌ならフラグを立てる
      if (tile.suit === 'honor') {
        hasHonor = true;
      }
    }
  }

  // 字牌が含まれていなければ純全帯么九になるため混全帯么九ではない
  return hasHonor;
}

// 純全帯么九の判定
function checkJunchan(problem: Problem): boolean {
  // 全ての面子と雀頭が么九牌を含む必要があり、字牌が含まれない

  // 雀頭のチェック
  const jantouTile = problem.jantou.tiles[0];
  if (jantouTile.suit === 'honor') return false; // 字牌があればNG
  if (jantouTile.value !== 1 && jantouTile.value !== 9) return false; // 1or9以外はNG

  // 各面子のチェック
  for (const mentsu of problem.mentsu) {
    // 順子の場合、123または789のみ有効
    if (mentsu.type === 'shuntsu') {
      const startValue = mentsu.tiles[0].value;
      if (startValue !== 1 && startValue !== 7) {
        return false;
      }
    } else {
      // 刻子・槓子の場合、1or9の数牌である必要がある
      const tile = mentsu.tiles[0];
      if (tile.suit === 'honor') return false; // 字牌があればNG
      if (tile.value !== 1 && tile.value !== 9) return false; // 1or9以外はNG
    }
  }

  return true;
}

// ドラ枚数のカウント
function countDora(problem: Problem): number {
  const allTiles = getAllTiles(problem);
  let count = 0;

  for (const indicator of problem.doraIndicators) {
    const doraTile = getDoraFromIndicator(indicator);
    count += allTiles.filter((t) => isSameTile(t, doraTile)).length;
  }

  return count;
}

// 七対子用のドラ枚数カウント
function countDoraForChiitoitsu(problem: Problem): number {
  const chiitoitsuProblem = problem as any;
  if (!chiitoitsuProblem.toitsu) return 0;

  const allTiles: Tile[] = [];
  for (const toitsu of chiitoitsuProblem.toitsu) {
    allTiles.push(...toitsu);
  }

  let count = 0;
  for (const indicator of problem.doraIndicators) {
    const doraTile = getDoraFromIndicator(indicator);
    count += allTiles.filter((t) => isSameTile(t, doraTile)).length;
  }

  return count;
}

// ドラ表示牌から実ドラを取得
function getDoraFromIndicator(indicator: Tile): Tile {
  if (indicator.suit === 'honor') {
    // 字牌: 東→南→西→北→東、白→發→中→白
    if (indicator.value <= 4) {
      const nextValue = indicator.value === 4 ? 1 : indicator.value + 1;
      return { suit: 'honor', value: nextValue };
    } else {
      const nextValue = indicator.value === 7 ? 5 : indicator.value + 1;
      return { suit: 'honor', value: nextValue };
    }
  } else {
    // 数牌: 9→1、それ以外は+1
    const nextValue = indicator.value === 9 ? 1 : indicator.value + 1;
    return { suit: indicator.suit, value: nextValue };
  }
}

// 三色同刻の判定
function checkSanshokuDoukou(problem: Problem): boolean {
  // 刻子・槓子のみを抽出
  const koutsuList = problem.mentsu.filter(
    (m) => m.type === 'koutsu' || m.type === 'kantsu'
  );
  if (koutsuList.length < 3) return false;

  // 各刻子の数字とスート
  const koutsuData = koutsuList
    .filter((m) => m.tiles[0].suit !== 'honor') // 字牌は除外
    .map((m) => ({
      suit: m.tiles[0].suit,
      value: m.tiles[0].value,
    }));

  // 同じ数字で3種類のスートがあるかチェック
  const byValue = new Map<number, Set<TileSuit>>();
  for (const data of koutsuData) {
    if (!byValue.has(data.value)) {
      byValue.set(data.value, new Set());
    }
    byValue.get(data.value)!.add(data.suit);
  }

  for (const suits of byValue.values()) {
    if (suits.has('man') && suits.has('pin') && suits.has('sou')) {
      return true;
    }
  }
  return false;
}

// 三槓子の判定
function checkSankantsu(problem: Problem): boolean {
  const kantsuCount = problem.mentsu.filter((m) => m.type === 'kantsu').length;
  return kantsuCount >= 3;
}

// 小三元の判定
function checkShousangen(problem: Problem): boolean {
  // 三元牌（白=5, 發=6, 中=7）のうち2つが刻子、1つが雀頭
  const sangenValues = [5, 6, 7]; // 白, 發, 中
  let sangenKoutsuCount = 0;
  let sangenJantou = false;

  // 面子から三元牌の刻子を数える
  for (const mentsu of problem.mentsu) {
    if (mentsu.type !== 'koutsu' && mentsu.type !== 'kantsu') continue;
    const tile = mentsu.tiles[0];
    if (tile.suit === 'honor' && sangenValues.includes(tile.value)) {
      sangenKoutsuCount++;
    }
  }

  // 雀頭が三元牌かチェック
  const jantouTile = problem.jantou.tiles[0];
  if (jantouTile.suit === 'honor' && sangenValues.includes(jantouTile.value)) {
    sangenJantou = true;
  }

  // 刻子2つ + 雀頭1つ で小三元成立
  return sangenKoutsuCount === 2 && sangenJantou;
}

// 二盃口の判定
function checkRyanpeikou(problem: Problem): boolean {
  if (!problem.isMenzen) return false;

  const shuntsuList = problem.mentsu.filter((m) => m.type === 'shuntsu');
  if (shuntsuList.length < 4) return false;

  // 順子を文字列でカウント（suit+startValue）
  const shuntsuCounts = new Map<string, number>();
  for (const mentsu of shuntsuList) {
    const key = `${mentsu.tiles[0].suit}-${mentsu.tiles[0].value}`;
    shuntsuCounts.set(key, (shuntsuCounts.get(key) || 0) + 1);
  }

  // 2組の対子（同じ順子が2つずつ）があるかチェック
  let pairCount = 0;
  for (const count of shuntsuCounts.values()) {
    if (count >= 2) {
      pairCount++;
    }
  }

  return pairCount >= 2;
}
