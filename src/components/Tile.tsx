import { CSSProperties, ReactElement } from 'react';
import { Tile as TileType, HonorType } from '../logic/types';

interface TileProps {
  tile: TileType;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
  customSize?: { width: number; height: number }; // 動的サイズ指定
  horizontal?: boolean; // 横向き（副露の鳴いた牌）
  faceDown?: boolean; // 裏向き（暗槓の両端）
}

// サイズ設定（画像のアスペクト比 66:90 に合わせる）
const SIZES = {
  xsmall: { width: 20, height: 27 },
  small: { width: 33, height: 45 },
  medium: { width: 44, height: 60 },
  large: { width: 66, height: 90 },
};

// 横向きサイズ設定（アスペクト比 90:66）
const HORIZONTAL_SIZES = {
  xsmall: { width: 27, height: 20 },
  small: { width: 45, height: 33 },
  medium: { width: 60, height: 44 },
  large: { width: 90, height: 66 },
};

// 字牌のhonorTypeから画像ファイル番号へのマッピング
// 画像ファイル: ji5=發, ji6=白, ji7=中
const HONOR_TO_JI: Record<HonorType, number> = {
  ton: 1,   // 東
  nan: 2,   // 南
  sha: 3,   // 西
  pei: 4,   // 北
  hatsu: 5, // 發
  haku: 6,  // 白
  chun: 7,  // 中
};

// 牌の日本語名を取得
const SUIT_NAMES: Record<string, string> = {
  man: '萬',
  pin: '筒',
  sou: '索',
};

const HONOR_NAMES: Record<HonorType, string> = {
  ton: '東',
  nan: '南',
  sha: '西',
  pei: '北',
  hatsu: '發',
  haku: '白',
  chun: '中',
};

function getTileAltText(tile: TileType): string {
  if (tile.suit === 'honor' && tile.honorType) {
    return HONOR_NAMES[tile.honorType];
  }
  return `${tile.value}${SUIT_NAMES[tile.suit] || ''}`;
}

// 牌からファイル名を取得
function getTileImagePath(tile: TileType, horizontal: boolean): string {
  const { suit, value, honorType } = tile;
  const suffix = horizontal ? '-yoko' : '';

  let filename: string;

  if (suit === 'man') {
    filename = `man${value}-66-90-l${suffix}.webp`;
  } else if (suit === 'pin') {
    filename = `pin${value}-66-90-l${suffix}.webp`;
  } else if (suit === 'sou') {
    filename = `sou${value}-66-90-l${suffix}.webp`;
  } else if (suit === 'honor' && honorType) {
    const jiNumber = HONOR_TO_JI[honorType];
    filename = `ji${jiNumber}-66-90-l${suffix}.webp`;
  } else {
    filename = `man1-66-90-l${suffix}.webp`; // フォールバック
  }

  return `/tiles/pai-images/${filename}`;
}

export function Tile({ tile, size = 'medium', customSize, horizontal = false, faceDown = false }: TileProps): ReactElement {
  // customSizeが指定されていればそれを使用、そうでなければプリセットサイズを使用
  let width: number;
  let height: number;

  if (customSize) {
    if (horizontal) {
      // 横向きの場合は幅と高さを入れ替え
      width = customSize.height;
      height = customSize.width;
    } else {
      width = customSize.width;
      height = customSize.height;
    }
  } else {
    const sizeConfig = horizontal ? HORIZONTAL_SIZES : SIZES;
    const preset = sizeConfig[size];
    width = preset.width;
    height = preset.height;
  }

  const containerStyle: CSSProperties = {
    display: 'inline-block',
    width: `${width}px`,
    height: `${height}px`,
  };

  // 裏向きの場合はCSSで緑色の背景を表示
  if (faceDown) {
    const faceDownStyle: CSSProperties = {
      width: '100%',
      height: '100%',
      backgroundColor: '#1a5f2a',
      borderRadius: '4px',
      border: '2px solid #e8e4d9',
      boxSizing: 'border-box',
      filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.3))',
    };

    return (
      <div style={containerStyle} className={horizontal ? 'tile-horizontal' : 'tile-vertical'}>
        <div style={faceDownStyle} className="tile-face-down" />
      </div>
    );
  }

  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'block',
    filter: 'drop-shadow(1px 2px 3px rgba(0,0,0,0.3))',
  };

  return (
    <div style={containerStyle} className={horizontal ? 'tile-horizontal' : 'tile-vertical'}>
      <img
        src={getTileImagePath(tile, horizontal)}
        alt={getTileAltText(tile)}
        style={imgStyle}
        draggable={false}
      />
    </div>
  );
}
