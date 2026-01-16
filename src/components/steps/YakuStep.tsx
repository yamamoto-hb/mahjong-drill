import { CSSProperties, ReactElement, useState } from 'react';
import { StepAnswerState } from '../../logic/types';
import { ProblemWithYaku } from '../../logic/problem-generator';
import { YAKU_LIST, getYakuById } from '../../logic/yaku-list';
import { YakuId, YakuDefinition } from '../../logic/yaku-types';
import { Tile } from '../Tile';
import { parseTileNotation } from '../../logic/tiles';

interface YakuStepProps {
  problem: ProblemWithYaku;
  onSubmit: (selectedYakuIds: string[], doraCount: number) => void;
  onNext: () => void;
  result: StepAnswerState['yaku'] | null;
}

const styles: Record<string, CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    padding: '14px',
    borderRadius: '0',
    marginBottom: '10px',
    border: '1px solid #E8E8E8',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '12px',
    fontWeight: 500,
    color: '#1A1A1A',
    letterSpacing: '0.05em',
  },
  yakuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '4px',
    marginBottom: '8px',
  },
  yakuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 8px',
    borderRadius: '0',
    backgroundColor: '#F5F5F5',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: '28px',
    border: '1px solid #E8E8E8',
    outline: 'none',
    position: 'relative',
  },
  yakuItemSelected: {
    backgroundColor: '#1B4332',
    border: '1px solid #1B4332',
    color: '#FFFFFF',
  },
  yakuItemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  yakuName: {
    fontSize: '11px',
    letterSpacing: '0.02em',
    flexShrink: 0,
  },
  yakuHan: {
    fontSize: '9px',
    fontWeight: 400,
    flexShrink: 0,
    opacity: 0.6,
  },
  helpButtonWrapper: {
    position: 'relative',
    display: 'inline-flex',
  },
  helpButton: {
    width: '14px',
    height: '14px',
    padding: 0,
    border: 'none',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    color: '#666666',
    fontSize: '9px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    flexShrink: 0,
  },
  helpButtonSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#FFFFFF',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: '8px',
    padding: '10px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E8E8E8',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: '200px',
    width: 'max-content',
  },
  tooltipName: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: '4px',
  },
  tooltipHan: {
    fontSize: '10px',
    color: '#666666',
    marginBottom: '8px',
  },
  tooltipDesc: {
    fontSize: '10px',
    color: '#333333',
    lineHeight: 1.5,
    marginBottom: '8px',
  },
  tooltipTiles: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '1px',
    flexWrap: 'nowrap',
    padding: '6px',
    backgroundColor: '#F5F5F5',
    borderRadius: '2px',
  },
  tooltipKuisagari: {
    fontSize: '9px',
    color: '#B8860B',
    backgroundColor: '#FDF8F0',
    padding: '3px 6px',
    borderRadius: '2px',
    marginTop: '6px',
    display: 'inline-block',
  },
  hanAdjuster: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    flexShrink: 0,
  },
  yakuRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginLeft: 'auto',
    flexShrink: 0,
  },
  hanButton: {
    width: '20px',
    height: '20px',
    padding: 0,
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '0',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
  },
  hanButtonDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },
  hanValue: {
    minWidth: '16px',
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: 500,
    color: '#FFFFFF',
  },
  doraSection: {
    marginBottom: '10px',
    padding: '8px 12px',
    backgroundColor: '#F5F5F5',
    borderRadius: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #E8E8E8',
  },
  doraLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#1A1A1A',
    letterSpacing: '0.05em',
  },
  doraCounter: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: '0',
    border: '1px solid #E8E8E8',
    overflow: 'hidden',
  },
  doraButton: {
    width: '36px',
    height: '32px',
    padding: 0,
    border: 'none',
    backgroundColor: '#F5F5F5',
    color: '#1A1A1A',
    fontSize: '16px',
    fontWeight: 400,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none',
    transition: 'background-color 0.2s ease',
  },
  doraButtonDisabled: {
    color: '#D0D0D0',
    cursor: 'not-allowed',
  },
  doraValue: {
    minWidth: '32px',
    padding: '0 4px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 500,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  summary: {
    padding: '8px 12px',
    backgroundColor: '#F5F5F5',
    borderRadius: '0',
    marginBottom: '10px',
    fontSize: '12px',
    fontWeight: 500,
    color: '#1A1A1A',
    textAlign: 'center',
    border: '1px solid #E8E8E8',
  },
  summaryNote: {
    display: 'block',
    fontSize: '10px',
    fontWeight: 400,
    color: '#999999',
    marginTop: '4px',
  },
  summaryTotal: {
    fontSize: '16px',
    fontWeight: 500,
    color: '#1B4332',
  },
  submitButton: {
    padding: '10px 20px',
    fontSize: '12px',
    fontWeight: 500,
    backgroundColor: '#1B4332',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '0',
    cursor: 'pointer',
    width: '100%',
    outline: 'none',
    transition: 'opacity 0.2s ease',
    letterSpacing: '0.1em',
  },
  resultSection: {
    marginTop: '10px',
    padding: '12px',
    borderRadius: '0',
  },
  resultCorrect: {
    backgroundColor: '#F0F7F4',
    borderLeft: '3px solid #2D6A4F',
  },
  resultIncorrect: {
    backgroundColor: '#FDF8F0',
    borderLeft: '3px solid #B8860B',
  },
  resultTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.05em',
  },
  correctYakuList: {
    margin: 0,
    padding: '0 0 0 16px',
  },
  correctYakuItem: {
    fontSize: '11px',
    marginBottom: '4px',
    letterSpacing: '0.02em',
  },
  categoryTitle: {
    fontSize: '10px',
    color: '#999999',
    marginBottom: '4px',
    marginTop: '8px',
    fontWeight: 500,
    letterSpacing: '0.05em',
  },
  categoryTitleFirst: {
    marginTop: '0px',
  },
};

// 役をカテゴリ別にグループ化（表示用）
function getDisplayYakuList(): YakuDefinition[] {
  return YAKU_LIST.filter((yaku) => {
    // ダブルリーチは除外（通常のリーチのみ）
    if (yaku.id === 'double_riichi') return false;
    return true;
  });
}

export function YakuStep({ problem, onSubmit, onNext, result }: YakuStepProps): ReactElement {
  const [selectedYakuIds, setSelectedYakuIds] = useState<string[]>([]);
  const [yakuHanOverrides, setYakuHanOverrides] = useState<Record<string, number>>({});
  const [doraCount, setDoraCount] = useState<number>(0);
  const [hoveredYakuId, setHoveredYakuId] = useState<string | null>(null);

  const availableYaku = getDisplayYakuList();

  const handleToggle = (id: YakuId) => {
    if (result !== null) return;
    setSelectedYakuIds((prev) => {
      if (prev.includes(id)) {
        // 選択解除時はオーバーライドも削除
        setYakuHanOverrides((overrides) => {
          const newOverrides = { ...overrides };
          delete newOverrides[id];
          return newOverrides;
        });
        return prev.filter((x) => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 翻数を調整
  const handleHanChange = (id: string, delta: number) => {
    if (result !== null) return;
    const yaku = getYakuById(id);
    if (!yaku) return;

    const currentHan = yakuHanOverrides[id] ?? yaku.han;
    const newHan = Math.max(1, Math.min(yaku.han, currentHan + delta));

    setYakuHanOverrides((prev) => ({
      ...prev,
      [id]: newHan,
    }));
  };

  // 選択した役の翻数を取得
  const getSelectedHan = (id: string): number => {
    const yaku = getYakuById(id);
    if (!yaku) return 0;
    return yakuHanOverrides[id] ?? yaku.han;
  };

  const handleSubmit = () => {
    onSubmit(selectedYakuIds, doraCount);
  };

  // 選択された役の合計翻数を計算（ユーザーが調整した翻数を使用）
  const calculateTotalHan = (): number => {
    let total = 0;
    for (const id of selectedYakuIds) {
      total += getSelectedHan(id);
    }
    return total + doraCount;
  };

  const totalHan = calculateTotalHan();

  // 1翻役と2翻以上役に分ける
  const oneHanYaku = availableYaku.filter((y) => y.han === 1);
  const twoHanYaku = availableYaku.filter((y) => y.han === 2);
  const threeOrMoreHanYaku = availableYaku.filter((y) => y.han >= 3);

  // ツールチップをレンダリング
  const renderTooltip = (yaku: YakuDefinition) => {
    const tiles = yaku.exampleTiles ? parseTileNotation(yaku.exampleTiles) : [];
    const hasKuisagari = yaku.hanOpen !== null && yaku.hanOpen < yaku.han;

    return (
      <div style={styles.tooltip as CSSProperties} onClick={(e) => e.stopPropagation()}>
        <div style={styles.tooltipName}>{yaku.name}</div>
        <div style={styles.tooltipHan}>
          {yaku.hanOpen === null
            ? `${yaku.han}翻（門前限定）`
            : `${yaku.han}翻`
          }
        </div>
        <div style={styles.tooltipDesc}>{yaku.description}</div>
        {tiles.length > 0 && (
          <div style={styles.tooltipTiles}>
            {tiles.map((tile, i) => (
              <div key={i} style={{ flexShrink: 0 }}>
                <Tile tile={tile} size="small" />
              </div>
            ))}
          </div>
        )}
        {hasKuisagari && (
          <div style={styles.tooltipKuisagari}>
            食い下がり: 副露時 {yaku.hanOpen}翻
          </div>
        )}
      </div>
    );
  };

  const renderYakuCategory = (yakuList: YakuDefinition[], title: string, isFirst: boolean = false) => {
    if (yakuList.length === 0) return null;
    return (
      <>
        <div style={{
          ...styles.categoryTitle,
          ...(isFirst ? styles.categoryTitleFirst : {})
        }} className="yaku-category-title">{title}</div>
        <div style={styles.yakuGrid} className="yaku-grid">
          {yakuList.map((yaku) => {
            const isSelected = selectedYakuIds.includes(yaku.id);
            const currentHan = getSelectedHan(yaku.id);
            const canDecrease = isSelected && yaku.hanOpen !== null && currentHan > (yaku.hanOpen ?? 1);
            const canIncrease = isSelected && currentHan < yaku.han;
            const showHanAdjuster = isSelected && yaku.hanOpen !== null && yaku.hanOpen < yaku.han;
            const isHovered = hoveredYakuId === yaku.id;
            return (
              <div
                key={yaku.id}
                style={{
                  ...styles.yakuItem,
                  ...(isSelected ? styles.yakuItemSelected : {}),
                  ...(result !== null ? styles.yakuItemDisabled : {}),
                }}
                onClick={() => handleToggle(yaku.id)}
              >
                <span style={styles.yakuName} className="yaku-name">{yaku.name}</span>
                <div style={styles.yakuRight}>
                  {showHanAdjuster ? (
                    <div style={styles.hanAdjuster} className="han-adjuster" onClick={(e) => e.stopPropagation()}>
                      <button
                        style={{
                          ...styles.hanButton,
                          ...(canDecrease ? {} : styles.hanButtonDisabled),
                        }}
                        onClick={() => handleHanChange(yaku.id, -1)}
                        disabled={!canDecrease || result !== null}
                      >
                        -
                      </button>
                      <span style={styles.hanValue}>{currentHan}</span>
                      <button
                        style={{
                          ...styles.hanButton,
                          ...(canIncrease ? {} : styles.hanButtonDisabled),
                        }}
                        onClick={() => handleHanChange(yaku.id, 1)}
                        disabled={!canIncrease || result !== null}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span style={styles.yakuHan} className="yaku-han-text">{yaku.han}翻</span>
                  )}
                  <div
                    style={styles.helpButtonWrapper as CSSProperties}
                    className="yaku-help-button"
                    onMouseEnter={() => setHoveredYakuId(yaku.id)}
                    onMouseLeave={() => setHoveredYakuId(null)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      style={{
                        ...styles.helpButton,
                        ...(isSelected ? styles.helpButtonSelected : {}),
                      }}
                    >
                      ?
                    </button>
                    {isHovered && renderTooltip(yaku)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div style={styles.container} className="yaku-step-container">
      <h3 style={styles.title}>ステップ1: 成立している役を選択</h3>

      {renderYakuCategory(oneHanYaku, '1翻役', true)}
      {renderYakuCategory(twoHanYaku, '2翻役')}
      {renderYakuCategory(threeOrMoreHanYaku, '3翻以上')}

      <div style={styles.doraSection} className="dora-section">
        <span style={styles.doraLabel} className="dora-label">ドラ</span>
        <div style={styles.doraCounter}>
          <button
            onClick={() => setDoraCount(Math.max(0, doraCount - 1))}
            disabled={result !== null || doraCount <= 0}
            style={{
              ...styles.doraButton,
              ...(result !== null || doraCount <= 0 ? styles.doraButtonDisabled : {}),
            }}
          >
            −
          </button>
          <span style={styles.doraValue} className="dora-value">{doraCount}</span>
          <button
            onClick={() => setDoraCount(Math.min(20, doraCount + 1))}
            disabled={result !== null || doraCount >= 20}
            style={{
              ...styles.doraButton,
              ...(result !== null || doraCount >= 20 ? styles.doraButtonDisabled : {}),
            }}
          >
            +
          </button>
        </div>
      </div>

      <div style={styles.summary} className="yaku-summary">
        <span>合計: </span>
        <span style={styles.summaryTotal} className="summary-total">{totalHan}翻</span>
        {!problem.isMenzen && (
          <span style={styles.summaryNote}>（※副露時は食い下がりを考慮）</span>
        )}
      </div>

      {result === null ? (
        <button onClick={handleSubmit} style={styles.submitButton}>
          回答する
        </button>
      ) : !result.isCorrect ? (
        // 不正解時のみ解説を表示
        <div style={{ ...styles.resultSection, ...styles.resultIncorrect }}>
          <h4 style={{ ...styles.resultTitle, color: '#B87333' }}>
            惜しい！
          </h4>
          <p style={{ margin: '0 0 8px 0', fontSize: '11px' }}>
            <strong>正解の役:</strong>
          </p>
          <ul style={styles.correctYakuList}>
            {problem.yakuResult.yakuList.map((yaku) => {
              const def = getYakuById(yaku.id);
              return (
                <li key={yaku.id} style={styles.correctYakuItem}>
                  {def?.name || yaku.id} ({yaku.han}翻)
                </li>
              );
            })}
            {problem.yakuResult.doraCount > 0 && (
              <li style={styles.correctYakuItem}>ドラ ({problem.yakuResult.doraCount}枚)</li>
            )}
          </ul>
          <p style={{ margin: '8px 0 12px 0', fontSize: '13px', fontWeight: 'bold' }}>
            合計: {problem.yakuResult.totalHan}翻
          </p>
          <button onClick={onNext} style={styles.submitButton}>
            次へ（符の計算）
          </button>
        </div>
      ) : null}
    </div>
  );
}