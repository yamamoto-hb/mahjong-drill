import { describe, it, expect } from 'vitest';
import { calculateFu, isPinfu } from './fu-calculator';
import { createTile } from './tiles';
import { Problem, Mentsu, Jantou } from './types';

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

describe('calculateFu', () => {
  describe('副底（基本符）', () => {
    it('副底は20符', () => {
      const problem = createBaseProblem();
      const result = calculateFu(problem);
      expect(result.base).toBe(20);
    });
  });

  describe('門前ロン加符', () => {
    it('門前ロンは+10符（平和でない場合）', () => {
      // 平和でない手牌（刻子を含む）で門前ロン
      const problem = createBaseProblem({
        isMenzen: true,
        winType: 'ron',
        mentsu: [
          createKoutsu('man', 5),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateFu(problem);
      expect(result.menzenRon).toBe(10);
    });

    it('門前ツモは門前ロン加符なし', () => {
      const problem = createBaseProblem({ isMenzen: true, winType: 'tsumo' });
      const result = calculateFu(problem);
      expect(result.menzenRon).toBe(0);
    });

    it('副露ロンは門前ロン加符なし', () => {
      const problem = createBaseProblem({
        isMenzen: false,
        winType: 'ron',
        mentsu: [
          createShuntsu('man', 1, true),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateFu(problem);
      expect(result.menzenRon).toBe(0);
    });
  });

  describe('ツモ符', () => {
    it('ツモは+2符', () => {
      const problem = createBaseProblem({ winType: 'tsumo' });
      // 平和ツモにならないように刻子を入れる
      problem.mentsu[0] = createKoutsu('man', 5);
      const result = calculateFu(problem);
      expect(result.tsumo).toBe(2);
    });

    it('ロンはツモ符なし', () => {
      const problem = createBaseProblem({ winType: 'ron' });
      const result = calculateFu(problem);
      expect(result.tsumo).toBe(0);
    });
  });

  describe('面子の符', () => {
    it('順子は0符', () => {
      const problem = createBaseProblem();
      const result = calculateFu(problem);
      result.mentsuFu.forEach(({ fu }) => {
        expect(fu).toBe(0);
      });
    });

    it('中張牌の明刻は2符', () => {
      const problem = createBaseProblem({
        isMenzen: false,
        mentsu: [
          createKoutsu('man', 5, true),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateFu(problem);
      expect(result.mentsuFu[0].fu).toBe(2);
    });

    it('中張牌の暗刻は4符', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('man', 5, false),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateFu(problem);
      expect(result.mentsuFu[0].fu).toBe(4);
    });

    it('么九牌の明刻は4符', () => {
      const problem = createBaseProblem({
        isMenzen: false,
        mentsu: [
          createKoutsu('man', 1, true),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateFu(problem);
      expect(result.mentsuFu[0].fu).toBe(4);
    });

    it('么九牌の暗刻は8符', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('man', 9, false),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateFu(problem);
      expect(result.mentsuFu[0].fu).toBe(8);
    });

    it('字牌の暗刻は8符', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKoutsu('honor', 7, false), // 中
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateFu(problem);
      expect(result.mentsuFu[0].fu).toBe(8);
    });

    it('中張牌の明槓は8符', () => {
      const problem = createBaseProblem({
        isMenzen: false,
        mentsu: [
          createKantsu('man', 5, true),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateFu(problem);
      expect(result.mentsuFu[0].fu).toBe(8);
    });

    it('中張牌の暗槓は16符', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKantsu('man', 5, false),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateFu(problem);
      expect(result.mentsuFu[0].fu).toBe(16);
    });

    it('么九牌の明槓は16符', () => {
      const problem = createBaseProblem({
        isMenzen: false,
        mentsu: [
          createKantsu('man', 1, true),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateFu(problem);
      expect(result.mentsuFu[0].fu).toBe(16);
    });

    it('么九牌の暗槓は32符', () => {
      const problem = createBaseProblem({
        mentsu: [
          createKantsu('man', 9, false),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateFu(problem);
      expect(result.mentsuFu[0].fu).toBe(32);
    });
  });

  describe('雀頭の符', () => {
    it('数牌の雀頭は0符', () => {
      const problem = createBaseProblem({
        jantou: createJantou('pin', 5),
      });
      const result = calculateFu(problem);
      expect(result.jantouFu).toBe(0);
    });

    it('客風牌の雀頭は0符', () => {
      const problem = createBaseProblem({
        jantou: createJantou('honor', 3), // 西（自風:東、場風:東）
        seatWind: 1,
        roundWind: 1,
      });
      const result = calculateFu(problem);
      expect(result.jantouFu).toBe(0);
    });

    it('自風牌の雀頭は2符', () => {
      const problem = createBaseProblem({
        jantou: createJantou('honor', 2), // 南が自風
        seatWind: 2,
        roundWind: 1,
      });
      const result = calculateFu(problem);
      expect(result.jantouFu).toBe(2);
    });

    it('場風牌の雀頭は2符', () => {
      const problem = createBaseProblem({
        jantou: createJantou('honor', 1), // 東が場風
        seatWind: 2,
        roundWind: 1,
      });
      const result = calculateFu(problem);
      expect(result.jantouFu).toBe(2);
    });

    it('三元牌の雀頭は2符', () => {
      const problem = createBaseProblem({
        jantou: createJantou('honor', 7), // 中
      });
      const result = calculateFu(problem);
      expect(result.jantouFu).toBe(2);
    });

    it('連風牌の雀頭は4符', () => {
      const problem = createBaseProblem({
        jantou: createJantou('honor', 1), // 東が自風かつ場風
        seatWind: 1,
        roundWind: 1,
      });
      const result = calculateFu(problem);
      expect(result.jantouFu).toBe(4);
    });
  });

  describe('待ちの符', () => {
    it('両面待ちは0符', () => {
      const problem = createBaseProblem({ waitType: 'ryanmen' });
      const result = calculateFu(problem);
      expect(result.waitFu).toBe(0);
    });

    it('シャンポン待ちは0符', () => {
      const problem = createBaseProblem({ waitType: 'shanpon' });
      const result = calculateFu(problem);
      expect(result.waitFu).toBe(0);
    });

    it('カンチャン待ちは2符', () => {
      const problem = createBaseProblem({ waitType: 'kanchan' });
      const result = calculateFu(problem);
      expect(result.waitFu).toBe(2);
    });

    it('ペンチャン待ちは2符', () => {
      const problem = createBaseProblem({ waitType: 'penchan' });
      const result = calculateFu(problem);
      expect(result.waitFu).toBe(2);
    });

    it('単騎待ちは2符', () => {
      const problem = createBaseProblem({ waitType: 'tanki' });
      const result = calculateFu(problem);
      expect(result.waitFu).toBe(2);
    });
  });

  describe('平和形の特殊処理', () => {
    it('平和ツモは20符固定', () => {
      const problem = createBaseProblem({
        isMenzen: true,
        winType: 'tsumo',
        waitType: 'ryanmen',
        jantou: createJantou('pin', 5), // 役牌でない
      });
      const result = calculateFu(problem);
      expect(result.total).toBe(20);
    });

    it('平和ロンは30符固定', () => {
      const problem = createBaseProblem({
        isMenzen: true,
        winType: 'ron',
        waitType: 'ryanmen',
        jantou: createJantou('pin', 5), // 役牌でない
      });
      const result = calculateFu(problem);
      expect(result.total).toBe(30);
    });
  });

  describe('七対子', () => {
    it('七対子は25符固定', () => {
      const problem = createBaseProblem();
      (problem as any).isChiitoitsu = true;
      const result = calculateFu(problem);
      expect(result.total).toBe(25);
    });
  });

  describe('喰い平和形', () => {
    it('喰い平和形（副露あり、全順子、20符）は30符に繰り上げ', () => {
      const problem = createBaseProblem({
        isMenzen: false,
        winType: 'ron',
        waitType: 'ryanmen',
        mentsu: [
          createShuntsu('man', 1, true),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
        jantou: createJantou('pin', 5),
      });
      const result = calculateFu(problem);
      expect(result.total).toBe(30);
    });
  });

  describe('符の切り上げ', () => {
    it('32符は40符に切り上げ', () => {
      // 副底20 + 暗刻4 + カンチャン2 + 門前ロン10 = 36 → 40
      const problem = createBaseProblem({
        isMenzen: true,
        winType: 'ron',
        waitType: 'kanchan',
        mentsu: [
          createKoutsu('man', 5, false),
          createShuntsu('pin', 4),
          createShuntsu('sou', 7),
          createShuntsu('man', 4),
        ],
      });
      const result = calculateFu(problem);
      expect(result.total).toBe(40);
    });
  });
});

describe('isPinfu', () => {
  it('平和形を正しく判定', () => {
    const problem = createBaseProblem({
      isMenzen: true,
      waitType: 'ryanmen',
      jantou: createJantou('pin', 5),
    });
    expect(isPinfu(problem)).toBe(true);
  });

  it('副露ありは平和でない', () => {
    const problem = createBaseProblem({
      isMenzen: false,
      waitType: 'ryanmen',
      mentsu: [
        createShuntsu('man', 1, true),
        createShuntsu('pin', 4),
        createShuntsu('sou', 7),
        createShuntsu('man', 4),
      ],
    });
    expect(isPinfu(problem)).toBe(false);
  });

  it('刻子を含む場合は平和でない', () => {
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
    expect(isPinfu(problem)).toBe(false);
  });

  it('役牌の雀頭は平和でない', () => {
    const problem = createBaseProblem({
      isMenzen: true,
      waitType: 'ryanmen',
      jantou: createJantou('honor', 7), // 中
    });
    expect(isPinfu(problem)).toBe(false);
  });

  it('両面待ち以外は平和でない', () => {
    const problem = createBaseProblem({
      isMenzen: true,
      waitType: 'kanchan',
    });
    expect(isPinfu(problem)).toBe(false);
  });
});
