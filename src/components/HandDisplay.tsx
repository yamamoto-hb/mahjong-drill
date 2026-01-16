import { CSSProperties, useState, useEffect } from 'react';
import { Problem, Tile as TileType, isChiitoitsuProblem, ChiitoitsuProblem } from '../logic/types';
import { Tile } from './Tile';
import { compareTiles, isSameTile } from '../logic/tiles';
import { getWindName } from '../logic/problem-generator';

interface HandDisplayProps {
  problem: Problem;
}

// 牌のアスペクト比（幅:高さ = 66:90）
const TILE_ASPECT_RATIO = 66 / 90;

interface TileSizeParams {
  tileCount: number;            // 縦向き牌の枚数
  horizontalTileCount: number;  // 横向き牌の枚数（副露で鳴いた牌）
  groupCount: number;           // 牌グループの数（門前+各副露）
}

// 動的に牌サイズを計算するカスタムフック
function useDynamicTileSize(params: TileSizeParams): { width: number; height: number } {
  const { tileCount, horizontalTileCount, groupCount } = params;
  const [dimensions, setDimensions] = useState({ width: 33, height: 45 });

  useEffect(() => {
    const calculateSize = () => {
      if (typeof window === 'undefined') {
        setDimensions({ width: 33, height: 45 });
        return;
      }

      const viewportWidth = window.innerWidth;

      // レイアウトに応じた利用可能幅
      // - PC版（601px以上）: 左カラム660px固定 → 640px使える
      // - モバイル（600px以下）: viewportWidth - 16px
      let availableContainerWidth: number;
      if (viewportWidth <= 600) {
        // モバイル: 全幅からpadding引く
        availableContainerWidth = viewportWidth - 16;
      } else {
        // PC版: 左カラム固定660pxなので約640px使える（右カラムの有無に関わらず）
        availableContainerWidth = 640;
      }

      // コンテナのpadding（左右合計20px）
      const containerPadding = 20;
      // グループ間のgap（8px）
      const gapBetweenGroups = 8 * Math.max(0, groupCount - 1);
      // 牌間のgap（2px）- 各グループ内
      const tileGapTotal = 2 * Math.max(0, tileCount + horizontalTileCount - groupCount);

      const availableWidth = availableContainerWidth - containerPadding - gapBetweenGroups - tileGapTotal;

      // 横向き牌は高さ分の幅を取る（縦牌の高さ = 幅 / ASPECT_RATIO）
      // 縦牌の幅をwとすると、横牌の幅は w / ASPECT_RATIO
      // 全体幅 = w * tileCount + (w / ASPECT_RATIO) * horizontalTileCount
      //        = w * (tileCount + horizontalTileCount / ASPECT_RATIO)
      const effectiveTileCount = tileCount + horizontalTileCount / TILE_ASPECT_RATIO;
      const maxTileWidth = availableWidth / effectiveTileCount;

      // サイズ制限
      const minWidth = 20;
      const maxWidth = viewportWidth <= 600 ? 38 : 44;

      const tileWidth = Math.floor(Math.max(minWidth, Math.min(maxWidth, maxTileWidth)));
      const tileHeight = Math.floor(tileWidth / TILE_ASPECT_RATIO);

      setDimensions({ width: tileWidth, height: tileHeight });
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    return () => window.removeEventListener('resize', calculateSize);
  }, [tileCount, horizontalTileCount, groupCount]);

  return dimensions;
}

// 従来のサイズ名を返すフック（ドラ表示等で使用）
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

  // 動的サイズ計算用のパラメータを算出
  // 横向き牌の数（各副露につき1枚が横向き）
  const horizontalTileCount = openMentsu.length; // 副露1つにつき1枚が横向き

  // 七対子の場合
  let baseTileCount: number;
  if (isChiitoitsuHand && problem.toitsu) {
    baseTileCount = problem.toitsu.length * 2;
  } else {
    // 門前の面子（暗槓除く）
    const concealedMentsuTiles = concealedMentsu.reduce((sum, m) => sum + m.tiles.length, 0);
    // 暗槓（4枚 × 暗槓数）
    const concealedKantsuTiles = concealedKantsu.length * 4;
    // 副露（鳴いた面子）
    const openMentsuTiles = openMentsu.reduce((sum, m) => sum + m.tiles.length, 0);
    // 雀頭
    const jantouTiles = problem.jantou.tiles.length;

    baseTileCount = concealedMentsuTiles + concealedKantsuTiles + openMentsuTiles + jantouTiles;
  }

  // 縦向き牌の数 = 全牌数 - 横向き牌の数
  const verticalTileCount = baseTileCount - horizontalTileCount;

  // グループ数: 門前牌グループ + 暗槓の数 + 副露の数
  // 門前牌が0枚の場合（全て暗槓＋雀頭のみ和了牌除くと1枚以下）は門前グループも0扱い
  const hasConcealedGroup = concealedMentsu.length > 0 || problem.jantou.tiles.length > 0;
  const groupCount = (hasConcealedGroup ? 1 : 0) + concealedKantsu.length + openMentsu.length;

  // 動的な牌サイズを取得
  const dynamicTileSize = useDynamicTileSize({
    tileCount: verticalTileCount,
    horizontalTileCount,
    groupCount,
  });

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

      {/* 手牌エリア（動的サイズで横スクロールなしに収まる） */}
      <div style={styles.handArea} className="hand-area-scroll">
        {/* 門前の牌をまとめて表示 */}
        {concealedTiles.length > 0 && (
          <div style={styles.concealedGroup}>
            {concealedTiles.map((tile, index) => (
              <Tile
                key={index}
                tile={tile}
                customSize={dynamicTileSize}
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
                customSize={dynamicTileSize}
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
                  customSize={dynamicTileSize}
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
          <Tile tile={problem.winningTile} customSize={dynamicTileSize} />
        </div>
      </div>
    </div>
  );
}
