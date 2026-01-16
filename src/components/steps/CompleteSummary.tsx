import { CSSProperties, ReactElement } from 'react';
import { FuBreakdown, ScoreResult } from '../../logic/types';
import { ProblemWithYaku } from '../../logic/problem-generator';
import { getYakuById } from '../../logic/yaku-list';
import { formatScore, getTsumoTotal } from '../../logic/score-calculator';
import { getFuBreakdownDescription } from '../../logic/fu-calculator';

interface CompleteSummaryProps {
  problem: ProblemWithYaku;
  fuBreakdown: FuBreakdown;
  scoreResult: ScoreResult;
  onNext: () => void;
}

const styles: Record<string, CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #E0D8CC',
  },
  title: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#4A4A4A',
    textAlign: 'center',
    paddingBottom: '8px',
    borderBottom: '1px solid #E0D8CC',
  },
  horizontalContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  card: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#F5F3EF',
    borderRadius: '8px',
    minWidth: 0,
  },
  cardTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#2D5016',
    marginBottom: '6px',
    textAlign: 'center',
  },
  cardValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#4A4A4A',
    textAlign: 'center',
  },
  cardSubtext: {
    fontSize: '11px',
    color: '#666666',
    textAlign: 'center',
    marginTop: '4px',
  },
  scoreCard: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#E3F2FD',
    borderRadius: '8px',
    minWidth: 0,
  },
  scoreValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1565C0',
    textAlign: 'center',
  },
  detailList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    fontSize: '10px',
    color: '#666666',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '2px 0',
  },
  nextButton: {
    padding: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    backgroundColor: '#2D5016',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
    outline: 'none',
  },
};

export function CompleteSummary({
  problem,
  fuBreakdown,
  scoreResult,
  onNext,
}: CompleteSummaryProps): ReactElement {
  const correctScore =
    problem.winType === 'ron'
      ? scoreResult.ronPoints!
      : getTsumoTotal(scoreResult, problem.playerType);

  const scoreDisplay = formatScore(scoreResult, problem.playerType, problem.winType);
  const fuDescriptions = getFuBreakdownDescription(fuBreakdown);

  // 役の詳細テキスト
  const yakuDetails = problem.yakuResult.yakuList.map((yaku) => {
    const def = getYakuById(yaku.id);
    return `${def?.name || yaku.id} ${yaku.han}翻`;
  });
  if (problem.yakuResult.doraCount > 0) {
    yakuDetails.push(`ドラ ${problem.yakuResult.doraCount}枚`);
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>正解</h3>

      {/* 横並び: 役・符・点数 */}
      <div style={styles.horizontalContainer}>
        {/* 役 */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>役</div>
          <div style={styles.cardValue}>{problem.yakuResult.totalHan}翻</div>
          <div style={styles.cardSubtext}>
            {yakuDetails.join(', ')}
          </div>
        </div>

        {/* 符 */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>符</div>
          <div style={styles.cardValue}>{fuBreakdown.total}符</div>
          <ul style={styles.detailList}>
            {fuDescriptions.slice(0, -1).map((desc, index) => {
              const parts = desc.split(': ');
              return (
                <li key={index} style={styles.detailItem}>
                  <span>{parts[0]}</span>
                  <span>{parts[1]?.replace('符', '') || ''}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* 点数 */}
        <div style={styles.scoreCard}>
          <div style={styles.cardTitle}>点数</div>
          <div style={styles.scoreValue}>{correctScore?.toLocaleString()}</div>
          <div style={styles.cardSubtext}>
            {scoreResult.limitName && `${scoreResult.limitName} `}
            {scoreDisplay}
          </div>
        </div>
      </div>

      <button style={styles.nextButton} onClick={onNext}>
        次の問題へ
      </button>
    </div>
  );
}
