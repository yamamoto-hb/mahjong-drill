import { ReactElement, CSSProperties } from 'react';
import { YakuId } from '../logic/yaku-types';

interface SettingsBarProps {
  debugYakuId: YakuId | null;
  onDebugYakuChange: (yakuId: YakuId | null) => void;
}

const styles: Record<string, CSSProperties> = {
  container: {
    backgroundColor: '#F5F3EF',
    borderBottom: '1px solid #E0D8CC',
    padding: '8px 16px',
  },
  label: {
    fontSize: '12px',
    color: '#666666',
    marginRight: '8px',
  },
  select: {
    padding: '4px 8px',
    fontSize: '13px',
    border: '1px solid #D4C9B5',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
  },
};

const DEBUG_YAKU_OPTIONS: { value: YakuId | ''; label: string }[] = [
  { value: '', label: 'ランダム' },
  { value: 'chanta', label: '混全帯么九' },
  { value: 'junchan', label: '純全帯么九' },
  { value: 'honitsu', label: '混一色' },
  { value: 'chinitsu', label: '清一色' },
  { value: 'sanshoku_doujun', label: '三色同順' },
  { value: 'ittsu', label: '一気通貫' },
  { value: 'toitoi', label: '対々和' },
  { value: 'sanankou', label: '三暗刻' },
  { value: 'honroutou', label: '混老頭' },
];

export function SettingsBar({ debugYakuId, onDebugYakuChange }: SettingsBarProps): ReactElement {
  return (
    <div style={styles.container}>
      <span style={styles.label}>🔧 デバッグ:</span>
      <select
        style={styles.select}
        value={debugYakuId || ''}
        onChange={(e) => onDebugYakuChange((e.target.value || null) as YakuId | null)}
      >
        {DEBUG_YAKU_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
