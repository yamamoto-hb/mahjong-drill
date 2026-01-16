import { YakuDefinition } from './yaku-types';

// 役のマスターデータ
export const YAKU_LIST: YakuDefinition[] = [
  // 1翻役
  {
    id: 'riichi',
    name: 'リーチ',
    han: 1,
    hanOpen: null,
    description: '鳴いていない状態でテンパイし、1000点を供託して宣言すると成立。宣言後は手牌を変えられない。',
    exampleTiles: '123m456p789s234s11z',
    exampleNote: '門前テンパイ→リーチ宣言',
  },
  {
    id: 'menzen_tsumo',
    name: '門前清自摸和',
    han: 1,
    hanOpen: null,
    description: '鳴かずに自力でツモあがりすると成立。ロンあがりでは成立しない。',
    exampleTiles: '123m456p789s234s11z',
    exampleNote: '門前でツモあがり',
  },
  {
    id: 'tanyao',
    name: '断么九',
    han: 1,
    hanOpen: 1,
    description: '1・9・字牌を使わず、2〜8の数牌のみで手を作ると成立。',
    exampleTiles: '234m345p678s567p55s',
    exampleNote: '中張牌（2〜8）のみ',
  },
  {
    id: 'pinfu',
    name: '平和',
    han: 1,
    hanOpen: null,
    description: '順子4つ＋役牌以外の雀頭＋両面待ちで構成。符がつかない最も基本的な形。',
    exampleTiles: '123m456p789s234s44p',
    exampleNote: '順子×4+両面待ち',
  },
  {
    id: 'iipeikou',
    name: '一盃口',
    han: 1,
    hanOpen: null,
    description: '同じ種類で同じ並びの順子が2組あると成立。例：123+123。',
    exampleTiles: '112233m456p789s11z',
    exampleNote: '同じ順子が2組',
  },
  {
    id: 'yakuhai_haku',
    name: '役牌（白）',
    han: 1,
    hanOpen: 1,
    description: '白を3枚揃えて刻子・槓子にすると成立。ポンしてもOK。',
    exampleTiles: '555z',
    exampleNote: '白の刻子',
  },
  {
    id: 'yakuhai_hatsu',
    name: '役牌（發）',
    han: 1,
    hanOpen: 1,
    description: '發を3枚揃えて刻子・槓子にすると成立。ポンしてもOK。',
    exampleTiles: '666z',
    exampleNote: '發の刻子',
  },
  {
    id: 'yakuhai_chun',
    name: '役牌（中）',
    han: 1,
    hanOpen: 1,
    description: '中を3枚揃えて刻子・槓子にすると成立。ポンしてもOK。',
    exampleTiles: '777z',
    exampleNote: '中の刻子',
  },
  {
    id: 'yakuhai_bakaze',
    name: '役牌（場風）',
    han: 1,
    hanOpen: 1,
    description: '場風牌（東場なら東、南場なら南）を3枚揃えると成立。',
    exampleTiles: '111z',
    exampleNote: '東場なら東の刻子',
  },
  {
    id: 'yakuhai_jikaze',
    name: '役牌（自風）',
    han: 1,
    hanOpen: 1,
    description: '自風牌（東家なら東、南家なら南など）を3枚揃えると成立。',
    exampleTiles: '111z',
    exampleNote: '自分の風の刻子',
  },
  // 2翻役
  {
    id: 'sanshoku_doujun',
    name: '三色同順',
    han: 2,
    hanOpen: 1,
    description: '萬子・筒子・索子で同じ数字の順子を揃える。例：123m+123p+123s。',
    exampleTiles: '123m123p123s456m11z',
    exampleNote: '3色で同じ順子',
  },
  {
    id: 'ittsu',
    name: '一気通貫',
    han: 2,
    hanOpen: 1,
    description: '同じ種類の数牌で123・456・789の順子を全て揃えると成立。',
    exampleTiles: '123456789m234p11z',
    exampleNote: '1〜9を順子で',
  },
  {
    id: 'chanta',
    name: '混全帯么九',
    han: 2,
    hanOpen: 1,
    description: '全ての面子と雀頭に1・9・字牌のいずれかが含まれていると成立。',
    exampleTiles: '123m789p111z789s77z',
    exampleNote: '全てに1,9,字牌',
  },
  {
    id: 'toitoi',
    name: '対々和',
    han: 2,
    hanOpen: 2,
    description: '4面子を全て刻子（3枚同じ）で揃えると成立。順子が1つもない形。',
    exampleTiles: '111m555p999s333m11z',
    exampleNote: '刻子×4',
  },
  {
    id: 'sanankou',
    name: '三暗刻',
    han: 2,
    hanOpen: 2,
    description: '自力で揃えた暗刻が3組あると成立。ポンした刻子はカウントしない。',
    exampleTiles: '111m555p999s234m11z',
    exampleNote: '暗刻×3',
  },
  {
    id: 'sanshoku_doukou',
    name: '三色同刻',
    han: 2,
    hanOpen: 2,
    description: '萬子・筒子・索子で同じ数字の刻子を揃える。例：111m+111p+111s。',
    exampleTiles: '111m111p111s234m11z',
    exampleNote: '3色で同じ刻子',
  },
  {
    id: 'sankantsu',
    name: '三槓子',
    han: 2,
    hanOpen: 2,
    description: 'カンを3回して槓子を3組作ると成立。暗槓でも明槓でもOK。',
    exampleTiles: '1111m2222p3333s11z',
    exampleNote: '槓子×3',
  },
  {
    id: 'honroutou',
    name: '混老頭',
    han: 2,
    hanOpen: 2,
    description: '1・9・字牌のみで構成。必ず対々和か七対子と複合する。',
    exampleTiles: '111m999p111s999m11z',
    exampleNote: '1,9,字牌のみ',
  },
  {
    id: 'shousangen',
    name: '小三元',
    han: 2,
    hanOpen: 2,
    description: '白・發・中のうち2つを刻子、1つを雀頭にする。役牌と複合で実質4翻。',
    exampleTiles: '555z666z77z234m11p',
    exampleNote: '三元牌2刻子+1雀頭',
  },
  {
    id: 'chiitoitsu',
    name: '七対子',
    han: 2,
    hanOpen: null,
    description: '7組の対子（2枚ずつ）で構成する特殊な形。同じ牌4枚は2対子にできない。',
    exampleTiles: '1199m2288p1177s11z',
    exampleNote: '対子×7',
  },
  {
    id: 'double_riichi',
    name: 'ダブルリーチ',
    han: 2,
    hanOpen: null,
    description: '配牌でテンパイし、第1打牌でリーチを宣言すると成立。非常に稀。',
    exampleTiles: '123m456p789s234s11z',
    exampleNote: '配牌テンパイ',
  },
  // 3翻役
  {
    id: 'honitsu',
    name: '混一色',
    han: 3,
    hanOpen: 2,
    description: '1種類の数牌と字牌のみで構成。例：萬子と字牌だけで手を作る。',
    exampleTiles: '123456789m111z11z',
    exampleNote: '1種の数牌+字牌',
  },
  {
    id: 'junchan',
    name: '純全帯么九',
    han: 3,
    hanOpen: 2,
    description: '全ての面子と雀頭に1か9を含む。チャンタと違い字牌は使えない。',
    exampleTiles: '123m789p111s789m99s',
    exampleNote: '全てに1か9',
  },
  {
    id: 'ryanpeikou',
    name: '二盃口',
    han: 3,
    hanOpen: null,
    description: '一盃口が2組ある形。例：112233m+445566p。',
    exampleTiles: '112233m445566p11z',
    exampleNote: '一盃口×2',
  },
  // 6翻役
  {
    id: 'chinitsu',
    name: '清一色',
    han: 6,
    hanOpen: 5,
    description: '1種類の数牌のみで構成。字牌も使えない。読みが難しく高得点。',
    exampleTiles: '11123456789m99m',
    exampleNote: '1種の数牌のみ',
  },
];

// 役をIDで検索
export function getYakuById(id: string): YakuDefinition | undefined {
  return YAKU_LIST.find((y) => y.id === id);
}

// 役をカテゴリ（翻数）でグループ化
export function getYakuByHan(): Map<number, YakuDefinition[]> {
  const grouped = new Map<number, YakuDefinition[]>();
  for (const yaku of YAKU_LIST) {
    const han = yaku.han;
    if (!grouped.has(han)) {
      grouped.set(han, []);
    }
    grouped.get(han)!.push(yaku);
  }
  return grouped;
}
