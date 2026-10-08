// Página Desempenho no layout da referência "Vocalyn" (minimalista, gráfico de área grande e
// três cards), no visual glass clean padrão do app (src/ui).
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop } from 'react-native-svg';

import { demoDashboard as d, demoTeam } from '@/data/demo';
import { AppShell, useBreakpoints } from '@/ui/app-shell';
import { Button, Card, CardHeader, decimal, Donut, Legend, Segmented, T, Tabs, ui, useSvgId } from '@/ui/glass';
import { useGlassTheme } from '@/ui/glass-theme';

// PSE média por dia (escala 0–10) nos últimos 30 dias, de 09/09 a 08/10/2026.
const pse = [
  6.0, 6.3, 6.6, 6.2, 5.1, 5.8, 5.0, 5.6, 7.9, 7.5, 5.4, 5.9, 5.2, 4.6, 4.1, 3.6, 5.2, 6.4, 6.9, 7.1, 8.0, 6.2, 4.4, 3.6, 4.9, 6.8, 5.9, 6.6, 7.2, 7.6,
];
const firstDay = Date.UTC(2026, 8, 9);
const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
function dayLabel(i: number, withWeekday = false) {
  const dt = new Date(firstDay + i * 86_400_000);
  const dm = `${String(dt.getUTCDate()).padStart(2, '0')}/${String(dt.getUTCMonth() + 1).padStart(2, '0')}`;
  return withWeekday ? `${weekdays[dt.getUTCDay()]}, ${dm}` : dm;
}

const results = [
  { label: 'Vitórias', value: d.season.wins },
  { label: 'Empates', value: d.season.draws },
  { label: 'Derrotas', value: d.season.losses },
];

const goalOrigins = [
  { label: 'Jogada trabalhada', value: 9 },
  { label: 'Contra-ataque', value: 5 },
  { label: 'Bola parada', value: 4 },
  { label: 'Pênalti', value: 2 },
  { label: 'Erro do adversário', value: 2 },
];

const absences = [
  { label: 'Lesão', value: 14 },
  { label: 'Motivo pessoal', value: 6 },
  { label: 'Sem justificativa', value: 4 },
];

export default function DashboardDesempenhoScreen() {
  const { c } = useGlassTheme();
  const { medium, width } = useBreakpoints();
  // Três cards lado a lado a partir de 768: abaixo disso a etiqueta da rosca passaria da borda
  const row = width >= 768;
  const [tab, setTab] = useState('Resumo');
  const [view, setView] = useState('Visão geral');

  return (
    <AppShell title="Desempenho" active="Desempenho">
      <View style={ui.spread}>
        <Button icon="calendar-blank-outline" label="Últimos 30 dias" chevron />
        <Segmented options={['Visão geral', 'Tabelas']} value={view} onChange={setView} />
      </View>

      <Tabs
        options={['Resumo', 'Tendência semanal', 'Por treino']}
        value={tab}
        onChange={setTab}
        right={
          medium && (
            <View style={[ui.inline, { gap: 8, paddingBottom: 8 }]}>
              <Button icon="tune-variant" label="Filtrar" />
              <Button icon="plus" label="Adicionar visão" />
            </View>
          )
        }
      />

      <LoadChart compact={!medium} />

      <View style={row ? ui.cardsRow : { gap: 16 }}>
        <DonutCard
          stretch={row}
          title="Resultados"
          subtitle={`${d.season.played} jogos · temporada ${demoTeam.season}`}
          totalLabel={`${d.season.played} jogos`}
          items={results}
          colors={[c.ink, c.gray2, c.gray3]}
          callout={`${d.season.wins} vitórias`}
        />
        <BarsCard stretch={row} />
        <DonutCard
          stretch={row}
          title="Ausências nos treinos"
          subtitle="24 faltas · 22 treinos"
          totalLabel="24 faltas"
          items={absences}
          colors={[c.ink, c.gray1, c.gray3]}
          callout="Lesão · 14"
        />
      </View>
    </AppShell>
  );
}

function LoadChart({ compact }: { compact: boolean }) {
  const { c, g, mode } = useGlassTheme();
  const fillId = useSvgId('pse');
  const [w, setW] = useState(0);
  const h = compact ? 180 : 230;
  const padL = 24;
  const padB = 24;
  const plotH = h - padB - 8;
  const peak = pse.indexOf(Math.max(...pse));
  const x = (i: number) => padL + (i * (w - padL - 4)) / (pse.length - 1);
  const y = (v: number) => 8 + (1 - v / 10) * plotH;
  const line = pse.map((v, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L ${x(pse.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`;
  const step = compact ? 7 : 3;
  const avg = decimal(pse.reduce((s, v) => s + v, 0) / pse.length);
  // Dica à direita do pico; se não couber, vai para a esquerda (no celular cobriria o pico)
  const tipW = 124;
  const tipLeft = x(peak) + 8 + tipW <= w ? x(peak) + 8 : Math.max(0, x(peak) - 8 - tipW);

  return (
    <Card style={{ padding: compact ? 14 : 18 }}>
      <View style={[ui.spread, { alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }]}>
        <View>
          <T weight="medium" size={15} heading={2}>
            Esforço percebido (PSE)
          </T>
          <T size={11} color={c.muted} style={{ marginTop: 2 }}>
            22 treinos · {d.squad.total} atletas · média {avg} de 10
          </T>
        </View>
        <View style={[ui.inline, { gap: 6 }]}>
          <Button label="Diário" chevron small />
          <Button label="Treino" chevron small />
          {!compact && <Button label="Média" chevron small />}
        </View>
      </View>

      <View
        style={{ height: h, marginTop: 14 }}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        accessible
        role="img"
        accessibilityLabel={`PSE média diária dos últimos 30 dias, de ${decimal(Math.min(...pse))} a ${decimal(Math.max(...pse))}; pico em ${dayLabel(peak, true)}`}
      >
        {w > 0 && (
          <>
            <Svg width={w} height={h}>
              <Defs>
                <LinearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={c.ink} stopOpacity={mode === 'light' ? 0.16 : 0.12} />
                  <Stop offset="1" stopColor={c.ink} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={area} fill={`url(#${fillId})`} />
              <Path d={line} stroke={c.ink} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
              <Line x1={x(peak)} x2={x(peak)} y1={y(10)} y2={y(0)} stroke={c.gray2} strokeWidth={1} strokeDasharray="3 3" />
              <Circle cx={x(peak)} cy={y(pse[peak])} r={4} fill={c.ink} stroke={mode === 'light' ? '#FFFFFF' : '#1C1C20'} strokeWidth={2} />
            </Svg>
            {[0, 2, 4, 6, 8, 10].map((v) => (
              <T key={v} size={10} color={c.faint} style={[styles.yLabel, { top: y(v) - 7 }]}>
                {v}
              </T>
            ))}
            {pse.map((_, i) =>
              i % step === 0 ? (
                <T key={i} size={10} color={c.faint} style={[styles.xLabel, { left: x(i) - 20, top: h - 16 }]}>
                  {dayLabel(i)}
                </T>
              ) : null,
            )}
            <View style={[styles.tooltip, { left: tipLeft, top: y(10) }, g.tooltip]}>
              <T size={11} weight="medium">
                {dayLabel(peak, true)}
              </T>
              <View style={[ui.spread, { marginTop: 4, gap: 12 }]}>
                <T size={10} color={c.muted}>
                  PSE média
                </T>
                <T size={10} weight="bold">
                  {decimal(pse[peak])}
                </T>
              </View>
            </View>
          </>
        )}
      </View>
    </Card>
  );
}

function DonutCard({
  stretch,
  title,
  subtitle,
  totalLabel,
  items,
  colors,
  callout,
}: {
  stretch: boolean;
  title: string;
  subtitle: string;
  totalLabel: string;
  items: { label: string; value: number }[];
  colors: string[];
  callout: string;
}) {
  const { c } = useGlassTheme();
  const total = items.reduce((s, i) => s + i.value, 0);
  const slices = items.map((it, i) => ({ ...it, color: colors[i], pct: Math.round((it.value / total) * 100) }));

  return (
    <Card style={stretch && ui.flexCard}>
      <CardHeader title={title} subtitle={subtitle} />
      <View style={{ alignItems: 'center', marginVertical: 18 }}>
        <Donut
          items={slices}
          callout={callout}
          accessibilityLabel={`${title}: ${slices.map((s) => `${s.label}: ${s.value}, ${s.pct}%`).join('; ')}`}
          center={
            <>
              <T weight="medium" size={15}>
                Total
              </T>
              <T size={11} color={c.muted}>
                {totalLabel}
              </T>
            </>
          }
        />
      </View>
      <Legend items={slices.map((s) => ({ label: s.label, color: s.color, value: `${s.value} · ${s.pct}%` }))} />
    </Card>
  );
}

function BarsCard({ stretch }: { stretch: boolean }) {
  const { c } = useGlassTheme();
  const total = goalOrigins.reduce((s, g) => s + g.value, 0);
  const shades = [c.ink, c.gray1, c.gray1, c.gray2, c.gray2];
  return (
    <Card style={stretch && ui.flexCard}>
      <CardHeader title="Origem dos gols" subtitle={`${total} gols · temporada ${demoTeam.season}`} />
      <View style={{ gap: 14, marginTop: 16 }}>
        {goalOrigins.map((g, i) => {
          const pct = Math.round((g.value / total) * 100);
          const filled = Math.max(1, Math.round(pct / 5));
          return (
            <View key={g.label} accessible accessibilityLabel={`${g.label}: ${g.value} gols, ${pct}%`}>
              <View style={ui.spread}>
                <T size={11}>{g.label}</T>
                <T size={11} color={c.muted}>
                  {pct}%
                </T>
              </View>
              {/* 10 blocos de 5% cada, como na referência */}
              <View style={styles.blocks}>
                {Array.from({ length: 10 }, (_, k) => (
                  <View key={k} style={[styles.block, { backgroundColor: k < filled ? shades[i] : c.blockEmpty }]} />
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  yLabel: { position: 'absolute', left: 0, width: 16, textAlign: 'right' },
  xLabel: { position: 'absolute', width: 40, textAlign: 'center' },
  tooltip: {
    position: 'absolute',
    width: 124, // = tipW
    borderRadius: 8,
    borderWidth: 1,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  blocks: { flexDirection: 'row', gap: 3, marginTop: 6 },
  block: { flex: 1, height: 8, borderRadius: 2 },
});
