import { CSSProperties, ReactElement, useState } from 'react';
import { Problem, FuBreakdown, StepAnswerState, Mentsu, Tile as TileType, isChiitoitsuProblem } from '../../logic/types';
import { getFuBreakdownDescription, isPinfu } from '../../logic/fu-calculator';
import { Tile } from '../Tile';

// 符の選択内容
export interface FuSelection {
  agariMethodFu: number;
  mentsuFu: number[];
  jantouFu: number;
  waitFu: number;
  totalFu: number;
}

interface FuStepProps {
  problem: Problem;
  fuBreakdown: FuBreakdown;
  onSubmit: (selection: FuSelection) => void;
  onNext: () => void;
  result: StepAnswerState['fu'] | null;
}

const styles: Record<string, CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    padding: '10px',
    borderRadius: '0',
    marginBottom: '8px',
    border: '1px solid #E8E8E8',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  title: {
    margin: '0 0 6px 0',
    fontSize: '11px',
    fontWeight: 500,
    color: '#1A1A1A',
    letterSpacing: '0.05em',
  },
  section: {
    marginBottom: '10px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#999999',
    marginBottom: '6px',
    borderBottom: '1px solid #E8E8E8',
    paddingBottom: '4px',
    letterSpacing: '0.05em',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '6px 10px',
    backgroundColor: '#F5F5F5',
    borderRadius: '0',
    marginBottom: '4px',
    border: '1px solid #E8E8E8',
  },
  rowLabel: {
    flex: 1,
    fontSize: '11px',
    color: '#1A1A1A',
    letterSpacing: '0.02em',
  },
  rowValue: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#1B4332',
    minWidth: '36px',
    textAlign: 'right',
  },
  checkbox: {
    marginRight: '6px',
    width: '16px',
    height: '16px',
  },
  select: {
    padding: '6px 10px',
    fontSize: '12px',
    border: '1px solid #E8E8E8',
    borderRadius: '0',
    backgroundColor: '#FFFFFF',
    minWidth: '70px',
  },
  mentsuRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 8px',
    backgroundColor: '#F5F5F5',
    borderRadius: '0',
    marginBottom: '3px',
    gap: '6px',
    flexWrap: 'wrap',
    border: '1px solid #E8E8E8',
  },
  mentsuTiles: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '1px',
    marginRight: '4px',
  },
  mentsuInfo: {
    flex: 1,
    fontSize: '11px',
    color: '#666666',
    minWidth: '40px',
  },
  mentsuType: {
    fontWeight: 500,
    color: '#1A1A1A',
  },
  fuButtonGroup: {
    display: 'flex',
    gap: '3px',
    flexWrap: 'wrap',
  },
  fuButton: {
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 500,
    border: '1px solid #E8E8E8',
    borderRadius: '0',
    backgroundColor: '#FFFFFF',
    color: '#666666',
    cursor: 'pointer',
    minWidth: '28px',
    textAlign: 'center',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  fuButtonSelected: {
    backgroundColor: '#1B4332',
    border: '1px solid #1B4332',
    color: '#FFFFFF',
  },
  fuButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  summary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '6px 10px',
    backgroundColor: '#F5F5F5',
    borderRadius: '0',
    marginTop: '6px',
    marginBottom: '8px',
    border: '1px solid #E8E8E8',
  },
  summaryText: {
    fontSize: '11px',
    color: '#999999',
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
  submitButtonDisabled: {
    backgroundColor: '#D0D0D0',
    cursor: 'not-allowed',
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
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
  },
  resultIcon: {
    fontSize: '18px',
  },
  resultTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 500,
  },
  resultScoreBox: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '8px',
  },
  resultScoreItem: {
    textAlign: 'center',
  },
  resultScoreLabel: {
    fontSize: '9px',
    color: '#999999',
    marginBottom: '2px',
  },
  resultScoreValue: {
    fontSize: '14px',
    fontWeight: 500,
  },
  breakdownSection: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: '0',
    padding: '8px',
    marginBottom: '8px',
  },
  breakdownTitle: {
    fontSize: '10px',
    fontWeight: 500,
    color: '#999999',
    marginBottom: '6px',
    letterSpacing: '0.05em',
  },
  breakdownList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    padding: '2px 0',
    color: '#1A1A1A',
    borderBottom: '1px dashed #E8E8E8',
  },
  breakdownItemLast: {
    borderBottom: 'none',
    fontWeight: 500,
    paddingTop: '6px',
    marginTop: '2px',
    borderTop: '1px solid #E8E8E8',
  },
  hint: {
    fontSize: '10px',
    color: '#999999',
    marginBottom: '8px',
    letterSpacing: '0.02em',
  },
};

// 面子の種類名を取得
function getMentsuTypeName(mentsu: Mentsu): string {
  const typeNames = {
    shuntsu: '順子',
    koutsu: mentsu.isOpen ? '明刻' : '暗刻',
    kantsu: mentsu.isOpen ? '明槓' : '暗槓',
  };
  return typeNames[mentsu.type];
}

// 面子の符のボタン選択肢（全ての面子で同じ選択肢）
const MENTSU_FU_OPTIONS = [0, 2, 4, 8, 16, 32];

// 待ちの種類名を取得
function getWaitTypeName(waitType: string): string {
  const names: Record<string, string> = {
    ryanmen: '両面待ち',
    kanchan: 'カンチャン待ち',
    penchan: 'ペンチャン待ち',
    shanpon: 'シャンポン待ち',
    tanki: '単騎待ち',
  };
  return names[waitType] || waitType;
}

// 待ち表示用の型
interface WaitDisplay {
  tiles: TileType[];
  secondaryTiles?: TileType[]; // シャンポン待ちの場合の雀頭
}

// 待ちの牌を取得（和了牌と待ちの形を表現する牌）
function getWaitTiles(problem: Problem): WaitDisplay {
  const winTile = problem.winningTile;

  switch (problem.waitType) {
    case 'ryanmen': {
      // 両面待ち: 例えば3で上がりなら 1-2 または 4-5 の両面
      // 和了牌の両隣を表示
      if (winTile.suit === 'honor') return { tiles: [winTile, winTile] };
      const lower = { ...winTile, value: winTile.value - 1 };
      const upper = { ...winTile, value: winTile.value + 1 };
      if (winTile.value <= 3) {
        return { tiles: [winTile, upper] };
      } else {
        return { tiles: [lower, winTile] };
      }
    }
    case 'kanchan': {
      // カンチャン待ち: 例えば5待ちなら 4-6
      if (winTile.suit === 'honor') return { tiles: [winTile, winTile] };
      return {
        tiles: [
          { ...winTile, value: winTile.value - 1 },
          { ...winTile, value: winTile.value + 1 },
        ],
      };
    }
    case 'penchan': {
      // ペンチャン待ち: 1-2-3待ちまたは7-8-9待ち
      if (winTile.suit === 'honor') return { tiles: [winTile, winTile] };
      if (winTile.value === 3) {
        return {
          tiles: [
            { ...winTile, value: 1 },
            { ...winTile, value: 2 },
          ],
        };
      } else {
        return {
          tiles: [
            { ...winTile, value: 8 },
            { ...winTile, value: 9 },
          ],
        };
      }
    }
    case 'shanpon': {
      // シャンポン待ち: 2つの対子（和了牌の対子 + 雀頭）
      const jantouTile = problem.jantou.tiles[0];
      return {
        tiles: [winTile, winTile],
        secondaryTiles: [jantouTile, jantouTile],
      };
    }
    case 'tanki': {
      // 単騎待ち: 1牌
      return { tiles: [winTile] };
    }
    default:
      return { tiles: [winTile] };
  }
}

// 七対子かどうかを判定（型ガードを使用）
function isChiitoitsu(problem: Problem): boolean {
  return isChiitoitsuProblem(problem);
}

export function FuStep({ problem, fuBreakdown, onSubmit, onNext, result }: FuStepProps): ReactElement {
  // 七対子の場合は簡易表示
  if (isChiitoitsu(problem)) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>ステップ2: 符を計算</h3>

        <div style={{
          padding: '16px',
          backgroundColor: '#F0F7F4',
          borderRadius: '0',
          textAlign: 'center',
          borderLeft: '3px solid #2D6A4F',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#2D6A4F',
            color: '#FFFFFF',
            borderRadius: '0',
            fontSize: '10px',
            fontWeight: 500,
            marginBottom: '10px',
            letterSpacing: '0.1em',
          }}>
            七対子
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 500,
            color: '#1B4332',
            marginBottom: '2px',
          }}>
            25<span style={{ fontSize: '14px', marginLeft: '2px', fontWeight: 400 }}>符</span>
          </div>
          <div style={{
            fontSize: '10px',
            color: '#999999',
            padding: '6px 10px',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: '0',
            marginTop: '8px',
            letterSpacing: '0.05em',
          }}>
            特殊形のため固定
          </div>
        </div>

        <button
          onClick={onNext}
          style={{
            ...styles.submitButton,
            marginTop: '10px',
            width: '100%',
          }}
        >
          次へ（点数計算）
        </button>
      </div>
    );
  }

  // 平和の場合は簡易表示
  if (isPinfu(problem)) {
    const pinfuFu = problem.winType === 'tsumo' ? 20 : 30;
    const pinfuType = problem.winType === 'tsumo' ? 'ツモ' : 'ロン';
    const pinfuNote = problem.winType === 'tsumo'
      ? 'ツモ符がつかない'
      : '門前ロン加符がつかない';

    return (
      <div style={styles.container}>
        <h3 style={styles.title}>ステップ2: 符を計算</h3>

        <div style={{
          padding: '16px',
          backgroundColor: '#F0F7F4',
          borderRadius: '0',
          textAlign: 'center',
          borderLeft: '3px solid #2D6A4F',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            backgroundColor: '#2D6A4F',
            color: '#FFFFFF',
            borderRadius: '0',
            fontSize: '10px',
            fontWeight: 500,
            marginBottom: '10px',
            letterSpacing: '0.1em',
          }}>
            平和{pinfuType}
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 500,
            color: '#1B4332',
            marginBottom: '2px',
          }}>
            {pinfuFu}<span style={{ fontSize: '14px', marginLeft: '2px', fontWeight: 400 }}>符</span>
          </div>
          <div style={{
            fontSize: '10px',
            color: '#999999',
            padding: '6px 10px',
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: '0',
            marginTop: '8px',
            letterSpacing: '0.05em',
          }}>
            {pinfuNote}ため固定
          </div>
        </div>

        <button
          onClick={onNext}
          style={{
            ...styles.submitButton,
            marginTop: '10px',
            width: '100%',
          }}
        >
          次へ（点数計算）
        </button>
      </div>
    );
  }

  // 各項目の選択状態
  const [agariMethodFu, setAgariMethodFu] = useState(0); // 0: 副露ロン, 2: ツモ, 10: 門前ロン
  const [mentsuFuValues, setMentsuFuValues] = useState<number[]>([0, 0, 0, 0]);
  const [jantouFu, setJantouFu] = useState(0);
  const [waitFu, setWaitFu] = useState(0);

  // 小計を計算
  const calculateRawTotal = (): number => {
    let total = 20; // 副底
    total += agariMethodFu;
    total += mentsuFuValues.reduce((sum, v) => sum + v, 0);
    total += jantouFu;
    total += waitFu;
    return total;
  };

  const rawTotal = calculateRawTotal();
  const roundedTotal = Math.ceil(rawTotal / 10) * 10;

  // 面子の符を更新
  const handleMentsuFuChange = (index: number, value: number) => {
    if (result !== null) return;
    const newValues = [...mentsuFuValues];
    newValues[index] = value;
    setMentsuFuValues(newValues);
  };

  const handleSubmit = () => {
    onSubmit({
      agariMethodFu,
      mentsuFu: mentsuFuValues,
      jantouFu,
      waitFu,
      totalFu: roundedTotal,
    });
  };

  return (
    <div style={styles.container} className="fu-step-container">
      <h3 style={styles.title}>ステップ2: 符を計算（副底20符 + 各項目）</h3>

      {/* 和了方法 */}
      <div style={styles.mentsuRow} className="fu-mentsu-row">
        <div style={styles.mentsuInfo} className="fu-info">
          <span style={styles.mentsuType}>和了</span>
        </div>
        <div style={styles.fuButtonGroup} className="fu-agari-buttons">
          {[
            { value: 0, label: '0' },
            { value: 2, label: '2 ツモ' },
            { value: 10, label: '10 門前ロン' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => result === null && setAgariMethodFu(option.value)}
              disabled={result !== null}
              style={{
                ...styles.fuButton,
                ...(agariMethodFu === option.value ? styles.fuButtonSelected : {}),
                ...(result !== null ? styles.fuButtonDisabled : {}),
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 面子の符 */}
      {problem.mentsu.map((mentsu, index) => {
        const isKantsu = mentsu.type === 'kantsu';
        const isAnkan = isKantsu && !mentsu.isOpen;

        return (
          <div key={index} style={styles.mentsuRow} className="fu-mentsu-row">
            <div style={styles.mentsuTiles} className="fu-tiles">
              {mentsu.tiles.map((tile, tileIndex) => {
                if (isAnkan && (tileIndex === 0 || tileIndex === 3)) {
                  return <Tile key={tileIndex} tile={tile} size="small" faceDown />;
                }
                if (mentsu.isOpen && tileIndex === 0) {
                  return <Tile key={tileIndex} tile={tile} size="small" horizontal />;
                }
                return <Tile key={tileIndex} tile={tile} size="small" />;
              })}
            </div>
            <div style={styles.mentsuInfo} className="fu-info">
              <span style={styles.mentsuType}>{getMentsuTypeName(mentsu)}</span>
            </div>
            <div style={styles.fuButtonGroup} className="fu-button-group">
              {MENTSU_FU_OPTIONS.map((value) => (
                <button
                  key={value}
                  onClick={() => handleMentsuFuChange(index, value)}
                  disabled={result !== null}
                  style={{
                    ...styles.fuButton,
                    ...(mentsuFuValues[index] === value ? styles.fuButtonSelected : {}),
                    ...(result !== null ? styles.fuButtonDisabled : {}),
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* 雀頭 */}
      <div style={styles.mentsuRow} className="fu-mentsu-row">
        <div style={styles.mentsuTiles} className="fu-tiles">
          {problem.jantou.tiles.map((tile, tileIndex) => (
            <Tile key={tileIndex} tile={tile} size="small" />
          ))}
        </div>
        <div style={styles.mentsuInfo} className="fu-info">
          <span style={styles.mentsuType}>雀頭</span>
        </div>
        <div style={styles.fuButtonGroup} className="fu-button-group">
          {[0, 2, 4].map((value) => (
            <button
              key={value}
              onClick={() => result === null && setJantouFu(value)}
              disabled={result !== null}
              style={{
                ...styles.fuButton,
                ...(jantouFu === value ? styles.fuButtonSelected : {}),
                ...(result !== null ? styles.fuButtonDisabled : {}),
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* 待ち */}
      <div style={styles.mentsuRow} className="fu-mentsu-row">
        <div style={styles.mentsuTiles} className="fu-tiles">
          {(() => {
            const waitDisplay = getWaitTiles(problem);
            return (
              <>
                {waitDisplay.tiles.map((tile, tileIndex) => (
                  <Tile key={tileIndex} tile={tile} size="small" />
                ))}
                {waitDisplay.secondaryTiles && (
                  <>
                    <span style={{ margin: '0 2px', color: '#666', fontSize: '10px' }}>(</span>
                    {waitDisplay.secondaryTiles.map((tile, tileIndex) => (
                      <Tile key={`secondary-${tileIndex}`} tile={tile} size="small" />
                    ))}
                    <span style={{ color: '#666', fontSize: '10px' }}>)</span>
                  </>
                )}
              </>
            );
          })()}
        </div>
        <div style={styles.mentsuInfo} className="fu-info">
          <span style={styles.mentsuType}>{getWaitTypeName(problem.waitType)}</span>
        </div>
        <div style={styles.fuButtonGroup} className="fu-button-group">
          {[0, 2].map((value) => (
            <button
              key={value}
              onClick={() => result === null && setWaitFu(value)}
              disabled={result !== null}
              style={{
                ...styles.fuButton,
                ...(waitFu === value ? styles.fuButtonSelected : {}),
                ...(result !== null ? styles.fuButtonDisabled : {}),
              }}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* 合計表示 */}
      <div style={styles.summary} className="fu-summary">
        <span style={styles.summaryText} className="summary-text">小計: {rawTotal}符 → 切り上げ</span>
        <span style={styles.summaryTotal} className="summary-total">{roundedTotal}符</span>
      </div>

      {result === null ? (
        <button
          onClick={handleSubmit}
          style={styles.submitButton}
        >
          回答する
        </button>
      ) : !result.isCorrect ? (
        // 不正解時のみ解説を表示
        <div style={{ ...styles.resultSection, ...styles.resultIncorrect }}>
          {/* ヘッダー（不正解 + 符を1行で表示） */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
            <h4
              style={{
                ...styles.resultTitle,
                color: '#B87333',
                fontSize: '20px',
                margin: 0,
              }}
            >
              惜しい！
            </h4>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {fuBreakdown.total}符
            </span>
            <span style={{ fontSize: '14px', color: '#888' }}>
              （あなた: {result.selectedFu}符）
            </span>
          </div>

          {/* 各項目の正誤詳細（間違いがある場合のみ表示） */}
          {result.details && (
            <div style={{ ...styles.breakdownSection, backgroundColor: '#F5EDE3', marginBottom: '12px' }}>
              <div style={{ ...styles.breakdownTitle, color: '#B87333' }}>間違った項目</div>
              <ul style={styles.breakdownList}>
                {!result.details.agariMethodFu.isCorrect && (
                  <li style={styles.breakdownItem}>
                    <span>和了方法</span>
                    <span style={{ color: '#B87333' }}>
                      {result.details.agariMethodFu.selected}符 → 正解: {result.details.agariMethodFu.correct}符
                    </span>
                  </li>
                )}
                {result.details.mentsuFu.map((m, i) =>
                  !m.isCorrect && (
                    <li key={`mentsu-${i}`} style={styles.breakdownItem}>
                      <span>面子{i + 1}</span>
                      <span style={{ color: '#B87333' }}>
                        {m.selected}符 → 正解: {m.correct}符
                      </span>
                    </li>
                  )
                )}
                {!result.details.jantouFu.isCorrect && (
                  <li style={styles.breakdownItem}>
                    <span>雀頭</span>
                    <span style={{ color: '#B87333' }}>
                      {result.details.jantouFu.selected}符 → 正解: {result.details.jantouFu.correct}符
                    </span>
                  </li>
                )}
                {!result.details.waitFu.isCorrect && (
                  <li style={styles.breakdownItem}>
                    <span>待ち</span>
                    <span style={{ color: '#B87333' }}>
                      {result.details.waitFu.selected}符 → 正解: {result.details.waitFu.correct}符
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* 符の内訳 */}
          <div style={styles.breakdownSection}>
            <div style={styles.breakdownTitle}>正解の内訳</div>
            <ul style={styles.breakdownList}>
              {getFuBreakdownDescription(fuBreakdown, isPinfu(problem), problem.winType).map((desc, index, arr) => {
                // "副底: 20符" のような形式を分割
                const parts = desc.split(': ');
                const isLast = index === arr.length - 1;
                const isSubtotal = parts[0] === '小計' || parts[0] === '合計';
                return (
                  <li
                    key={index}
                    style={{
                      ...styles.breakdownItem,
                      ...(isLast ? styles.breakdownItemLast : {}),
                      ...(isSubtotal && !isLast ? { borderTop: '2px solid #BDBDBD', paddingTop: '8px', marginTop: '4px' } : {}),
                    }}
                  >
                    <span>{parts[0]}</span>
                    <span>{parts[1] || ''}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            onClick={onNext}
            style={{
              ...styles.submitButton,
              width: '100%',
              padding: '14px',
            }}
          >
            次へ（点数計算）
          </button>
        </div>
      ) : null}
    </div>
  );
}