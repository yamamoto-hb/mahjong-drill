import { useState, useCallback, useEffect, CSSProperties } from 'react';
import {
  FuBreakdown,
  ScoreResult,
  LearningStep,
  StepAnswerState,
  isChiitoitsuProblem,
} from './logic/types';
import { generateProblem, ProblemWithYaku } from './logic/problem-generator';
import { calculateFu, isPinfu } from './logic/fu-calculator';
import { calculateScore } from './logic/score-calculator';
import { Header } from './components/Header';
import { HandDisplay } from './components/HandDisplay';
import { TutorialSection } from './components/TutorialSection';
import { StepProgress } from './components/steps/StepProgress';
import { YakuStep } from './components/steps/YakuStep';
import { FuStep, FuSelection } from './components/steps/FuStep';
import { ScoreStep } from './components/steps/ScoreStep';
import { CompleteSummary } from './components/steps/CompleteSummary';

const styles: Record<string, CSSProperties> = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#F5F3EF',
    fontFamily: '"Noto Sans JP", "Yu Gothic UI", "Hiragino Sans", sans-serif',
  },
  mainContent: {
    display: 'flex',
    gap: '20px',
    padding: '16px 20px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  leftColumn: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  problemArea: {
    display: 'inline-block',
  },
  rightColumn: {
    flex: '0 0 480px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    minWidth: '480px',
    maxWidth: '480px',
  },
  footer: {
    padding: '12px 20px',
    textAlign: 'center',
    fontSize: '10px',
    color: '#999999',
    borderTop: '1px solid #E8E8E8',
    backgroundColor: '#FFFFFF',
    letterSpacing: '0.02em',
  },
};

// 初期ステップ状態
function createInitialStepState(): StepAnswerState {
  return {
    yaku: { selectedYakuIds: [], selectedDoraCount: 0, isCorrect: null, submitted: false },
    fu: { selectedFu: null, isCorrect: null, submitted: false },
    score: { inputScore: null, isCorrect: null, submitted: false },
  };
}

function App() {
  // 問題
  const [problem, setProblem] = useState<ProblemWithYaku>(
    () => generateProblem('beginner') as ProblemWithYaku
  );
  const [fuBreakdown, setFuBreakdown] = useState<FuBreakdown>(() => calculateFu(problem));
  const [scoreResult, setScoreResult] = useState<ScoreResult>(() => calculateScore(problem));

  // ステップ状態
  const [currentStep, setCurrentStep] = useState<LearningStep>('yaku');
  const [stepStates, setStepStates] = useState<StepAnswerState>(createInitialStepState);

  // デバッグ用: ビューポート幅を表示
  const [viewportWidth, setViewportWidth] = useState(0);
  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // 新しい問題を生成
  const generateNewProblem = useCallback(() => {
    const newProblem = generateProblem('beginner') as ProblemWithYaku;

    setProblem(newProblem);
    setFuBreakdown(calculateFu(newProblem));
    setScoreResult(calculateScore(newProblem));
    setCurrentStep('yaku');
    setStepStates(createInitialStepState());
  }, []);

  // ステップ1: 役の回答処理
  const handleYakuSubmit = useCallback(
    (selectedYakuIds: string[], doraCount: number) => {
      const correctYakuIds = problem.yakuResult.yakuList.map((y) => y.id);
      const correctDoraCount = problem.yakuResult.doraCount;

      // 役の一致判定（順不同）
      // correctYakuIdsはYakuId[]型、selectedYakuIdsはstring[]型のため文字列比較で判定
      const yakuCorrect =
        selectedYakuIds.length === correctYakuIds.length &&
        selectedYakuIds.every((id) => correctYakuIds.some((correctId) => correctId === id));
      const doraCorrect = doraCount === correctDoraCount;
      const isCorrect = yakuCorrect && doraCorrect;

      setStepStates((prev) => ({
        ...prev,
        yaku: { selectedYakuIds, selectedDoraCount: doraCount, isCorrect, submitted: true },
      }));

      // 正解なら自動で次へ
      if (isCorrect) {
        setCurrentStep('fu');
      }
    },
    [problem]
  );

  // ステップ2: 符の回答処理
  const handleFuSubmit = useCallback(
    (selection: FuSelection) => {
      // 正解の和了方法符を計算
      const correctAgariMethodFu = fuBreakdown.menzenRon > 0 ? 10 : fuBreakdown.tsumo > 0 ? 2 : 0;

      // 各項目を検証
      const agariMethodCheck = {
        selected: selection.agariMethodFu,
        correct: correctAgariMethodFu,
        isCorrect: selection.agariMethodFu === correctAgariMethodFu,
      };

      const mentsuCheck = fuBreakdown.mentsuFu.map((item, index) => ({
        selected: selection.mentsuFu[index] ?? 0,
        correct: item.fu,
        isCorrect: (selection.mentsuFu[index] ?? 0) === item.fu,
      }));

      const jantouCheck = {
        selected: selection.jantouFu,
        correct: fuBreakdown.jantouFu,
        isCorrect: selection.jantouFu === fuBreakdown.jantouFu,
      };

      const waitCheck = {
        selected: selection.waitFu,
        correct: fuBreakdown.waitFu,
        isCorrect: selection.waitFu === fuBreakdown.waitFu,
      };

      // 全項目が正しい場合のみ正解
      const allCorrect =
        agariMethodCheck.isCorrect &&
        mentsuCheck.every((m) => m.isCorrect) &&
        jantouCheck.isCorrect &&
        waitCheck.isCorrect;

      setStepStates((prev) => ({
        ...prev,
        fu: {
          selectedFu: selection.totalFu,
          isCorrect: allCorrect,
          submitted: true,
          details: {
            agariMethodFu: agariMethodCheck,
            mentsuFu: mentsuCheck,
            jantouFu: jantouCheck,
            waitFu: waitCheck,
          },
        },
      }));

      // 正解なら自動で次へ
      if (allCorrect) {
        setCurrentStep('score');
      }
    },
    [fuBreakdown]
  );

  // ステップ3: 点数の回答処理
  const handleScoreSubmit = useCallback(
    (inputScore: number) => {
      let isCorrect = false;

      if (problem.winType === 'ron') {
        // ロン: 単純な点数一致
        isCorrect = inputScore === scoreResult.ronPoints;
      } else if (problem.playerType === 'oya') {
        // 親ツモ: オール点数（子払い）が一致
        isCorrect = inputScore === scoreResult.tsumoPointsKo;
      } else {
        // 子ツモ: 子払い/親払いが一致（特殊エンコード）
        const inputKo = Math.floor(inputScore / 1000000);
        const inputOya = inputScore % 1000000;
        isCorrect =
          inputKo === scoreResult.tsumoPointsKo && inputOya === scoreResult.tsumoPointsOya;
      }

      setStepStates((prev) => ({
        ...prev,
        score: { inputScore, isCorrect, submitted: true },
      }));

      // 正解なら自動で次へ
      if (isCorrect) {
        setCurrentStep('complete');
      }
    },
    [problem, scoreResult]
  );

  // 七対子かどうかを判定
  const isChiitoitsu = isChiitoitsuProblem(problem);

  // 次のステップへ進む
  const handleNextStep = useCallback(() => {
    if (currentStep === 'yaku') {
      setCurrentStep('fu');
    } else if (currentStep === 'fu') {
      // 七対子の場合は符ステップを自動正解として設定
      if (isChiitoitsu) {
        setStepStates((prev) => ({
          ...prev,
          fu: { selectedFu: 25, isCorrect: true, submitted: true },
        }));
      }
      // 平和の場合も符ステップを自動正解として設定
      if (isPinfu(problem)) {
        const pinfuFu = problem.winType === 'tsumo' ? 20 : 30;
        setStepStates((prev) => ({
          ...prev,
          fu: { selectedFu: pinfuFu, isCorrect: true, submitted: true },
        }));
      }
      setCurrentStep('score');
    } else if (currentStep === 'score') {
      setCurrentStep('complete');
    }
  }, [currentStep, isChiitoitsu, problem]);

  // ステップモードのUI
  const renderStepMode = () => (
    <>
      <StepProgress
        currentStep={currentStep}
        stepStates={stepStates}
        yakuResult={problem.yakuResult}
        fuBreakdown={fuBreakdown}
      />

      {currentStep === 'yaku' && (
        <YakuStep
          problem={problem}
          onSubmit={handleYakuSubmit}
          onNext={handleNextStep}
          result={stepStates.yaku.submitted ? stepStates.yaku : null}
        />
      )}

      {currentStep === 'fu' && (
        <FuStep
          problem={problem}
          fuBreakdown={fuBreakdown}
          onSubmit={handleFuSubmit}
          onNext={handleNextStep}
          result={stepStates.fu.submitted ? stepStates.fu : null}
        />
      )}

      {currentStep === 'score' && (
        <ScoreStep
          problem={problem}
          scoreResult={scoreResult}
          onSubmit={handleScoreSubmit}
          onNext={handleNextStep}
          result={stepStates.score.submitted ? stepStates.score : null}
        />
      )}

      {currentStep === 'complete' && (
        <CompleteSummary
          problem={problem}
          fuBreakdown={fuBreakdown}
          scoreResult={scoreResult}
          onNext={generateNewProblem}
        />
      )}
    </>
  );

  return (
    <div style={styles.app}>
      {/* デバッグ用バナー - 後で削除 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'red',
        color: 'white',
        padding: '8px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        zIndex: 9999,
      }}>
        Viewport: {viewportWidth}px | Mode: {viewportWidth <= 1024 ? 'MOBILE' : 'PC'}
      </div>
      <Header />

      <main style={styles.mainContent} className="main-content">
        <div style={styles.leftColumn}>
          <div style={styles.problemArea}>
            <HandDisplay problem={problem} />

            {renderStepMode()}
          </div>
        </div>

        <aside style={styles.rightColumn} className="right-column">
          <TutorialSection />
        </aside>
      </main>

      <footer style={styles.footer}>
        <p>
          このツールは練習用です。実際のルールは場によって異なる場合があります。
          <br />
          赤ドラ、一発、裏ドラなどの偶発役は翻数に含めていません。
        </p>
      </footer>
    </div>
  );
}

export default App;