import { Tile, TileSuit, HonorType } from './types';

// 数字の漢字
export const NUMBER_KANJI = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

// 字牌の名前
export const HONOR_NAMES: Record<HonorType, string> = {
  ton: '東',
  nan: '南',
  sha: '西',
  pei: '北',
  haku: '白',
  hatsu: '發',
  chun: '中',
};

// 字牌のvalue→HonorTypeマッピング
// 画像ファイル: ji5=發, ji6=白, ji7=中
export const VALUE_TO_HONOR: Record<number, HonorType> = {
  1: 'ton',
  2: 'nan',
  3: 'sha',
  4: 'pei',
  5: 'hatsu',
  6: 'haku',
  7: 'chun',
};

// 牌を作成
export function createTile(suit: TileSuit, value: number): Tile {
  const tile: Tile = { suit, value };
  if (suit === 'honor') {
    tile.honorType = VALUE_TO_HONOR[value];
  }
  return tile;
}

// 牌が么九牌かどうか
export function isYaochuhai(tile: Tile): boolean {
  if (tile.suit === 'honor') return true;
  return tile.value === 1 || tile.value === 9;
}

// 牌が中張牌かどうか
export function isChunchanhai(tile: Tile): boolean {
  if (tile.suit === 'honor') return false;
  return tile.value >= 2 && tile.value <= 8;
}

// 牌が同じかどうか
export function isSameTile(a: Tile, b: Tile): boolean {
  return a.suit === b.suit && a.value === b.value;
}

// 牌の表示名を取得
export function getTileName(tile: Tile): string {
  if (tile.suit === 'honor' && tile.honorType) {
    return HONOR_NAMES[tile.honorType];
  }
  const suitNames: Record<TileSuit, string> = {
    man: '萬',
    pin: '筒',
    sou: '索',
    honor: '',
  };
  return `${NUMBER_KANJI[tile.value]}${suitNames[tile.suit]}`;
}

// 牌のソート用比較関数
export function compareTiles(a: Tile, b: Tile): number {
  const suitOrder: Record<TileSuit, number> = { man: 0, pin: 1, sou: 2, honor: 3 };
  if (a.suit !== b.suit) {
    return suitOrder[a.suit] - suitOrder[b.suit];
  }
  return a.value - b.value;
}

// 字牌が役牌かどうか（自風・場風・三元牌）
export function isYakuhai(tile: Tile, seatWind: number, roundWind: number): boolean {
  if (tile.suit !== 'honor') return false;
  // 三元牌（白發中）
  if (tile.value >= 5) return true;
  // 自風
  if (tile.value === seatWind) return true;
  // 場風
  if (tile.value === roundWind) return true;
  return false;
}

// 連風牌かどうか（自風と場風が同じ）
export function isDoubleWind(tile: Tile, seatWind: number, roundWind: number): boolean {
  if (tile.suit !== 'honor') return false;
  if (tile.value > 4) return false; // 風牌のみ
  return tile.value === seatWind && tile.value === roundWind;
}

// 牌表記をパースしてTile配列に変換
// 例: "123m456p789s11z" → [1萬,2萬,3萬,4筒,5筒,6筒,7索,8索,9索,東,東]
export function parseTileNotation(notation: string): Tile[] {
  const tiles: Tile[] = [];
  const suitMap: Record<string, TileSuit> = {
    m: 'man',
    p: 'pin',
    s: 'sou',
    z: 'honor',
  };

  let numbers: number[] = [];

  for (const char of notation) {
    if (char >= '1' && char <= '9') {
      numbers.push(parseInt(char, 10));
    } else if (suitMap[char]) {
      const suit = suitMap[char];
      for (const value of numbers) {
        tiles.push(createTile(suit, value));
      }
      numbers = [];
    }
  }

  return tiles;
}
