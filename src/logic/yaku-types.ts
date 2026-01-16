// 役のID
export type YakuId =
  // 1翻役
  | 'riichi'
  | 'menzen_tsumo'
  | 'tanyao'
  | 'pinfu'
  | 'iipeikou'
  | 'yakuhai_haku'
  | 'yakuhai_hatsu'
  | 'yakuhai_chun'
  | 'yakuhai_bakaze'
  | 'yakuhai_jikaze'
  // 2翻役
  | 'sanshoku_doujun'
  | 'ittsu'
  | 'chanta'
  | 'toitoi'
  | 'sanankou'
  | 'sanshoku_doukou'
  | 'sankantsu'
  | 'honroutou'
  | 'shousangen'
  | 'chiitoitsu'
  | 'double_riichi'
  // 3翻役
  | 'honitsu'
  | 'junchan'
  | 'ryanpeikou'
  // 6翻役
  | 'chinitsu';

// サンプル牌の簡易表記（m=萬子, p=筒子, s=索子, z=字牌1-7=東南西北白發中）
export type TileNotation = string; // 例: "123m456p789s11z"

// 役の定義
export interface YakuDefinition {
  id: YakuId;
  name: string; // 日本語名
  han: number; // 翻数（門前）
  hanOpen: number | null; // 翻数（副露）- nullは門前限定
  description: string; // 説明
  exampleTiles?: TileNotation; // サンプル手牌（簡易表記）
  exampleNote?: string; // サンプルの補足説明
}

// 判定された役
export interface JudgedYaku {
  id: YakuId;
  han: number; // 実際に適用される翻数（門前/副露を考慮）
}

// 役の判定結果
export interface YakuResult {
  yakuList: JudgedYaku[]; // 成立している役のリスト
  totalHan: number; // 合計翻数
  doraCount: number; // ドラ枚数
}
