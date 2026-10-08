import { StyleSheet, Text, View, type TextProps, type ViewProps } from 'react-native';

import { colors, fonts, spacing } from '@/theme';

export function T({ style, weight = 'regular', ...props }: TextProps & { weight?: keyof typeof fonts }) {
  return <Text style={[styles.text, { fontFamily: fonts[weight] }, style]} {...props} />;
}

export function Card({ title, subtitle, children, style, ...props }: ViewProps & { title?: string; subtitle?: string }) {
  return (
    <View style={[styles.card, style]} {...props}>
      {title && (
        <View style={{ marginBottom: 14 }}>
          <T weight="bold" style={{ fontSize: 16 }}>
            {title}
          </T>
          {subtitle && <T style={styles.subtitle}>{subtitle}</T>}
        </View>
      )}
      {children}
    </View>
  );
}

export function Kpi({
  label,
  value,
  caption,
  tone = 'default',
}: {
  label: string;
  value: string;
  caption?: string;
  tone?: 'default' | 'alert' | 'positive';
}) {
  const captionColor = tone === 'alert' ? colors.brand : tone === 'positive' ? colors.positive : colors.muted;
  return (
    <View style={[styles.card, styles.kpi]}>
      <T style={styles.kpiLabel}>{label}</T>
      <T weight="bold" style={[styles.kpiValue, tone === 'alert' && { color: colors.brand }]}>
        {value}
      </T>
      {caption && <T style={[styles.kpiCaption, { color: captionColor }]}>{caption}</T>}
    </View>
  );
}

export function Bars({ data, max = 100, suffix = '' }: { data: { label: string; value: number }[]; max?: number; suffix?: string }) {
  return (
    <View style={styles.bars}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        return (
          <View key={d.label} style={styles.barCol}>
            <T weight="medium" style={{ fontSize: 11 }}>
              {d.value}
              {suffix}
            </T>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max((d.value / max) * 110, 4),
                  backgroundColor: isLast ? colors.brand : i % 2 ? colors.graphite : colors.silver,
                },
              ]}
            />
            <T style={styles.barLabel}>{d.label}</T>
          </View>
        );
      })}
    </View>
  );
}

export function HBar({ label, value, total, color = colors.graphite }: { label: string; value: number; total: number; color?: string }) {
  return (
    <View style={styles.hbarRow}>
      <T style={styles.hbarLabel}>{label}</T>
      <View style={styles.hbarTrack}>
        <View style={[styles.hbarFill, { width: `${Math.max((value / total) * 100, 12)}%`, backgroundColor: color }]}>
          <T weight="bold" style={{ color: colors.white, fontSize: 12 }}>
            {value}
          </T>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: { color: colors.text },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: spacing.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  kpi: { flex: 1, minWidth: 0 },
  kpiLabel: { color: colors.muted, fontSize: 13 },
  kpiValue: { fontSize: 28, letterSpacing: -0.5, marginTop: 4 },
  kpiCaption: { fontSize: 12, marginTop: 6 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 150 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  bar: { width: '100%', borderRadius: 8 },
  barLabel: { color: colors.muted, fontSize: 11 },
  hbarRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  hbarLabel: { width: 88, color: colors.muted, fontSize: 13 },
  hbarTrack: { flex: 1, height: 26, borderRadius: 8, backgroundColor: '#DCDCDC' },
  hbarFill: { height: '100%', borderRadius: 8, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 8 },
});
