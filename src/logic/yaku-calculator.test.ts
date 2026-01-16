import { describe, it, expect } from 'vitest';
import { calculateYaku } from './yaku-calculator';
import { generateProblem, ProblemWithYaku } from './problem-generator';
import { createTile } from './tiles';
import { Problem, Mentsu, Jantou } from './types';
import { YAKU_LIST } from './yaku-list';

// テスト用のヘルパー関数
function createShuntsu(suit: 'man' | 'pin' | 'sou', startValue: number, isOpen = false): Mentsu {
  return {
    type: 'shuntsu',
    tiles: [
      createTile(suit, startValue),
      createTile(suit, startValue + 1),
      createTile(suit, startValue + 2),
    ],
    isOpen,
  };
}

function createKoutsu(suit: 'man' | 'pin' | 'sou' | 'honor', value: number, isOpen = false): Mentsu {
  const tile = createTile(suit, value);
  return {
    type: 'koutsu',
    tiles: [tile, { ...tile }, { ...tile }],
    isOpen,
  };
}

function createKantsu(suit: 'man' | 'pin' | 'sou' | 'honor', value: number, isOpen = false): Mentsu {
  const tile = createTile(suit, value);
  return {
    type: 'kantsu',
    tiles: [tile, { ...tile }, { ...tile }, { ...tile }],
    isOpen,
  };
}

function createJantou(suit: 'man' | 'pin' | 'sou' | 'honor', value: number): Jantou {
  const tile = createTile(suit, value);
  return { tiles: [tile, { ...tile }] };
}

function createBaseProblem(overrides: Partial<Problem> = {}): Problem {
  return {
    mentsu: [
      createShuntsu('man', 1),
      createShuntsu('pin', 4),
      createShuntsu('sou', 7),
      createShuntsu('man', 4),
    ],
    jantou: createJantou('pin', 5),
    winType: 'ron',
    playerType: 'ko',
    waitType: 'ryanmen',
    winningTile: createTile('man', 1),
    han: 1,
    isMenzen: true,
    seatWind: 1,
    roundWind: 1,
    doraIndicators: [],
    ...overrides,
  };
}

describe('calculateYaku - 個別役の判定', () => {
  describe('断么九', () => {
    it('中張牌のみで成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 2),
          createShuntsu('pin', 3),
          createShuntsu('sou', 4),
          createShuntsu('man', 5),
        ],
        jantou: createJantou('pin', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'tanyao')).toBe(true);
    });

    it('么九牌を含むと成立しない', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1), // 1を含む
          createShuntsu('pin', 3),
          createShuntsu('sou', 4),
          createShuntsu('man', 5),
        ],
        jantou: createJantou('pin', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'tanyao')).toBe(false);
    });
  });

  describe('平和', () => {
    it('門前・順子のみ・役牌以外の雀頭・両面待ちで成立', () => {
      const problem = createBaseProblem({
        isMenzen: true,
        waitType: 'ryanmen',
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
        jantou: createJantou('pin', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'pinfu')).toBe(true);
    });

    it('刻子を含むと成立しない', () => {
      const problem = createBaseProblem({
        isMenzen: true,
        waitType: 'ryanmen',
        mentsu: [
          createKoutsu('man', 5),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'pinfu')).toBe(false);
    });
  });

  describe('対々和', () => {
    it('全て刻子で成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('man', 1),
          createKoutsu('pin', 5),
          createKoutsu('sou', 9),
          createKoutsu('honor', 7),
        ],
        jantou: createJantou('pin', 3),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'toitoi')).toBe(true);
    });

    it('順子を含むと成立しない', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('man', 1),
          createKoutsu('pin', 5),
          createKoutsu('sou', 9),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'toitoi')).toBe(false);
    });
  });

  describe('役牌', () => {
    it('白の刻子で成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('honor', 6), // 白
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'yakuhai_haku')).toBe(true);
    });

    it('發の刻子で成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('honor', 5), // 發
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'yakuhai_hatsu')).toBe(true);
    });

    it('中の刻子で成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('honor', 7), // 中
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'yakuhai_chun')).toBe(true);
    });

    it('場風牌の刻子で成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('honor', 1), // 東
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
        roundWind: 1, // 東場
        seatWind: 2,  // 南家
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'yakuhai_bakaze')).toBe(true);
    });

    it('自風牌の刻子で成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('honor', 2), // 南
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
        roundWind: 1, // 東場
        seatWind: 2,  // 南家
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'yakuhai_jikaze')).toBe(true);
    });

    it('連風牌で場風と自風の両方が成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('honor', 1), // 東
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
        roundWind: 1, // 東場
        seatWind: 1,  // 東家
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'yakuhai_bakaze')).toBe(true);
      expect(result.yakuList.some(y => y.id === 'yakuhai_jikaze')).toBe(true);
    });
  });

  describe('混一色', () => {
    it('1種類の数牌と字牌で成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('man', 4),
          createShuntsu('man', 7),
          createKoutsu('honor', 7),
        ],
        jantou: createJantou('man', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'honitsu')).toBe(true);
    });

    it('2種類の数牌があると成立しない', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('man', 4),
          createShuntsu('pin', 7), // 筒子が混ざっている
          createKoutsu('honor', 7),
        ],
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'honitsu')).toBe(false);
    });
  });

  describe('清一色', () => {
    it('1種類の数牌のみで成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('man', 4),
          createShuntsu('man', 4),
          createKoutsu('man', 9),
        ],
        jantou: createJantou('man', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'chinitsu')).toBe(true);
    });

    it('字牌を含むと成立しない（混一色になる）', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('man', 4),
          createShuntsu('man', 7),
          createKoutsu('honor', 7),
        ],
        jantou: createJantou('man', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'chinitsu')).toBe(false);
    });
  });

  describe('三色同順', () => {
    it('3種類で同じ数字の順子で成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('pin', 1),
          createShuntsu('sou', 1),
          createShuntsu('man', 4),
        ],
        jantou: createJantou('pin', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'sanshoku_doujun')).toBe(true);
    });

    it('異なる数字だと成立しない', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('pin', 2), // 開始数字が異なる
          createShuntsu('sou', 1),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'sanshoku_doujun')).toBe(false);
    });
  });

  describe('一気通貫', () => {
    it('同じ種類で123,456,789で成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('man', 4),
          createShuntsu('man', 7),
          createShuntsu('pin', 4),
        ],
        jantou: createJantou('sou', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'ittsu')).toBe(true);
    });

    it('異なる種類だと成立しない', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('pin', 4), // 異なる種類
          createShuntsu('man', 7),
          createShuntsu('sou', 4),
        ],
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'ittsu')).toBe(false);
    });
  });

  describe('混全帯么九', () => {
    it('全ての面子・雀頭に么九牌を含み字牌もあると成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1), // 123
          createShuntsu('pin', 7), // 789
          createKoutsu('honor', 7), // 字牌刻子
          createShuntsu('sou', 1), // 123
        ],
        jantou: createJantou('honor', 1), // 字牌雀頭
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'chanta')).toBe(true);
    });

    it('中張牌のみの面子があると成立しない', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('pin', 4), // 456は中張牌
          createKoutsu('honor', 7),
          createShuntsu('sou', 1),
        ],
        jantou: createJantou('honor', 1),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'chanta')).toBe(false);
    });
  });

  describe('純全帯么九', () => {
    it('全ての面子・雀頭に1,9を含み字牌なしで成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1), // 123
          createShuntsu('pin', 7), // 789
          createKoutsu('sou', 9), // 9の刻子
          createShuntsu('man', 7), // 789
        ],
        jantou: createJantou('pin', 1), // 1の雀頭
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'junchan')).toBe(true);
    });

    it('字牌があると成立しない（チャンタになる）', () => {
      const problem = createBaseProblem({
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('pin', 7),
          createKoutsu('honor', 7), // 字牌
          createShuntsu('sou', 1),
        ],
        jantou: createJantou('man', 1),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'junchan')).toBe(false);
    });
  });

  describe('一盃口', () => {
    it('同じ順子2組で成立（門前限定）', () => {
      const problem = createBaseProblem({
        isMenzen: true,
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('man', 1), // 同じ順子
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
        ],
        jantou: createJantou('pin', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'iipeikou')).toBe(true);
    });

    it('副露していると成立しない', () => {
      const problem = createBaseProblem({
        isMenzen: false,
        mentsu: [
          createShuntsu('man', 1, true),
          createShuntsu('man', 1),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
        ],
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'iipeikou')).toBe(false);
    });
  });

  describe('混老頭', () => {
    it('全て么九牌で成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('man', 1),
          createKoutsu('pin', 9),
          createKoutsu('sou', 1),
          createKoutsu('honor', 7),
        ],
        jantou: createJantou('honor', 1),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'honroutou')).toBe(true);
    });

    it('中張牌があると成立しない', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('man', 1),
          createKoutsu('pin', 5), // 中張牌
          createKoutsu('sou', 1),
          createKoutsu('honor', 7),
        ],
        jantou: createJantou('honor', 1),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'honroutou')).toBe(false);
    });
  });

  describe('三暗刻', () => {
    it('暗刻3つで成立', () => {
      const problem = createBaseProblem({
        winType: 'tsumo',
        mentsu: [
          createKoutsu('man', 1, false),
          createKoutsu('pin', 5, false),
          createKoutsu('sou', 9, false),
          createShuntsu('man', 4),
        ],
        jantou: createJantou('pin', 3),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'sanankou')).toBe(true);
    });

    it('明刻が含まれると成立しない（暗刻が2つ以下）', () => {
      const problem = createBaseProblem({
        winType: 'tsumo',
        isMenzen: false,
        mentsu: [
          createKoutsu('man', 1, false),
          createKoutsu('pin', 5, true), // 明刻
          createKoutsu('sou', 9, false),
          createShuntsu('man', 4),
        ],
        jantou: createJantou('pin', 3),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'sanankou')).toBe(false);
    });
  });

  describe('三色同刻', () => {
    it('3種類で同じ数字の刻子で成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('man', 5),
          createKoutsu('pin', 5),
          createKoutsu('sou', 5),
          createShuntsu('man', 1),
        ],
        jantou: createJantou('pin', 9),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'sanshoku_doukou')).toBe(true);
    });

    it('異なる数字だと成立しない', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('man', 5),
          createKoutsu('pin', 6), // 異なる数字
          createKoutsu('sou', 5),
          createShuntsu('man', 1),
        ],
        jantou: createJantou('pin', 9),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'sanshoku_doukou')).toBe(false);
    });
  });

  describe('三槓子', () => {
    it('槓子3つで成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKantsu('man', 1),
          createKantsu('pin', 5),
          createKantsu('sou', 9),
          createShuntsu('man', 4),
        ],
        jantou: createJantou('pin', 3),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'sankantsu')).toBe(true);
    });

    it('槓子2つでは成立しない', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKantsu('man', 1),
          createKantsu('pin', 5),
          createKoutsu('sou', 9), // 刻子
          createShuntsu('man', 4),
        ],
        jantou: createJantou('pin', 3),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'sankantsu')).toBe(false);
    });
  });

  describe('小三元', () => {
    it('三元牌2刻子+1雀頭で成立', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('honor', 5), // 發
          createKoutsu('honor', 6), // 白
          createShuntsu('man', 1),
          createShuntsu('pin', 4),
        ],
        jantou: createJantou('honor', 7), // 中
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'shousangen')).toBe(true);
    });

    it('三元牌3刻子は小三元でない（大三元）', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('honor', 5), // 發
          createKoutsu('honor', 6), // 白
          createKoutsu('honor', 7), // 中
          createShuntsu('man', 1),
        ],
        jantou: createJantou('pin', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'shousangen')).toBe(false);
    });

    it('三元牌1刻子+1雀頭では成立しない', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('honor', 5), // 發
          createShuntsu('man', 1),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
        ],
        jantou: createJantou('honor', 7), // 中
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'shousangen')).toBe(false);
    });
  });

  describe('二盃口', () => {
    it('同じ順子2組×2で成立（門前限定）', () => {
      const problem = createBaseProblem({
        isMenzen: true,
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('man', 1), // 1組目の一盃口
          createShuntsu('pin', 4),
          createShuntsu('pin', 4), // 2組目の一盃口
        ],
        jantou: createJantou('sou', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'ryanpeikou')).toBe(true);
    });

    it('二盃口成立時は一盃口は成立しない', () => {
      const problem = createBaseProblem({
        isMenzen: true,
        mentsu: [
          createShuntsu('man', 1),
          createShuntsu('man', 1),
          createShuntsu('pin', 4),
          createShuntsu('pin', 4),
        ],
        jantou: createJantou('sou', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'ryanpeikou')).toBe(true);
      expect(result.yakuList.some(y => y.id === 'iipeikou')).toBe(false);
    });

    it('副露していると成立しない', () => {
      const problem = createBaseProblem({
        isMenzen: false,
        mentsu: [
          createShuntsu('man', 1, true),
          createShuntsu('man', 1),
          createShuntsu('pin', 4),
          createShuntsu('pin', 4),
        ],
        jantou: createJantou('sou', 5),
      });
      const result = calculateYaku(problem);
      expect(result.yakuList.some(y => y.id === 'ryanpeikou')).toBe(false);
    });
  });
});

describe('役の出現頻度テスト', () => {
  it('1000回問題を生成して役の出現頻度をカウント', () => {
    const yakuCounts: Record<string, number> = {};

    // 全ての役をカウント対象として初期化
    for (const yaku of YAKU_LIST) {
      yakuCounts[yaku.id] = 0;
    }
    yakuCounts['dora'] = 0; // ドラも追加

    const totalProblems = 1000;
    const difficulties = ['beginner', 'intermediate', 'advanced'] as const;

    for (let i = 0; i < totalProblems; i++) {
      const difficulty = difficulties[i % 3];
      const problem = generateProblem(difficulty) as ProblemWithYaku;

      if (problem.yakuResult) {
        for (const yaku of problem.yakuResult.yakuList) {
          yakuCounts[yaku.id] = (yakuCounts[yaku.id] || 0) + 1;
        }
        if (problem.yakuResult.doraCount > 0) {
          yakuCounts['dora']++;
        }
      }
    }

    // 結果を出現回数順にソートして表示
    console.log('\n=== 役の出現頻度（1000回生成） ===');
    const sortedYaku = Object.entries(yakuCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => {
        const yakuDef = YAKU_LIST.find(y => y.id === id);
        const name = yakuDef?.name || id;
        const percentage = ((count / totalProblems) * 100).toFixed(1);
        return { id, name, count, percentage };
      });

    console.log('');
    console.log('| 役名 | 出現回数 | 出現率 |');
    console.log('|------|----------|--------|');
    for (const { name, count, percentage } of sortedYaku) {
      if (count > 0) {
        console.log(`| ${name.padEnd(12)} | ${count.toString().padStart(8)} | ${percentage.padStart(5)}% |`);
      }
    }

    console.log('');
    console.log('--- 出現しなかった役 ---');
    for (const { id, name, count } of sortedYaku) {
      if (count === 0) {
        console.log(`  - ${name} (${id})`);
      }
    }

    // 基本的な検証
    expect(yakuCounts['riichi']).toBeGreaterThan(0); // リーチは出現するはず
    expect(totalProblems).toBe(1000);
  });
});
