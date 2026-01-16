import { CSSProperties, ReactElement } from 'react';
import { LearningStep, StepAnswerState, FuBreakdown, ScoreResult } from '../../logic/types';
import { YakuResult } from '../../logic/yaku-types';

interface StepProgressProps {
  currentStep: LearningStep;
  stepStates: StepAnswerState;
  yakuResult?: YakuResult;
  fuBreakdown?: FuBreakdown;
  scoreResult?: ScoreResult;
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    gap: '6px',
    marginBottom: '10px',
    padding: '8px 10px',
    backgroundColor: '#FFFFFF',
    borderRadius: '0',
    border: '1px solid #E8E8E8',
  },
  step: {
    flex: 1,
    padding: '6px 6px',
    borderRadius: '0',
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: 500,
    backgroundColor: '#F5F5F5',
    color: '#999999',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    letterSpacing: '0.03em',
  },
  active: {
    backgroundColor: '#1B4332',
    color: '#FFFFFF',
  },
  correct: {
    backgroundColor: '#F0F7F4',
    color: '#2D6A4F',
    borderBottom: '2px solid #2D6A4F',
  },
  incorrect: {
    backgroundColor: '#FDF8F0',
    color: '#B8860B',
    borderBottom: '2px solid #B8860B',
  },
  connector: {
    display: 'flex',
    alignItems: 'center',
    color: '#D0D0D0',
    fontSize: '14px',
    padding: '0 4px',
    fontWeight: 300,
  },
};

export function StepProgress({ currentStep, stepStates, yakuResult, fuBreakdown }: StepProgressProps): ReactElement {
  // ラベルを生成（回答済みの場合は翻数・符を表示）
  const getYakuLabel = (): string => {
    if (stepStates.yaku.submitted && yakuResult) {
      return `1. 役 ${yakuResult.totalHan}翻`;
    }
    return '1. 役';
  };

  const getFuLabel = (): string => {
    if (stepStates.fu.submitted && fuBreakdown) {
      return `2. 符 ${fuBreakdown.total}符`;
    }
    return '2. 符';
  };

  const steps = [
    { key: 'yaku' as const, label: getYakuLabel(), state: stepStates.yaku },
    { key: 'fu' as const, label: getFuLabel(), state: stepStates.fu },
    { key: 'score' as const, label: '3. 点数', state: stepStates.score },
  ];

  const getStepStyle = (
    stepKey: LearningStep,
    state: { isCorrect: boolean | null; submitted: boolean }
  ): CSSProperties => {
    const baseStyle = { ...styles.step };

    if (state.submitted) {
      if (state.isCorrect === true) {
        return { ...baseStyle, ...styles.correct };
      } else if (state.isCorrect === false) {
        return { ...baseStyle, ...styles.incorrect };
      }
    }

    if (currentStep === stepKey) {
      return { ...baseStyle, ...styles.active };
    }

    return baseStyle;
  };

  return (
    <div style={styles.container}>
      {steps.map((step, index) => (
        <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={getStepStyle(step.key, step.state)}>
            {step.label}
            {step.state.isCorrect === true && ' ○'}
            {step.state.isCorrect === false && ' ×'}
          </div>
          {index < steps.length - 1 && <div style={styles.connector}>→</div>}
        </div>
      ))}
    </div>
  );
}
