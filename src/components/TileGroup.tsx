import { CSSProperties } from 'react';
import { Mentsu, Jantou, Tile as TileType } from '../logic/types';
import { Tile } from './Tile';

interface TileGroupProps {
  mentsu?: Mentsu;
  jantou?: Jantou;
  tiles?: TileType[];
  isOpen?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function TileGroup({
  mentsu,
  jantou,
  tiles: rawTiles,
  isOpen = false,
  size = 'medium',
}: TileGroupProps) {
  // 表示する牌を決定
  let tiles: TileType[] = [];
  let showAsOpen = isOpen;

  if (mentsu) {
    tiles = mentsu.tiles;
    showAsOpen = mentsu.isOpen;
  } else if (jantou) {
    tiles = jantou.tiles;
  } else if (rawTiles) {
    tiles = rawTiles;
  }

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    gap: showAsOpen ? '1px' : '2px',
    padding: '4px',
    backgroundColor: showAsOpen ? 'rgba(139, 90, 43, 0.15)' : 'transparent',
    borderRadius: '4px',
    border: showAsOpen ? '1px solid rgba(139, 90, 43, 0.3)' : 'none',
  };

  return (
    <div style={containerStyle}>
      {tiles.map((tile, index) => (
        <Tile
          key={index}
          tile={tile}
          size={size}
        />
      ))}
    </div>
  );
}
