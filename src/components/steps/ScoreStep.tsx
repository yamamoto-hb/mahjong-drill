import { CSSProperties, ReactElement, useState, useCallback } from 'react';
import { Problem, ScoreResult, StepAnswerState } from '../../logic/types';
import { formatScore } from '../../logic/score-calculator';
import { ScoreTable } from '../ScoreTable';

// セルの座標を表す型
interface CellKey {
  fu: number | 'limit';
  han: number;
}

interface ScoreStepProps {
  problem: Problem;
  scoreResult: ScoreResult;
  onSubmit: (score: number) => void;
  onNext: () => void;
  result: StepAnswerState['score'] | null;
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
    margin: '0 0 8px 0',
    fontSize: '11px',
    fontWeight: 500,
    color: '#1A1A1A',
    letterSpacing: '0.05em',
  },
  hint: {
    fontSize: '10px',
    color: '#666666',
    marginBottom: '8px',
    padding: '6px 10px',
    backgroundColor: '#F5F5F5',
    borderRadius: '0',
    border: '1px solid #E8E8E8',
    letterSpacing: '0.02em',
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  input: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #E8E8E8',
    borderRadius: '0',
    width: '90px',
    outline: 'none',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    transition: 'border-color 0.2s ease',
  },
  inputSmall: {
    padding: '8px 10px',
    fontSize: '13px',
    border: '1px solid #E8E8E8',
    borderRadius: '0',
    width: '70px',
    outline: 'none',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    transition: 'border-color 0.2s ease',
  },
  unit: {
    fontSize: '11px',
    color: '#999999',
    fontWeight: 500,
  },
  submitButton: {
    padding: '8px 16px',
    fontSize: '11px',
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
    marginTop: '8px',
    padding: '10px',
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
    margin: '0 0 6px 0',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.05em',
  },
  scoreDetail: {
    fontSize: '10px',
    color: '#1A1A1A',
    marginBottom: '4px',
    letterSpacing: '0.02em',
  },
};

export function ScoreStep({
  problem,
  scoreResult,
  onSubmit,
  onNext,
  result,
}: ScoreStepProps): ReactElement {
  // ロン用の入力
  const [inputRon, setInputRon] = useState<string>('');
  // ツモ用の入力（親: オール点数、子: 子払い/親払い）
  const [inputTsumoKo, setInputTsumoKo] = useState<string>('');
  const [inputTsumoOya, setInputTsumoOya] = useState<string>('');
  // 選択されたセルの座標
  const [selectedCell, setSelectedCell] = useState<CellKey | null>(null);

  const isRon = problem.winType === 'ron';
  const isOya = problem.playerType === 'oya';

  // 点数早見表からの選択を処理（座標ベース）
  const handleCellSelect = useCallback((cell: CellKey, score: string) => {
    if (result !== null) return; // 回答済みの場合は無視

    setSelectedCell(cell);

    if (isRon) {
      setInputRon(score);
    } else if (isOya) {
      // 親ツモ: "500 all" → "500"
      const allMatch = score.match(/^(\d+,?\d*) all$/);
      if (allMatch) {
        setInputTsumoKo(allMatch[1]);
      }
    } else {
      // 子ツモ: "300/500" → ko=300, oya=500
      const tsumoMatch = score.match(/^(\d+,?\d*)\/(\d+,?\d*)$/);
      if (tsumoMatch) {
        setInputTsumoKo(tsumoMatch[1]);
        setInputTsumoOya(tsumoMatch[2]);
      }
    }
  }, [result, isRon, isOya]);

  // 正解の点数
  const correctRon = scoreResult.ronPoints;
  const correctTsumoKo = scoreResult.tsumoPointsKo;
  const correctTsumoOya = scoreResult.tsumoPointsOya;

  // 入力が有効かどうか
  const isInputValid = () => {
    if (isRon) {
      return inputRon.trim() !== '';
    } else if (isOya) {
      // 親ツモ: オール点数のみ
      return inputTsumoKo.trim() !== '';
    } else {
      // 子ツモ: 子払い/親払い両方
      return inputTsumoKo.trim() !== '' && inputTsumoOya.trim() !== '';
    }
  };

  const handleSubmit = () => {
    if (isRon) {
      const score = parseInt(inputRon.replace(/,/g, ''), 10);
      if (!isNaN(score)) {
        onSubmit(score);
      }
    } else if (isOya) {
      // 親ツモ: オール点数 × 3 = 合計点として送信
      const ko = parseInt(inputTsumoKo.replace(/,/g, ''), 10);
      if (!isNaN(ko)) {
        // 実際の判定は子の点数で行うため、子の点数を送信
        onSubmit(ko);
      }
    } else {
      // 子ツモ: 子払い + 子払い + 親払い = 合計点として送信
      const ko = parseInt(inputTsumoKo.replace(/,/g, ''), 10);
      const oya = parseInt(inputTsumoOya.replace(/,/g, ''), 10);
      if (!isNaN(ko) && !isNaN(oya)) {
        // 子払い×2 + 親払い = 合計（ただし実際は ko と oya の組み合わせで判定）
        onSubmit(ko * 1000000 + oya); // 特殊エンコード
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isInputValid()) {
      handleSubmit();
    }
  };

  // 正解判定（resultから）
  const checkCorrect = (): boolean => {
    if (!result) return false;
    if (isRon) {
      return result.inputScore === correctRon;
    } else if (isOya) {
      // 親ツモ: 子払いが一致
      return result.inputScore === correctTsumoKo;
    } else {
      // 子ツモ: 子払いと親払いが一致
      const inputKo = Math.floor((result.inputScore ?? 0) / 1000000);
      const inputOya = (result.inputScore ?? 0) % 1000000;
      return inputKo === correctTsumoKo && inputOya === correctTsumoOya;
    }
  };

  const isCorrect = result ? checkCorrect() : false;

  const scoreDisplay = formatScore(scoreResult, problem.playerType, problem.winType);
  const playerTypeText = problem.playerType === 'oya' ? '親' : '子';
  const winTypeText = problem.winType === 'ron' ? 'ロン' : 'ツモ';

  // ユーザーの回答表示
  const getUserAnswerDisplay = (): string => {
    if (!result || result.inputScore === null) return '';
    if (isRon) {
      return `${result.inputScore.toLocaleString()}点`;
    } else if (isOya) {
      return `${result.inputScore?.toLocaleString()}点オール`;
    } else {
      const inputKo = Math.floor((result.inputScore ?? 0) / 1000000);
      const inputOya = (result.inputScore ?? 0) % 1000000;
      return `${inputKo.toLocaleString()}/${inputOya.toLocaleString()}`;
    }
  };

  // 正解表示
  const getCorrectAnswerDisplay = (): string => {
    if (isRon) {
      return `${correctRon?.toLocaleString()}点`;
    } else if (isOya) {
      return `${correctTsumoKo?.toLocaleString()}点オール`;
    } else {
      return `${correctTsumoKo?.toLocaleString()}/${correctTsumoOya?.toLocaleString()}`;
    }
  };

  return (
    <>
      <ScoreTable
        onCellSelect={handleCellSelect}
        highlightedCell={selectedCell}
        playerType={problem.playerType}
        winType={problem.winType}
      />

      <div style={styles.container} className="score-step-container">
        <h3 style={styles.title}>
          ステップ3: {playerTypeText}{winTypeText}の点数
          {scoreResult.limitName && `（${scoreResult.limitName}）`}
        </h3>

      {isRon ? (
        // ロン: 単一入力
        <div style={styles.inputGroup} className="score-input-group">
          <input
            type="text"
            value={inputRon}
            onChange={(e) => setInputRon(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={result !== null}
            placeholder="3900"
            style={styles.input}
          />
          <span style={styles.unit} className="unit">点</span>
        </div>
      ) : isOya ? (
        // 親ツモ: オール入力
        <div style={styles.inputGroup} className="score-input-group">
          <input
            type="text"
            value={inputTsumoKo}
            onChange={(e) => setInputTsumoKo(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={result !== null}
            placeholder="2000"
            style={styles.input}
          />
          <span style={styles.unit} className="unit">点オール</span>
        </div>
      ) : (
        // 子ツモ: 子/親入力
        <div style={styles.inputGroup} className="score-input-group">
          <input
            type="text"
            value={inputTsumoKo}
            onChange={(e) => setInputTsumoKo(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={result !== null}
            placeholder="1000"
            style={styles.inputSmall}
          />
          <span style={styles.unit} className="unit">/</span>
          <input
            type="text"
            value={inputTsumoOya}
            onChange={(e) => setInputTsumoOya(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={result !== null}
            placeholder="2000"
            style={styles.inputSmall}
          />
          <span style={styles.unit} className="unit">（子/親）</span>
        </div>
      )}

      {result === null ? (
        <button
          onClick={handleSubmit}
          disabled={!isInputValid()}
          style={{
            ...styles.submitButton,
            ...(!isInputValid() ? styles.submitButtonDisabled : {}),
          }}
        >
          回答する
        </button>
      ) : !isCorrect ? (
        // 不正解時のみ解説を表示
        <div style={{ ...styles.resultSection, ...styles.resultIncorrect }}>
          <h4 style={{ ...styles.resultTitle, color: '#B87333' }}>
            惜しい！
          </h4>
          <p style={styles.scoreDetail}>
            <strong>正解:</strong> {getCorrectAnswerDisplay()}
            {scoreResult.limitName && ` (${scoreResult.limitName})`}
          </p>
          <p style={{ ...styles.scoreDetail, color: '#5C5C5C' }}>
            あなたの回答: {getUserAnswerDisplay()}
          </p>
          <p style={styles.scoreDetail}>
            <strong>計算式:</strong> {scoreResult.fu}符 {scoreResult.han}翻 → {scoreDisplay}
          </p>
          <button onClick={onNext} style={{ ...styles.submitButton, marginTop: '12px' }}>
            結果を見る
          </button>
        </div>
      ) : null}
    </div>
    </>
  );
}
