import { CSSProperties, useState, ReactElement } from 'react';
import { Tile } from './Tile';
import { parseTileNotation } from '../logic/tiles';

const styles: Record<string, CSSProperties> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '0',
    marginBottom: '24px',
    border: '1px solid #E8E8E8',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  tabList: {
    display: 'flex',
    borderBottom: '1px solid #E8E8E8',
    backgroundColor: '#F5F5F5',
    overflowX: 'auto',
  },
  tab: {
    flex: 1,
    padding: '14px 8px',
    border: 'none',
    borderBottom: '2px solid transparent',
    backgroundColor: 'transparent',
    fontSize: '12px',
    color: '#999999',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    outline: 'none',
    letterSpacing: '0.05em',
  },
  activeTab: {
    flex: 1,
    padding: '14px 8px',
    border: 'none',
    borderBottom: '2px solid #1B4332',
    backgroundColor: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 500,
    color: '#1B4332',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    outline: 'none',
    letterSpacing: '0.05em',
  },
  content: {
    padding: '20px',
    fontSize: '12px',
    lineHeight: '1.9',
    color: '#1A1A1A',
    width: '100%',
    boxSizing: 'border-box',
    overflowX: 'auto',
  },
  heading: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#1B4332',
    margin: '0 0 16px 0',
    letterSpacing: '0.05em',
  },
  subHeading: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#1A1A1A',
    margin: '24px 0 14px 0',
    paddingBottom: '8px',
    borderBottom: '1px solid #E8E8E8',
    letterSpacing: '0.03em',
  },
  list: {
    margin: '12px 0',
    paddingLeft: '20px',
  },
  listItem: {
    marginBottom: '12px',
    letterSpacing: '0.02em',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11px',
    marginTop: '12px',
  },
  th: {
    padding: '12px',
    backgroundColor: '#F5F5F5',
    border: '1px solid #E8E8E8',
    textAlign: 'left',
    fontWeight: 500,
    color: '#1A1A1A',
  },
  td: {
    padding: '12px',
    border: '1px solid #E8E8E8',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
  },
  highlight: {
    backgroundColor: 'rgba(27, 67, 50, 0.08)',
    padding: '4px 10px',
    borderRadius: '0',
    fontWeight: 500,
    color: '#1B4332',
  },
  importantBox: {
    backgroundColor: '#F5F5F5',
    padding: '16px',
    borderRadius: '0',
    marginTop: '16px',
    border: '1px solid #E8E8E8',
  },
  stepBox: {
    backgroundColor: '#F0F7F4',
    padding: '14px 18px',
    borderRadius: '0',
    marginBottom: '14px',
    borderLeft: '3px solid #2D6A4F',
  },
  stepNumber: {
    display: 'inline-block',
    width: '26px',
    height: '26px',
    borderRadius: '0',
    backgroundColor: '#1B4332',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: '26px',
    fontSize: '12px',
    fontWeight: 500,
    marginRight: '12px',
  },
  exampleBox: {
    backgroundColor: '#F5F5F5',
    padding: '16px',
    borderRadius: '0',
    marginTop: '16px',
    fontFamily: 'monospace',
    border: '1px solid #E8E8E8',
  },
  tilesRow: {
    display: 'inline-flex',
    alignItems: 'flex-end',
    gap: '2px',
    marginRight: '16px',
    marginBottom: '8px',
    verticalAlign: 'bottom',
    flexWrap: 'wrap',
  },
  tilesLabel: {
    fontSize: '11px',
    color: '#999999',
    marginRight: '8px',
  },
  tileExample: {
    backgroundColor: '#F5F5F5',
    padding: '12px 14px',
    borderRadius: '0',
    marginTop: '10px',
    overflow: 'hidden',
    border: '1px solid #E8E8E8',
  },
  tileExampleTitle: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#1A1A1A',
    marginBottom: '10px',
    letterSpacing: '0.03em',
  },
};

type TabType = 'basic' | 'fu' | 'score' | 'tips' | 'table';

const TABS: { key: TabType; label: string }[] = [
  { key: 'basic', label: '基本' },
  { key: 'fu', label: '符計算' },
  { key: 'score', label: '点数' },
  { key: 'tips', label: 'コツ' },
  { key: 'table', label: '点数表' },
];

// 牌を表示するヘルパーコンポーネント
interface TileDisplayProps {
  notation: string;
  label?: string;
  type?: 'normal' | 'minkoh' | 'ankoh' | 'minkan' | 'ankan';
}

function TileDisplay({ notation, label, type = 'normal' }: TileDisplayProps): ReactElement {
  const tiles = parseTileNotation(notation);
  // PCでは small、モバイルでは xsmall
  const tileSize = typeof window !== 'undefined' && window.innerWidth <= 480 ? 'xsmall' : 'small';
  return (
    <div style={styles.tilesRow} className="tutorial-tiles-row">
      {label && <span style={styles.tilesLabel} className="tutorial-tiles-label">{label}</span>}
      {tiles.map((tile, index) => {
        // 明刻: 1枚目を横向き
        if (type === 'minkoh') {
          return <Tile key={index} tile={tile} size={tileSize} horizontal={index === 0} />;
        }
        // 暗刻: すべて通常表示（門前なので）
        if (type === 'ankoh') {
          return <Tile key={index} tile={tile} size={tileSize} />;
        }
        // 明槓: 1枚目を横向き
        if (type === 'minkan') {
          return <Tile key={index} tile={tile} size={tileSize} horizontal={index === 0} />;
        }
        // 暗槓: 両端を裏向き
        if (type === 'ankan') {
          return <Tile key={index} tile={tile} size={tileSize} faceDown={index === 0 || index === 3} />;
        }
        return <Tile key={index} tile={tile} size={tileSize} />;
      })}
    </div>
  );
}

function BasicContent() {
  return (
    <div>
      <h4 style={styles.heading} className="tutorial-heading">基本用語</h4>

      <ul style={styles.list} className="tutorial-list">
        <li style={styles.listItem}>
          <strong>門前(メンゼン)</strong>: チー・ポン・カンで鳴いていない状態。リーチできる。
        </li>
        <li style={styles.listItem}>
          <strong>副露(フーロ)</strong>: 鳴いている状態。リーチ不可、一部の役が使えない。
        </li>
      </ul>

      <div style={styles.tileExample} className="tutorial-tile-example">
        <div style={styles.tileExampleTitle} className="tutorial-tile-example-title">順子（シュンツ）: 連続した3枚</div>
        <div>
          <TileDisplay notation="123m" label="例:" />
          <TileDisplay notation="456p" />
          <TileDisplay notation="789s" />
        </div>
      </div>

      <div style={styles.tileExample} className="tutorial-tile-example">
        <div style={styles.tileExampleTitle} className="tutorial-tile-example-title">刻子（コーツ）: 同じ牌3枚</div>
        <div>
          <TileDisplay notation="111m" label="例:" />
          <TileDisplay notation="555z" />
        </div>
      </div>

      <div style={styles.tileExample} className="tutorial-tile-example">
        <div style={styles.tileExampleTitle} className="tutorial-tile-example-title">雀頭（ジャントウ）: 同じ牌2枚（アタマ）</div>
        <div>
          <TileDisplay notation="11p" label="例:" />
          <TileDisplay notation="77z" />
        </div>
      </div>

      <div style={styles.importantBox} className="tutorial-important-box">
        <strong>ポイント</strong>: 麻雀の和了形は基本的に「4面子+1雀頭」の形です。
        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
          順子3つ + 刻子1つ + 雀頭 = 和了形
        </div>
      </div>
    </div>
  );
}

function FuContent() {
  return (
    <div>
      <h4 style={styles.heading} className="tutorial-heading">符計算のやり方</h4>

      <h5 style={styles.subHeading} className="tutorial-sub-heading">1. 副底</h5>
      <p>副底20符から始めて、条件に応じて加算していきます。</p>
      <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
        ※七対子は例外で25符固定です
      </p>

      <h5 style={styles.subHeading} className="tutorial-sub-heading">2. 和了り方で加算</h5>
      <ul style={styles.list} className="tutorial-list">
        <li style={styles.listItem}>
          <strong>門前ロン</strong>: +10符（鳴いてなくてロンした場合）
        </li>
        <li style={styles.listItem}>
          <strong>ツモ</strong>: +2符（自分でツモった場合）
        </li>
      </ul>

      <h5 style={styles.subHeading} className="tutorial-sub-heading">3. 面子の符</h5>
      <table style={styles.table} className="tutorial-table">
        <thead>
          <tr>
            <th style={styles.th}>種類</th>
            <th style={styles.th}>例</th>
            <th style={styles.th}>2〜8</th>
            <th style={styles.th}>1,9,字</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...styles.td, textAlign: 'left' }}>順子</td>
            <td style={{ ...styles.td, padding: '4px' }}><TileDisplay notation="234m" /></td>
            <td style={styles.td}>0符</td>
            <td style={styles.td}>0符</td>
          </tr>
          <tr>
            <td style={{ ...styles.td, textAlign: 'left' }}>明刻</td>
            <td style={{ ...styles.td, padding: '4px' }}><TileDisplay notation="555p" type="minkoh" /></td>
            <td style={styles.td}>2符</td>
            <td style={styles.td}>4符</td>
          </tr>
          <tr>
            <td style={{ ...styles.td, textAlign: 'left' }}>暗刻</td>
            <td style={{ ...styles.td, padding: '4px' }}><TileDisplay notation="111s" type="ankoh" /></td>
            <td style={styles.td}>4符</td>
            <td style={styles.td}>8符</td>
          </tr>
          <tr>
            <td style={{ ...styles.td, textAlign: 'left' }}>明槓</td>
            <td style={{ ...styles.td, padding: '4px' }}><TileDisplay notation="7777m" type="minkan" /></td>
            <td style={styles.td}>8符</td>
            <td style={styles.td}>16符</td>
          </tr>
          <tr>
            <td style={{ ...styles.td, textAlign: 'left' }}>暗槓</td>
            <td style={{ ...styles.td, padding: '4px' }}><TileDisplay notation="9999p" type="ankan" /></td>
            <td style={styles.td}>16符</td>
            <td style={styles.td}>32符</td>
          </tr>
        </tbody>
      </table>

      <h5 style={styles.subHeading} className="tutorial-sub-heading">4. 雀頭と待ちの符</h5>
      <table style={styles.table} className="tutorial-table">
        <thead>
          <tr>
            <th style={styles.th}>種類</th>
            <th style={styles.th}>例</th>
            <th style={styles.th}>符</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ ...styles.td, textAlign: 'left' }}>役牌雀頭</td>
            <td style={{ ...styles.td, padding: '4px' }}><TileDisplay notation="55z" /></td>
            <td style={styles.td}>2符</td>
          </tr>
          <tr>
            <td style={{ ...styles.td, textAlign: 'left' }}>両面待ち</td>
            <td style={{ ...styles.td, padding: '4px' }}><TileDisplay notation="23m" /></td>
            <td style={styles.td}>0符</td>
          </tr>
          <tr>
            <td style={{ ...styles.td, textAlign: 'left' }}>カンチャン</td>
            <td style={{ ...styles.td, padding: '4px' }}><TileDisplay notation="13m" /></td>
            <td style={styles.td}>2符</td>
          </tr>
          <tr>
            <td style={{ ...styles.td, textAlign: 'left' }}>ペンチャン</td>
            <td style={{ ...styles.td, padding: '4px' }}><TileDisplay notation="12m" /></td>
            <td style={styles.td}>2符</td>
          </tr>
          <tr>
            <td style={{ ...styles.td, textAlign: 'left' }}>単騎待ち</td>
            <td style={{ ...styles.td, padding: '4px' }}><TileDisplay notation="1m" /></td>
            <td style={styles.td}>2符</td>
          </tr>
          <tr>
            <td style={{ ...styles.td, textAlign: 'left' }}>シャンポン</td>
            <td style={{ ...styles.td, padding: '4px' }}><TileDisplay notation="11m55p" /></td>
            <td style={styles.td}>0符</td>
          </tr>
        </tbody>
      </table>

      <div style={styles.importantBox} className="tutorial-important-box">
        <strong>覚えておこう</strong>: 両面・シャンポンは0符、他の待ちは2符！
      </div>

      <h5 style={styles.subHeading} className="tutorial-sub-heading">5. 合計して切り上げ</h5>
      <p>すべての符を合計し、10符単位に切り上げます。</p>
      <div style={styles.exampleBox} className="tutorial-example-box">
        例: 20 + 10 + 4 + 2 = 36符 → <strong>40符</strong>に切り上げ
      </div>
    </div>
  );
}

function ScoreContent() {
  return (
    <div>
      <h4 style={styles.heading} className="tutorial-heading">点数の求め方</h4>

      <p>符と翻がわかったら、早見表で点数を確認します。</p>

      <h5 style={styles.subHeading} className="tutorial-sub-heading">基本的な考え方</h5>
      <ul style={styles.list} className="tutorial-list">
        <li style={styles.listItem}>符が大きい＋翻が多い → 点数が高い</li>
        <li style={styles.listItem}>親は子の1.5倍の点数をもらえる</li>
        <li style={styles.listItem}>ツモは3人から、ロンは1人から点数をもらう</li>
      </ul>

      <h5 style={styles.subHeading} className="tutorial-sub-heading">満貫以上（覚えておこう！）</h5>
      <table style={styles.table} className="tutorial-table">
        <thead>
          <tr>
            <th style={styles.th}>名称</th>
            <th style={styles.th}>条件</th>
            <th style={styles.th}>子ロン</th>
            <th style={styles.th}>親ロン</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={styles.td}>満貫</td>
            <td style={styles.td}>5翻〜</td>
            <td style={styles.td}>8,000</td>
            <td style={styles.td}>12,000</td>
          </tr>
          <tr>
            <td style={styles.td}>跳満</td>
            <td style={styles.td}>6-7翻</td>
            <td style={styles.td}>12,000</td>
            <td style={styles.td}>18,000</td>
          </tr>
          <tr>
            <td style={styles.td}>倍満</td>
            <td style={styles.td}>8-10翻</td>
            <td style={styles.td}>16,000</td>
            <td style={styles.td}>24,000</td>
          </tr>
          <tr>
            <td style={styles.td}>三倍満</td>
            <td style={styles.td}>11-12翻</td>
            <td style={styles.td}>24,000</td>
            <td style={styles.td}>36,000</td>
          </tr>
        </tbody>
      </table>

      <div style={styles.importantBox} className="tutorial-important-box">
        <strong>ポイント</strong>: 5翻以上は「満貫」以上になり、符の計算は不要！
        覚える点数も決まっているので楽になります。
      </div>

      <h5 style={styles.subHeading} className="tutorial-sub-heading">ツモの点数（子の場合）</h5>
      <p>ツモの場合は「子/親」の形で表記されます。</p>
      <div style={styles.exampleBox} className="tutorial-example-box">
        例: 30符3翻ツモ = <strong>1,000/2,000</strong><br />
        → 子2人から1,000点ずつ、親から2,000点<br />
        → 合計: 1,000×2 + 2,000 = 4,000点
      </div>
    </div>
  );
}

type ScoreTableType = 'koRon' | 'koTsumo' | 'oyaRon' | 'oyaTsumo';

// 点数表データ
const SCORE_TABLES: Record<ScoreTableType, { label: string; data: Record<number, (string | null)[]> }> = {
  koRon: {
    label: '子ロン',
    data: {
      // [1翻, 2翻, 3翻, 4翻]
      20: [null, null, null, null], // 20符ロンは存在しない
      25: [null, '1,600', '3,200', '6,400'], // 七対子
      30: ['1,000', '2,000', '3,900', '7,700'],
      40: ['1,300', '2,600', '5,200', '満貫'],
      50: ['1,600', '3,200', '6,400', '満貫'],
      60: ['2,000', '3,900', '7,700', '満貫'],
      70: ['2,300', '4,500', '満貫', '満貫'],
      80: ['2,600', '5,200', '満貫', '満貫'],
      90: ['2,900', '5,800', '満貫', '満貫'],
      100: ['3,200', '6,400', '満貫', '満貫'],
      110: ['3,600', '7,100', '満貫', '満貫'],
    },
  },
  koTsumo: {
    label: '子ツモ',
    data: {
      // [1翻, 2翻, 3翻, 4翻] - 子/親 の形式
      20: ['400/700', '400/700', '700/1,300', '1,300/2,600'],
      25: [null, '400/800', '800/1,600', '1,600/3,200'], // 七対子
      30: ['300/500', '500/1,000', '1,000/2,000', '2,000/3,900'],
      40: ['400/700', '700/1,300', '1,300/2,600', '満貫'],
      50: ['400/800', '800/1,600', '1,600/3,200', '満貫'],
      60: ['500/1,000', '1,000/2,000', '2,000/3,900', '満貫'],
      70: ['600/1,200', '1,200/2,300', '満貫', '満貫'],
      80: ['700/1,300', '1,300/2,600', '満貫', '満貫'],
      90: ['800/1,500', '1,500/2,900', '満貫', '満貫'],
      100: ['800/1,600', '1,600/3,200', '満貫', '満貫'],
      110: ['900/1,800', '1,800/3,600', '満貫', '満貫'],
    },
  },
  oyaRon: {
    label: '親ロン',
    data: {
      // [1翻, 2翻, 3翻, 4翻]
      20: [null, null, null, null], // 20符ロンは存在しない
      25: [null, '2,400', '4,800', '9,600'], // 七対子
      30: ['1,500', '2,900', '5,800', '11,600'],
      40: ['2,000', '3,900', '7,700', '満貫'],
      50: ['2,400', '4,800', '9,600', '満貫'],
      60: ['2,900', '5,800', '11,600', '満貫'],
      70: ['3,400', '6,800', '満貫', '満貫'],
      80: ['3,900', '7,700', '満貫', '満貫'],
      90: ['4,400', '8,700', '満貫', '満貫'],
      100: ['4,800', '9,600', '満貫', '満貫'],
      110: ['5,300', '10,600', '満貫', '満貫'],
    },
  },
  oyaTsumo: {
    label: '親ツモ',
    data: {
      // [1翻, 2翻, 3翻, 4翻] - オール の形式
      20: ['700オール', '700オール', '1,300オール', '2,600オール'],
      25: [null, '800オール', '1,600オール', '3,200オール'], // 七対子
      30: ['500オール', '1,000オール', '2,000オール', '3,900オール'],
      40: ['700オール', '1,300オール', '2,600オール', '満貫'],
      50: ['800オール', '1,600オール', '3,200オール', '満貫'],
      60: ['1,000オール', '2,000オール', '3,900オール', '満貫'],
      70: ['1,200オール', '2,300オール', '満貫', '満貫'],
      80: ['1,300オール', '2,600オール', '満貫', '満貫'],
      90: ['1,500オール', '2,900オール', '満貫', '満貫'],
      100: ['1,600オール', '3,200オール', '満貫', '満貫'],
      110: ['1,800オール', '3,600オール', '満貫', '満貫'],
    },
  },
};

const scoreTableStyles: Record<string, CSSProperties> = {
  buttonGroup: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  },
  typeButton: {
    flex: 1,
    padding: '12px 8px',
    border: '1px solid #E8E8E8',
    borderRadius: '0',
    backgroundColor: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 500,
    color: '#999999',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    letterSpacing: '0.05em',
  },
  typeButtonActive: {
    flex: 1,
    padding: '12px 8px',
    border: '1px solid #1B4332',
    borderRadius: '0',
    backgroundColor: '#1B4332',
    fontSize: '11px',
    fontWeight: 500,
    color: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    letterSpacing: '0.05em',
  },
  scoreTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11px',
    tableLayout: 'fixed',
  },
  scoreTh: {
    padding: '8px 4px',
    backgroundColor: '#1B4332',
    color: '#FFFFFF',
    border: '1px solid #1B4332',
    textAlign: 'center',
    fontWeight: 500,
  },
  scoreTd: {
    padding: '8px 4px',
    border: '1px solid #E8E8E8',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
  },
  scoreTdFu: {
    padding: '8px 4px',
    border: '1px solid #E8E8E8',
    textAlign: 'center',
    backgroundColor: '#F5F5F5',
    fontWeight: 500,
  },
  scoreTdMangan: {
    padding: '8px 4px',
    border: '1px solid #E8E8E8',
    textAlign: 'center',
    backgroundColor: '#FDF8F0',
    color: '#B8860B',
    fontWeight: 500,
  },
  scoreTdEmpty: {
    padding: '8px 4px',
    border: '1px solid #E8E8E8',
    textAlign: 'center',
    backgroundColor: '#F5F5F5',
    color: '#D0D0D0',
  },
  manganSection: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#FDF8F0',
    borderRadius: '0',
    border: '1px solid #E8E8E8',
  },
  manganTitle: {
    fontWeight: 500,
    marginBottom: '12px',
    color: '#B8860B',
    letterSpacing: '0.05em',
  },
  manganTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '11px',
    tableLayout: 'fixed',
  },
};

function ScoreTableContent(): ReactElement {
  const [tableType, setTableType] = useState<ScoreTableType>('koRon');

  const currentTable = SCORE_TABLES[tableType];
  const fuList = [20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110];

  // 満貫以上のデータ
  const manganData = tableType === 'koRon' || tableType === 'oyaRon'
    ? [
        { name: '満貫', han: '5翻', ko: '8,000', oya: '12,000' },
        { name: '跳満', han: '6-7翻', ko: '12,000', oya: '18,000' },
        { name: '倍満', han: '8-10翻', ko: '16,000', oya: '24,000' },
        { name: '三倍満', han: '11-12翻', ko: '24,000', oya: '36,000' },
        { name: '役満', han: '13翻〜', ko: '32,000', oya: '48,000' },
      ]
    : [
        { name: '満貫', han: '5翻', ko: '2,000/4,000', oya: '4,000オール' },
        { name: '跳満', han: '6-7翻', ko: '3,000/6,000', oya: '6,000オール' },
        { name: '倍満', han: '8-10翻', ko: '4,000/8,000', oya: '8,000オール' },
        { name: '三倍満', han: '11-12翻', ko: '6,000/12,000', oya: '12,000オール' },
        { name: '役満', han: '13翻〜', ko: '8,000/16,000', oya: '16,000オール' },
      ];

  return (
    <div>
      <h4 style={styles.heading}>点数早見表</h4>

      <div style={scoreTableStyles.buttonGroup}>
        {(['koRon', 'koTsumo', 'oyaRon', 'oyaTsumo'] as ScoreTableType[]).map((type) => (
          <button
            key={type}
            style={tableType === type ? scoreTableStyles.typeButtonActive : scoreTableStyles.typeButton}
            onClick={() => setTableType(type)}
          >
            {SCORE_TABLES[type].label}
          </button>
        ))}
      </div>

      <table style={scoreTableStyles.scoreTable}>
        <thead>
          <tr>
            <th style={scoreTableStyles.scoreTh}>符＼翻</th>
            <th style={scoreTableStyles.scoreTh}>1翻</th>
            <th style={scoreTableStyles.scoreTh}>2翻</th>
            <th style={scoreTableStyles.scoreTh}>3翻</th>
            <th style={scoreTableStyles.scoreTh}>4翻</th>
          </tr>
        </thead>
        <tbody>
          {fuList.map((fu) => {
            const row = currentTable.data[fu];
            if (!row) return null;
            return (
              <tr key={fu}>
                <td style={scoreTableStyles.scoreTdFu}>{fu}符</td>
                {row.map((value, index) => {
                  if (value === null) {
                    return <td key={index} style={scoreTableStyles.scoreTdEmpty}>-</td>;
                  }
                  if (value === '満貫') {
                    return <td key={index} style={scoreTableStyles.scoreTdMangan}>{value}</td>;
                  }
                  return <td key={index} style={scoreTableStyles.scoreTd}>{value}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={scoreTableStyles.manganSection}>
        <div style={scoreTableStyles.manganTitle}>満貫以上</div>
        <table style={scoreTableStyles.manganTable}>
          <thead>
            <tr>
              <th style={{ ...scoreTableStyles.scoreTh, backgroundColor: '#B8860B' }}>名称</th>
              <th style={{ ...scoreTableStyles.scoreTh, backgroundColor: '#B8860B' }}>翻数</th>
              <th style={{ ...scoreTableStyles.scoreTh, backgroundColor: '#B8860B' }}>
                {tableType.startsWith('ko') ? '子' : '親'}
              </th>
            </tr>
          </thead>
          <tbody>
            {manganData.map((row) => (
              <tr key={row.name}>
                <td style={scoreTableStyles.scoreTdFu}>{row.name}</td>
                <td style={scoreTableStyles.scoreTd}>{row.han}</td>
                <td style={scoreTableStyles.scoreTd}>
                  {tableType.startsWith('ko') ? row.ko : row.oya}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TipsContent() {
  return (
    <div>
      <h4 style={styles.heading} className="tutorial-heading">点数計算のコツ</h4>

      <h5 style={styles.subHeading} className="tutorial-sub-heading">まず覚える基本パターン</h5>

      <div style={styles.tileExample} className="tutorial-tile-example">
        <div style={styles.tileExampleTitle} className="tutorial-tile-example-title">平和ツモ = 必ず20符</div>
        <div style={{ fontSize: '11px', color: '#666' }}>
          順子のみ + 両面待ち + ツモ → <span style={styles.highlight}>20符</span>固定
        </div>
      </div>

      <div style={styles.tileExample} className="tutorial-tile-example">
        <div style={styles.tileExampleTitle} className="tutorial-tile-example-title">平和ロン = 必ず30符</div>
        <div style={{ fontSize: '11px', color: '#666' }}>
          順子のみ + 両面待ち + ロン → <span style={styles.highlight}>30符</span>固定
        </div>
      </div>

      <div style={styles.tileExample} className="tutorial-tile-example">
        <div style={styles.tileExampleTitle} className="tutorial-tile-example-title">刻子が入ると40符以上</div>
        <div style={{ fontSize: '11px', color: '#666' }}>
          暗刻があると符が上がる → <span style={styles.highlight}>40符以上</span>
        </div>
      </div>

      <h5 style={styles.subHeading} className="tutorial-sub-heading">よく出る点数の語呂合わせ</h5>
      <div style={styles.exampleBox} className="tutorial-example-box">
        <strong>30符（子ロン）</strong><br />
        1翻→1,000 / 2翻→2,000 / 3翻→3,900 / 4翻→7,700<br />
        <span style={{ color: '#666', fontSize: '10px' }}>
          「イチ・ニ・サンキュー・ナナナナ」
        </span>
      </div>

      <div style={{ ...styles.exampleBox, marginTop: '8px' }} className="tutorial-example-box">
        <strong>40符（子ロン）</strong><br />
        1翻→1,300 / 2翻→2,600 / 3翻→5,200<br />
        <span style={{ color: '#666', fontSize: '10px' }}>
          「イチサン・ニーロク・ゴーニ」
        </span>
      </div>

      <h5 style={styles.subHeading} className="tutorial-sub-heading">符の切り上げルール</h5>
      <p>計算した符が端数なら、10の位に切り上げ！</p>
      <div style={styles.exampleBox} className="tutorial-example-box">
        例: 22符 → <strong>30符</strong>に切り上げ<br />
        例: 38符 → <strong>40符</strong>に切り上げ
      </div>

      <h5 style={styles.subHeading} className="tutorial-sub-heading">満貫になる条件</h5>
      <ul style={styles.list} className="tutorial-list">
        <li style={styles.listItem}>5翻以上 → 満貫確定</li>
        <li style={styles.listItem}>4翻40符以上 → 満貫</li>
        <li style={styles.listItem}>3翻70符以上 → 満貫</li>
      </ul>

      <div style={styles.importantBox} className="tutorial-important-box">
        <strong>練習のコツ</strong>: 最初は符の計算を完璧にしなくてOK！
        まずは「30符か40符か」の感覚を掴み、よく出る点数パターンを覚えましょう。
      </div>
    </div>
  );
}

export function TutorialSection() {
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicContent />;
      case 'fu':
        return <FuContent />;
      case 'score':
        return <ScoreContent />;
      case 'tips':
        return <TipsContent />;
      case 'table':
        return <ScoreTableContent />;
    }
  };

  return (
    <div style={styles.container} className="tutorial-container">
      <div style={styles.tabList} className="tutorial-tab-list">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            style={activeTab === key ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div style={styles.content} className="tutorial-content">{renderContent()}</div>
    </div>
  );
}
