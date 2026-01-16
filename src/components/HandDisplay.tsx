import { CSSProperties, useState, useEffect } from 'react';
import { Problem, Tile as TileType, isChiitoitsuProblem, ChiitoitsuProblem } from '../logic/types';
import { Tile } from './Tile';
import { compareTiles, isSameTile } from '../logic/tiles';
import { getWindName } from '../logic/problem-generator';

interface HandDisplayProps {
  problem: Problem;
}

// 画面幅に応じた牌サイズを取得するカスタムフック
function useTileSize(): 'xsmall' | 'small' | 'medium' {
  const getSize = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width <= 400) return 'xsmall';
      if (width <= 600) return 'small';
      return 'medium';
    }
    return 'medium';
  };

  const [size, setSize] = useState<'xsmall' | 'small' | 'medium'>(getSize);

  useEffect(() => {
    const handleResize = () => {
      setSize(getSize());
    };
    // 初回も実行
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

const styles: Record<string, CSSProperties> = {
  container: {
    backgroundColor: '#1B4332',
    padding: '12px',
    borderRadius: '2px',
    marginBottom: '12px',
    maxWidth: '100%',
    overflowX: 'auto',
  },
  // 上部エリア（前提条件 + ドラ）
  topArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    flexWrap: 'wrap',
    gap: '6px',
  },
  // 前提条件エリア
  conditionArea: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  conditionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    padding: '4px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '0',
    fontSize: '10px',
    fontWeight: 500,
    color: '#1A1A1A',
    letterSpacing: '0.05em',
  },
  // ドラ表示エリア（右上）
  doraArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  doraLabel: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 400,
    letterSpacing: '0.1em',
  },
  doraTiles: {
    display: 'flex',
    gap: '2px',
  },
  // 手牌エリア（門前 + 副露 + ツモ牌）
  handArea: {
    display: 'flex',
    flexWrap: 'nowrap',
    gap: '8px',
    alignItems: 'flex-end',
  },
  // 門前の牌をまとめて表示
  concealedGroup: {
    display: 'inline-flex',
    gap: '2px',
  },
  // 副露グループ
  openGroup: {
    display: 'inline-flex',
    alignItems: 'flex-end',
    gap: '1px',
  },
  // 和了牌エリア（右端に配置）
  winningTileArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginLeft: 'auto',
    paddingLeft: '16px',
  },
  winningTileLabel: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: 400,
    letterSpacing: '0.1em',
  },
};

// 七対子かどうかを判定（型ガードを使用）
function isChiitoitsu(problem: Problem): problem is ChiitoitsuProblem {
  return isChiitoitsuProblem(problem);
}

export function HandDisplay({ problem }: HandDisplayProps) {
  const tileSize = useTileSize();

  // 七対子の場合の特別処理
  const isChiitoitsuHand = isChiitoitsu(problem);

  // 門前の面子と副露を分ける（暗槓は別扱い）
  const concealedMentsu = problem.mentsu.filter(m => !m.isOpen && m.type !== 'kantsu');
  const concealedKantsu = problem.mentsu.filter(m => !m.isOpen && m.type === 'kantsu');
  const openMentsu = problem.mentsu.filter(m => m.isOpen);

  // 門前の牌を集める（暗槓以外、和了牌は1枚だけ除外）
  const concealedTiles: TileType[] = [];
  let winningTileRemoved = false;

  if (isChiitoitsuHand && problem.toitsu) {
    // 七対子の場合: toitsuから牌を集める
    for (const toitsu of problem.toitsu) {
      for (const tile of toitsu) {
        if (!winningTileRemoved && isSameTile(tile, problem.winningTile)) {
          winningTileRemoved = true;
          continue;
        }
        concealedTiles.push(tile);
      }
    }
  } else {
    // 通常の場合
    for (const mentsu of concealedMentsu) {
      for (const tile of mentsu.tiles) {
        if (!winningTileRemoved && isSameTile(tile, problem.winningTile)) {
          winningTileRemoved = true;
          continue;
        }
        concealedTiles.push(tile);
      }
    }
    // 雀頭も追加
    for (const tile of problem.jantou.tiles) {
      if (!winningTileRemoved && isSameTile(tile, problem.winningTile)) {
        winningTileRemoved = true;
        continue;
      }
      concealedTiles.push(tile);
    }
  }

  // ソート（萬子→筒子→索子→字牌、数字昇順）
  concealedTiles.sort(compareTiles);

  return (
    <div style={styles.container} className="hand-container">
      {/* 上部エリア（前提条件 + ドラ） */}
      <div style={styles.topArea}>
        {/* 前提条件（左側） */}
        <div style={styles.conditionArea}>
          <div style={styles.conditionItem} className="condition-item">
            {getWindName(problem.roundWind)}場
          </div>
          <div style={styles.conditionItem} className="condition-item">
            {getWindName(problem.seatWind)}家
          </div>
          <div style={styles.conditionItem} className="condition-item">
            {problem.playerType === 'oya' ? '親' : '子'}
          </div>
          {problem.isMenzen && (
            <div style={styles.conditionItem} className="condition-item">リーチ</div>
          )}
          {/* モバイル用ツモ/ロン牌（条件の右隣に表示） */}
          <div style={styles.winningTileArea} className="winning-tile-top">
            <span style={styles.winningTileLabel}>
              {problem.winType === 'tsumo' ? 'ツモ' : 'ロン'}
            </span>
            <Tile tile={problem.winningTile} size={tileSize === 'xsmall' ? 'xsmall' : 'small'} />
          </div>
        </div>

        {/* ドラ表示牌（右側） */}
        <div style={styles.doraArea}>
          <span style={styles.doraLabel}>ドラ<br />表示</span>
          <div style={styles.doraTiles} className="dora-tiles">
            {problem.doraIndicators.map((tile, index) => (
              <Tile key={index} tile={tile} size={tileSize === 'xsmall' ? 'xsmall' : 'small'} />
            ))}
          </div>
        </div>
      </div>

      {/* 手牌エリア（モバイルでは横スクロール可能） */}
      <div style={styles.handArea} className="hand-area-scroll">
        {/* 門前の牌をまとめて表示 */}
        {concealedTiles.length > 0 && (
          <div style={styles.concealedGroup}>
            {concealedTiles.map((tile, index) => (
              <Tile
                key={index}
                tile={tile}
                size={tileSize}
              />
            ))}
          </div>
        )}

        {/* 暗槓を表示（両端を裏向きに） */}
        {concealedKantsu.map((mentsu, index) => (
          <div key={`ankan-${index}`} style={styles.openGroup}>
            {mentsu.tiles.map((tile, tileIndex) => (
              <Tile
                key={tileIndex}
                tile={tile}
                size={tileSize}
                faceDown={tileIndex === 0 || tileIndex === 3}
              />
            ))}
          </div>
        ))}

        {/* 副露を表示（鳴いた牌を横向きに） */}
        {openMentsu.map((mentsu, index) => {
          let horizontalIndex = 0;

          // ツモの場合のみ、和了牌と同じ牌を横向きにしないようにする
          if (problem.winType === 'tsumo') {
            const winningTileIndex = mentsu.tiles.findIndex(t => isSameTile(t, problem.winningTile));
            if (winningTileIndex === 0) {
              horizontalIndex = 1;
            }
          }

          return (
            <div key={index} style={styles.openGroup}>
              {mentsu.tiles.map((tile, tileIndex) => (
                <Tile
                  key={tileIndex}
                  tile={tile}
                  size={tileSize}
                  horizontal={tileIndex === horizontalIndex}
                />
              ))}
            </div>
          );
        })}

        {/* ツモ/ロン牌（常に手牌の右に表示） */}
        <div style={styles.winningTileArea} className="winning-tile-area-mobile">
          <span style={styles.winningTileLabel}>
            {problem.winType === 'tsumo' ? 'ツモ' : 'ロン'}
          </span>
          <Tile tile={problem.winningTile} size={tileSize} />
        </div>
      </div>
    </div>
  );
}
