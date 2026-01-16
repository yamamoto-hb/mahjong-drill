import { CSSProperties, useState } from 'react';

// セルの座標を表す型（同じ点数でも別セルを区別するため）
interface CellKey {
  fu: number | 'limit';
  han: number;
}

interface ScoreTableProps {
  onScoreSelect?: (score: string) => void;
  highlightedScore?: string | null;
  highlightedCell?: CellKey | null;
  onCellSelect?: (cell: CellKey, score: string) => void;
  playerType?: 'oya' | 'ko';
  winType?: 'ron' | 'tsumo';
}

const styles: Record<string, CSSProperties> = {
  container: {
    backgroundColor: '#FAF8F3',
    borderRadius: '0',
    overflow: 'hidden',
    border: '1px solid #C4B9A8',
    marginBottom: '8px',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  header: {
    padding: '6px 10px',
    backgroundColor: '#1B4D3E',
    color: '#FAF8F3',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    userSelect: 'none',
  },
  toggleIcon: {
    fontSize: '14px',
    transition: 'transform 0.3s',
  },
  toggleIconOpen: {
    transform: 'rotate(180deg)',
  },
  tabList: {
    display: 'flex',
    borderBottom: '1px solid #C4B9A8',
  },
  tab: {
    flex: 1,
    padding: '5px 4px',
    border: 'none',
    borderBottom: '2px solid transparent',
    backgroundColor: '#EDE8DC',
    fontSize: '10px',
    color: '#5C5C5C',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    outline: 'none',
  },
  activeTab: {
    flex: 1,
    padding: '5px 4px',
    border: 'none',
    borderBottom: '2px solid #1B4D3E',
    backgroundColor: '#FAF8F3',
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#1B4D3E',
    cursor: 'pointer',
    outline: 'none',
  },
  content: {
    padding: '6px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '10px',
  },
  th: {
    padding: '4px 2px',
    backgroundColor: '#EDE8DC',
    border: '1px solid #C4B9A8',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  thCorner: {
    padding: '4px 2px',
    backgroundColor: '#1B4D3E',
    border: '1px solid #0F3328',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#FAF8F3',
  },
  td: {
    padding: '4px 2px',
    border: '1px solid #C4B9A8',
    textAlign: 'center',
    color: '#2C2C2C',
    fontSize: '10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  tdHover: {
    backgroundColor: '#E8F2EC',
  },
  tdSelected: {
    backgroundColor: '#3A7D5C',
    color: '#FAF8F3',
    fontWeight: 'bold',
  },
  tdFu: {
    padding: '4px 2px',
    backgroundColor: '#EDE8DC',
    border: '1px solid #C4B9A8',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  tdMangan: {
    padding: '4px 2px',
    border: '1px solid #C4B9A8',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#C53D43',
    backgroundColor: 'rgba(197, 61, 67, 0.05)',
    fontSize: '10px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  note: {
    marginTop: '6px',
    fontSize: '9px',
    color: '#8C8C8C',
    lineHeight: '1.4',
  },
};

type TableType = 'ko_ron' | 'ko_tsumo' | 'oya_ron' | 'oya_tsumo';

const TABS: { key: TableType; label: string }[] = [
  { key: 'ko_ron', label: '子ロン' },
  { key: 'ko_tsumo', label: '子ツモ' },
  { key: 'oya_ron', label: '親ロン' },
  { key: 'oya_tsumo', label: '親ツモ' },
];

// 統一された符の値（全タブで同じ行数を表示）
const FU_VALUES = [20, 25, 30, 40, 50, 60, 70, 80];

// 点数テーブルデータ
const SCORE_DATA: Record<TableType, Record<number, (string | null)[]>> = {
  ko_ron: {
    20: [null, null, null, null], // 平和ロンは30符扱い
    25: [null, '1,600', '3,200', '6,400'], // 七対子（1翻なし）
    30: ['1,000', '2,000', '3,900', '7,700'],
    40: ['1,300', '2,600', '5,200', null],
    50: ['1,600', '3,200', '6,400', null],
    60: ['2,000', '3,900', '7,700', null],
    70: ['2,300', '4,500', null, null],
    80: ['2,600', '5,200', null, null],
  },
  ko_tsumo: {
    20: ['400/700', '700/1,300', '1,300/2,600', null], // 平和ツモ
    25: [null, '400/800', '800/1,600', '1,600/3,200'], // 七対子（1翻なし）
    30: ['300/500', '500/1,000', '1,000/2,000', '2,000/3,900'],
    40: ['400/700', '700/1,300', '1,300/2,600', null],
    50: ['400/800', '800/1,600', '1,600/3,200', null],
    60: ['500/1,000', '1,000/2,000', '2,000/3,900', null],
    70: ['600/1,200', '1,200/2,300', null, null],
    80: ['700/1,300', '1,300/2,600', null, null],
  },
  oya_ron: {
    20: [null, null, null, null], // 平和ロンは30符扱い
    25: [null, '2,400', '4,800', '9,600'], // 七対子（1翻なし）
    30: ['1,500', '2,900', '5,800', '11,600'],
    40: ['2,000', '3,900', '7,700', null],
    50: ['2,400', '4,800', '9,600', null],
    60: ['2,900', '5,800', '11,600', null],
    70: ['3,400', '6,800', null, null],
    80: ['3,900', '7,700', null, null],
  },
  oya_tsumo: {
    20: ['700 all', '1,300 all', '2,600 all', null], // 平和ツモ
    25: [null, '800 all', '1,600 all', '3,200 all'], // 七対子（1翻なし）
    30: ['500 all', '1,000 all', '2,000 all', '3,900 all'],
    40: ['700 all', '1,300 all', '2,600 all', null],
    50: ['800 all', '1,600 all', '3,200 all', null],
    60: ['1,000 all', '2,000 all', '3,900 all', null],
    70: ['1,200 all', '2,300 all', null, null],
    80: ['1,300 all', '2,600 all', null, null],
  },
};

// 満貫以上の点数データ
interface LimitScore {
  label: string;
  han: number; // 代表的な翻数（選択時に使用）
  hanRange: string; // 翻数の範囲（表示用）
  ko_ron: string;
  ko_tsumo: string;
  oya_ron: string;
  oya_tsumo: string;
}

const LIMIT_SCORES: LimitScore[] = [
  { label: '満貫', han: 5, hanRange: '5翻', ko_ron: '8,000', ko_tsumo: '2,000/4,000', oya_ron: '12,000', oya_tsumo: '4,000 all' },
  { label: '跳満', han: 6, hanRange: '6-7翻', ko_ron: '12,000', ko_tsumo: '3,000/6,000', oya_ron: '18,000', oya_tsumo: '6,000 all' },
  { label: '倍満', han: 8, hanRange: '8-10翻', ko_ron: '16,000', ko_tsumo: '4,000/8,000', oya_ron: '24,000', oya_tsumo: '8,000 all' },
  { label: '三倍満', han: 11, hanRange: '11-12翻', ko_ron: '24,000', ko_tsumo: '6,000/12,000', oya_ron: '36,000', oya_tsumo: '12,000 all' },
  { label: '役満', han: 13, hanRange: '13翻〜', ko_ron: '32,000', ko_tsumo: '8,000/16,000', oya_ron: '48,000', oya_tsumo: '16,000 all' },
];

export function ScoreTable({
  onScoreSelect,
  highlightedScore,
  highlightedCell,
  onCellSelect,
  playerType,
  winType,
}: ScoreTableProps = {}) {
  // playerTypeとwinTypeから初期値を計算
  const initialTableType: TableType = playerType && winType
    ? (`${playerType === 'oya' ? 'oya' : 'ko'}_${winType}` as TableType)
    : 'ko_ron';

  const [tableType, setTableType] = useState<TableType>(initialTableType);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [hoveredCell, setHoveredCell] = useState<CellKey | null>(null);

  // propsが変更されたら同期（useSyncExternalStoreのような挙動）
  const currentComputedType = playerType && winType
    ? (`${playerType === 'oya' ? 'oya' : 'ko'}_${winType}` as TableType)
    : null;

  // レンダー中に同期（useEffectではなく）
  if (currentComputedType && currentComputedType !== tableType) {
    setTableType(currentComputedType);
  }

  const data = SCORE_DATA[tableType];

  const handleScoreClick = (score: string | null, fu: number, han: number) => {
    if (score) {
      if (onCellSelect) {
        onCellSelect({ fu, han }, score);
      } else if (onScoreSelect) {
        onScoreSelect(score);
      }
    }
  };

  const handleLimitClick = (limit: LimitScore) => {
    const score = limit[tableType];
    if (onCellSelect) {
      onCellSelect({ fu: 'limit', han: limit.han }, score);
    } else if (onScoreSelect) {
      onScoreSelect(score);
    }
  };

  // セルが選択されているかチェック
  const isCellSelected = (fu: number | 'limit', han: number): boolean => {
    if (highlightedCell) {
      return highlightedCell.fu === fu && highlightedCell.han === han;
    }
    return false;
  };

  // セルがホバーされているかチェック
  const isCellHovered = (fu: number | 'limit', han: number): boolean => {
    if (hoveredCell) {
      return hoveredCell.fu === fu && hoveredCell.han === han;
    }
    return false;
  };

  return (
    <div style={styles.container} className="score-table-container">
      <div style={styles.header} className="header" onClick={() => setIsOpen(!isOpen)}>
        <span>📊 点数早見表</span>
        <span style={{
          ...styles.toggleIcon,
          ...(isOpen ? styles.toggleIconOpen : {})
        }}>▼</span>
      </div>

      {isOpen && (
        <>
          <div style={styles.tabList} className="tab-list">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                style={tableType === key ? styles.activeTab : styles.tab}
                onClick={() => setTableType(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={styles.content} className="content">
            <table style={styles.table}>
              <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={styles.thCorner}>符＼翻</th>
                  <th style={styles.th}>1翻</th>
                  <th style={styles.th}>2翻</th>
                  <th style={styles.th}>3翻</th>
                  <th style={styles.th}>4翻</th>
                </tr>
              </thead>
              <tbody>
                {FU_VALUES.map((fu) => (
                  <tr key={fu}>
                    <td style={styles.tdFu}>{fu}符</td>
                    {data[fu].map((score, i) => {
                      const han = i + 1;
                      const isSelected = isCellSelected(fu, han) || (highlightedScore === score && score !== null);
                      const isHovered = isCellHovered(fu, han);
                      // 30符以上でnullなら満貫、20符/25符でnullなら存在しない組み合わせ
                      const isMangan = score === null && fu >= 30;
                      const isInvalid = score === null && fu < 30;
                      const displayText = score ?? (isMangan ? '満貫' : '-');
                      return (
                        <td
                          key={i}
                          style={{
                            ...(isMangan ? styles.tdMangan : styles.td),
                            ...(isInvalid ? { color: '#CCCCCC', cursor: 'default' } : {}),
                            ...(isSelected ? styles.tdSelected : {}),
                            ...(isHovered && !isSelected && !isInvalid ? styles.tdHover : {}),
                          }}
                          onClick={() => !isInvalid && handleScoreClick(score, fu, han)}
                          onMouseEnter={() => !isInvalid && setHoveredCell({ fu, han })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {displayText}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 満貫以上の点数表 */}
            <table style={{ ...styles.table, marginTop: '6px' }}>
              <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '60%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={styles.thCorner}>役</th>
                  <th style={styles.th}>翻数</th>
                  <th style={styles.th} colSpan={3}>点数</th>
                </tr>
              </thead>
              <tbody>
                {LIMIT_SCORES.map((limit) => {
                  const score = limit[tableType];
                  const isSelected = isCellSelected('limit', limit.han);
                  const isHovered = isCellHovered('limit', limit.han);
                  return (
                    <tr key={limit.label}>
                      <td style={styles.tdFu}>{limit.label}</td>
                      <td style={{ ...styles.td, cursor: 'default' }}>{limit.hanRange}</td>
                      <td
                        colSpan={3}
                        style={{
                          ...styles.tdMangan,
                          ...(isSelected ? styles.tdSelected : {}),
                          ...(isHovered && !isSelected ? styles.tdHover : {}),
                        }}
                        onClick={() => handleLimitClick(limit)}
                        onMouseEnter={() => setHoveredCell({ fu: 'limit', han: limit.han })}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <p style={styles.note} className="note">
              ※ ツモの表記: 子払い/親払い (親は「all」で全員同額)
            </p>
          </div>
        </>
      )}
    </div>
  );
}
