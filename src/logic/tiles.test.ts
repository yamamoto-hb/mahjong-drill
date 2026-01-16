import { describe, it, expect } from 'vitest';
import {
  createTile,
  isYaochuhai,
  isChunchanhai,
  isSameTile,
  getTileName,
  compareTiles,
  isYakuhai,
  isDoubleWind,
  parseTileNotation,
} from './tiles';

describe('createTile', () => {
  it('数牌を正しく作成', () => {
    const tile = createTile('man', 5);
    expect(tile.suit).toBe('man');
    expect(tile.value).toBe(5);
    expect(tile.honorType).toBeUndefined();
  });

  it('字牌を正しく作成（東）', () => {
    const tile = createTile('honor', 1);
    expect(tile.suit).toBe('honor');
    expect(tile.value).toBe(1);
    expect(tile.honorType).toBe('ton');
  });

  it('字牌を正しく作成（南）', () => {
    const tile = createTile('honor', 2);
    expect(tile.honorType).toBe('nan');
  });

  it('字牌を正しく作成（西）', () => {
    const tile = createTile('honor', 3);
    expect(tile.honorType).toBe('sha');
  });

  it('字牌を正しく作成（北）', () => {
    const tile = createTile('honor', 4);
    expect(tile.honorType).toBe('pei');
  });

  it('字牌を正しく作成（發）', () => {
    const tile = createTile('honor', 5);
    expect(tile.honorType).toBe('hatsu');
  });

  it('字牌を正しく作成（白）', () => {
    const tile = createTile('honor', 6);
    expect(tile.honorType).toBe('haku');
  });

  it('字牌を正しく作成（中）', () => {
    const tile = createTile('honor', 7);
    expect(tile.honorType).toBe('chun');
  });
});

describe('isYaochuhai', () => {
  it('1は么九牌', () => {
    expect(isYaochuhai(createTile('man', 1))).toBe(true);
    expect(isYaochuhai(createTile('pin', 1))).toBe(true);
    expect(isYaochuhai(createTile('sou', 1))).toBe(true);
  });

  it('9は么九牌', () => {
    expect(isYaochuhai(createTile('man', 9))).toBe(true);
    expect(isYaochuhai(createTile('pin', 9))).toBe(true);
    expect(isYaochuhai(createTile('sou', 9))).toBe(true);
  });

  it('字牌は么九牌', () => {
    expect(isYaochuhai(createTile('honor', 1))).toBe(true);
    expect(isYaochuhai(createTile('honor', 7))).toBe(true);
  });

  it('2-8は么九牌でない', () => {
    expect(isYaochuhai(createTile('man', 2))).toBe(false);
    expect(isYaochuhai(createTile('pin', 5))).toBe(false);
    expect(isYaochuhai(createTile('sou', 8))).toBe(false);
  });
});

describe('isChunchanhai', () => {
  it('2-8は中張牌', () => {
    expect(isChunchanhai(createTile('man', 2))).toBe(true);
    expect(isChunchanhai(createTile('pin', 5))).toBe(true);
    expect(isChunchanhai(createTile('sou', 8))).toBe(true);
  });

  it('1, 9は中張牌でない', () => {
    expect(isChunchanhai(createTile('man', 1))).toBe(false);
    expect(isChunchanhai(createTile('pin', 9))).toBe(false);
  });

  it('字牌は中張牌でない', () => {
    expect(isChunchanhai(createTile('honor', 1))).toBe(false);
    expect(isChunchanhai(createTile('honor', 7))).toBe(false);
  });
});

describe('isSameTile', () => {
  it('同じ牌を判定', () => {
    const tile1 = createTile('man', 5);
    const tile2 = createTile('man', 5);
    expect(isSameTile(tile1, tile2)).toBe(true);
  });

  it('異なる牌を判定', () => {
    expect(isSameTile(createTile('man', 5), createTile('man', 6))).toBe(false);
    expect(isSameTile(createTile('man', 5), createTile('pin', 5))).toBe(false);
  });
});

describe('getTileName', () => {
  it('萬子の名前を取得', () => {
    expect(getTileName(createTile('man', 1))).toBe('一萬');
    expect(getTileName(createTile('man', 5))).toBe('五萬');
    expect(getTileName(createTile('man', 9))).toBe('九萬');
  });

  it('筒子の名前を取得', () => {
    expect(getTileName(createTile('pin', 1))).toBe('一筒');
    expect(getTileName(createTile('pin', 5))).toBe('五筒');
  });

  it('索子の名前を取得', () => {
    expect(getTileName(createTile('sou', 1))).toBe('一索');
    expect(getTileName(createTile('sou', 9))).toBe('九索');
  });

  it('字牌の名前を取得', () => {
    expect(getTileName(createTile('honor', 1))).toBe('東');
    expect(getTileName(createTile('honor', 2))).toBe('南');
    expect(getTileName(createTile('honor', 3))).toBe('西');
    expect(getTileName(createTile('honor', 4))).toBe('北');
    expect(getTileName(createTile('honor', 5))).toBe('發');
    expect(getTileName(createTile('honor', 6))).toBe('白');
    expect(getTileName(createTile('honor', 7))).toBe('中');
  });
});

describe('compareTiles', () => {
  it('種類でソート（萬子 < 筒子 < 索子 < 字牌）', () => {
    expect(compareTiles(createTile('man', 1), createTile('pin', 1))).toBeLessThan(0);
    expect(compareTiles(createTile('pin', 1), createTile('sou', 1))).toBeLessThan(0);
    expect(compareTiles(createTile('sou', 1), createTile('honor', 1))).toBeLessThan(0);
  });

  it('同じ種類は数字でソート', () => {
    expect(compareTiles(createTile('man', 1), createTile('man', 5))).toBeLessThan(0);
    expect(compareTiles(createTile('man', 9), createTile('man', 1))).toBeGreaterThan(0);
    expect(compareTiles(createTile('man', 5), createTile('man', 5))).toBe(0);
  });
});

describe('isYakuhai', () => {
  it('三元牌は役牌', () => {
    expect(isYakuhai(createTile('honor', 5), 1, 1)).toBe(true); // 發
    expect(isYakuhai(createTile('honor', 6), 1, 1)).toBe(true); // 白
    expect(isYakuhai(createTile('honor', 7), 1, 1)).toBe(true); // 中
  });

  it('自風牌は役牌', () => {
    // 自風:東の場合
    expect(isYakuhai(createTile('honor', 1), 1, 2)).toBe(true);
    // 自風:南の場合
    expect(isYakuhai(createTile('honor', 2), 2, 1)).toBe(true);
  });

  it('場風牌は役牌', () => {
    // 場風:東の場合
    expect(isYakuhai(createTile('honor', 1), 2, 1)).toBe(true);
    // 場風:南の場合
    expect(isYakuhai(createTile('honor', 2), 1, 2)).toBe(true);
  });

  it('客風牌は役牌でない', () => {
    // 自風:東、場風:東で西は客風
    expect(isYakuhai(createTile('honor', 3), 1, 1)).toBe(false);
    // 北も客風
    expect(isYakuhai(createTile('honor', 4), 1, 1)).toBe(false);
  });

  it('数牌は役牌でない', () => {
    expect(isYakuhai(createTile('man', 1), 1, 1)).toBe(false);
    expect(isYakuhai(createTile('pin', 5), 1, 1)).toBe(false);
  });
});

describe('isDoubleWind', () => {
  it('自風と場風が同じ場合は連風牌', () => {
    // 東場の東家で東
    expect(isDoubleWind(createTile('honor', 1), 1, 1)).toBe(true);
    // 南場の南家で南
    expect(isDoubleWind(createTile('honor', 2), 2, 2)).toBe(true);
  });

  it('自風と場風が異なる場合は連風牌でない', () => {
    // 東場の南家で東
    expect(isDoubleWind(createTile('honor', 1), 2, 1)).toBe(false);
    // 南場の東家で南
    expect(isDoubleWind(createTile('honor', 2), 1, 2)).toBe(false);
  });

  it('三元牌は連風牌でない', () => {
    expect(isDoubleWind(createTile('honor', 5), 1, 1)).toBe(false);
    expect(isDoubleWind(createTile('honor', 7), 1, 1)).toBe(false);
  });

  it('数牌は連風牌でない', () => {
    expect(isDoubleWind(createTile('man', 1), 1, 1)).toBe(false);
  });
});

describe('parseTileNotation', () => {
  it('萬子をパース', () => {
    const tiles = parseTileNotation('123m');
    expect(tiles).toHaveLength(3);
    expect(tiles[0]).toEqual({ suit: 'man', value: 1 });
    expect(tiles[1]).toEqual({ suit: 'man', value: 2 });
    expect(tiles[2]).toEqual({ suit: 'man', value: 3 });
  });

  it('筒子をパース', () => {
    const tiles = parseTileNotation('456p');
    expect(tiles).toHaveLength(3);
    expect(tiles[0]).toEqual({ suit: 'pin', value: 4 });
    expect(tiles[1]).toEqual({ suit: 'pin', value: 5 });
    expect(tiles[2]).toEqual({ suit: 'pin', value: 6 });
  });

  it('索子をパース', () => {
    const tiles = parseTileNotation('789s');
    expect(tiles).toHaveLength(3);
    expect(tiles[0]).toEqual({ suit: 'sou', value: 7 });
    expect(tiles[1]).toEqual({ suit: 'sou', value: 8 });
    expect(tiles[2]).toEqual({ suit: 'sou', value: 9 });
  });

  it('字牌をパース', () => {
    const tiles = parseTileNotation('1234567z');
    expect(tiles).toHaveLength(7);
    expect(tiles[0].honorType).toBe('ton');
    expect(tiles[6].honorType).toBe('chun');
  });

  it('複合表記をパース', () => {
    const tiles = parseTileNotation('123m456p789s11z');
    expect(tiles).toHaveLength(11);
    expect(tiles[0].suit).toBe('man');
    expect(tiles[3].suit).toBe('pin');
    expect(tiles[6].suit).toBe('sou');
    expect(tiles[9].suit).toBe('honor');
  });

  it('空文字列は空配列を返す', () => {
    const tiles = parseTileNotation('');
    expect(tiles).toHaveLength(0);
  });
});
