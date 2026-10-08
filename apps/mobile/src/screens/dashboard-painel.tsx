// Dashboard (início): conteúdo da referência "CreatiHR" (KPIs, elenco, pontos, tabelas e
// próximos eventos) no visual glass clean padrão do app, igual à página Desempenho.
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { demoAthleteGoals, demoDashboard as d, demoPerformance, demoTeam, demoUpcoming, type Rating } from '@/data/demo';
import { AppShell, useBreakpoints } from '@/ui/app-shell';
import { Button, Card, CardHeader, decimal, Donut, Icon, Legend, T, ui, type IconName } from '@/ui/glass';
import { useGlassTheme } from '@/ui/glass-theme';

// Hora de Brasília (sem horário de verão desde 2019).
function greeting() {
  const h = (new Date().getUTCHours() + 21) % 24;
  return h < 5 || h >= 18 ? 'Boa noite' : h < 12 ? 'Bom dia' : 'Boa tarde';
}

export default function DashboardPainelScreen() {
  const { c } = useGlassTheme();
  const { wide, xl, medium } = useBreakpoints();
  const s = d.season;

  return (
    <AppShell title="Dashboard" active="Dashboard">
      <View style={[ui.spread, { gap: 12, marginBottom: 4 }]}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <T weight="medium" size={medium ? 22 : 20} heading={2} style={{ letterSpacing: -0.3 }}>
            Olá, {demoTeam.coach}
          </T>
          <T size={13} color={c.mutedOnPage} style={{ marginTop: 2 }}>
            {greeting()} · {demoTeam.name}
          </T>
        </View>
        {/* Período sempre visível, como em Desempenho; menor no celular */}
        <Button icon="calendar-blank-outline" label={`Temporada ${demoTeam.season}`} chevron small={!medium} />
      </View>

      <Grid columns={wide ? 4 : 2}>
        <Kpi
          icon="account-group-outline"
          title="Atletas disponíveis"
          value={`${d.squad.active}/${d.squad.total}`}
          strong={`${d.squad.total - d.squad.active}`}
          note="fora de combate"
        />
        <Kpi
          icon="clipboard-check-outline"
          title="Frequência nos treinos"
          value={`${d.attendanceMonthPct}%`}
          strong={`▲ ${d.attendanceMonthPct - d.attendancePrevPct} p.p.`}
          note={medium ? 'vs. mês anterior' : 'vs. mês ant.'}
        />
        <Kpi
          icon="trophy-outline"
          title="Aproveitamento na temporada"
          value={`${Math.round(((s.wins * 3 + s.draws) / (s.played * 3)) * 100)}%`}
          strong={`${s.wins}V ${s.draws}E ${s.losses}D`}
          note={`em ${s.played} jogos`}
        />
        <Kpi
          icon="soccer"
          title="Gols marcados"
          value={String(s.goalsFor)}
          strong={decimal(s.goalsFor / s.played)}
          note={`por jogo · ${s.goalsAgainst} sofr.`}
        />
      </Grid>

      {/* Três cards lado a lado só a partir de 1280: entre 1100 e 1279 eles ficariam espremidos */}
      <Row wide={xl} medium={medium} spans={[1, 1, 2]}>
        <SquadDonut />
        <PointsGauge />
        <PerformanceTable compact={!medium} />
      </Row>

      <Row wide={xl} medium={medium} spans={[2, 2]}>
        <GoalsTable compact={!medium} />
        <Upcoming compact={!medium} />
      </Row>
    </AppShell>
  );
}

/* ---------- Layout ---------- */

function Grid({ columns, children }: { columns: number; children: ReactNode[] }) {
  const rows: ReactNode[][] = [];
  children.forEach((child, i) => {
    if (i % columns === 0) rows.push([]);
    rows[rows.length - 1].push(child);
  });
  return (
    <View style={{ gap: 16 }}>
      {rows.map((row, r) => (
        <View key={r} style={ui.cardsRow}>
          {row.map((child, i) => (
            <View key={i} style={ui.flexCard}>
              {child}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// Linha de cards: lado a lado na tela larga, empilhados no celular. Cada card ocupa colunas
// inteiras da grade de 4 dos KPIs (span), então as bordas dos cards se alinham entre as linhas.
function Row({ wide, medium, spans, children }: { wide: boolean; medium: boolean; spans: number[]; children: ReactNode[] }) {
  if (wide) {
    return (
      <View style={ui.cardsRow}>
        {children.map((child, i) => (
          <View key={i} style={{ flexGrow: spans[i], flexShrink: 1, flexBasis: (spans[i] - 1) * 16, minWidth: 0 }}>
            {child}
          </View>
        ))}
      </View>
    );
  }
  // Tablet: os dois primeiros lado a lado quando são três cards
  if (medium && children.length === 3) {
    return (
      <View style={{ gap: 16 }}>
        <View style={ui.cardsRow}>
          <View style={ui.flexCard}>{children[0]}</View>
          <View style={ui.flexCard}>{children[1]}</View>
        </View>
        {children[2]}
      </View>
    );
  }
  return <View style={{ gap: 16 }}>{children}</View>;
}

/* ---------- Cards ---------- */

function Kpi({ icon, title, value, strong, note }: { icon: IconName; title: string; value: string; strong: string; note: string }) {
  const { c } = useGlassTheme();
  return (
    <Card style={{ flexGrow: 1 }} accessible accessibilityLabel={`${title}: ${value}. ${strong} ${note}`}>
      <View style={[ui.spread, { alignItems: 'flex-start', gap: 8 }]}>
        {/* Altura de duas linhas: o número fica na mesma altura em todos os cards da linha */}
        <T weight="medium" size={13} color={c.muted} style={{ flex: 1, lineHeight: 18, minHeight: 36 }}>
          {title}
        </T>
        <View style={[styles.kpiIcon, { backgroundColor: c.soft }]}>
          <Icon name={icon} size={17} color={c.text} />
        </View>
      </View>
      <T weight="medium" size={28} style={{ paddingTop: 10, letterSpacing: -0.6 }}>
        {value}
      </T>
      <T size={11} color={c.muted} style={{ marginTop: 4 }}>
        <T weight="medium" size={11}>
          {strong}
        </T>{' '}
        {note}
      </T>
    </Card>
  );
}

function SquadDonut() {
  const { c } = useGlassTheme();
  // Grafite e cinzas; o vermelho só no arco fino de lesionados (marcador pequeno, como no app antigo).
  const segments = [
    { label: 'Disponíveis', value: d.squad.active, color: c.ink },
    { label: 'Lesionados', value: d.squad.injured, color: c.brand },
    { label: 'Suspensos', value: d.squad.suspended, color: c.gray2 },
    { label: 'Emprestado', value: d.squad.loaned, color: c.gray3 },
  ];
  const pct = Math.round((d.squad.active / d.squad.total) * 100);

  return (
    <Card style={{ flexGrow: 1 }}>
      <CardHeader title="Elenco" subtitle={`${d.squad.total} atletas · hoje`} />
      <View style={{ alignItems: 'center', marginVertical: 18 }}>
        {/* Mesmo anel de Desempenho (150, traço 18, pontas redondas); o espaço desconta as pontas,
            então a fatia de 1 atleta vira uma bolinha sem encostar nas vizinhas */}
        <Donut
          items={segments}
          gap={23}
          accessibilityLabel={`Elenco: ${segments.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(', ')}`}
          center={
            <>
              <T weight="medium" size={22} style={{ letterSpacing: -0.4 }}>
                {pct}%
              </T>
              <T size={11} color={c.muted}>
                disponíveis
              </T>
            </>
          }
        />
      </View>
      <Legend items={segments.map((s) => ({ label: s.label, color: s.color, value: s.value }))} />
      <T size={11} color={c.muted} style={{ marginTop: 12 }}>
        Rafael Lima volta em 20/10.
      </T>
    </Card>
  );
}

function PointsGauge() {
  const { c } = useGlassTheme();
  const s = d.season;
  const winPts = s.wins * 3;
  const points = winPts + s.draws;
  const max = s.played * 3;
  const pct = Math.round((points / max) * 100);
  // Largura pelo card (até 200), para nunca invadir o padding em telas apertadas
  const [box, setBox] = useState(0);
  const w = Math.min(200, box);
  const stroke = 18;
  const r = (w - stroke) / 2;
  const cy = r + stroke / 2;
  const arcLen = Math.PI * r;
  const semi = `M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${w - stroke / 2} ${cy}`;
  const arc = (pts: number) => `${(pts / max) * arcLen} ${arcLen}`;

  return (
    <Card style={{ flexGrow: 1 }}>
      <CardHeader title="Pontos ganhos" subtitle={`${s.played} jogos · temporada ${demoTeam.season}`} />
      <View
        style={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', marginVertical: 18 }}
        onLayout={(e) => setBox(e.nativeEvent.layout.width)}
        accessible
        role="img"
        accessibilityLabel={`Pontos ganhos: ${points} de ${max} possíveis, ${pct}% de aproveitamento. ${winPts} pontos em ${s.wins} vitórias, ${s.draws} em ${s.draws} empates, ${s.losses} derrotas`}
      >
        {w > 0 && (
          <View>
            {/* Trilho = pontos não conquistados; empates em cinza por baixo, vitórias em grafite por cima */}
            <Svg width={w} height={cy + 2}>
              <Path d={semi} stroke={c.track} strokeWidth={stroke} fill="none" strokeLinecap="round" />
              <Path d={semi} stroke={c.gray2} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={arc(points)} />
              <Path d={semi} stroke={c.ink} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={arc(winPts)} />
            </Svg>
            <View style={[styles.gaugeLabel, { bottom: 0 }]}>
              <T weight="medium" size={22} style={{ letterSpacing: -0.4 }}>
                {points} pts
              </T>
              <T size={11} color={c.muted}>
                de {max} possíveis
              </T>
            </View>
          </View>
        )}
      </View>
      <Legend
        items={[
          { label: `Vitórias · ${s.wins}`, color: c.ink, value: `${winPts} pts` },
          { label: `Empates · ${s.draws}`, color: c.gray2, value: `${s.draws} pts` },
          // Derrotas não somam: bolinha na cor do trilho vazio
          { label: `Derrotas · ${s.losses}`, color: c.track, outline: c.gray3, value: '0 pts' },
        ]}
      />
    </Card>
  );
}

const ratingLabel: Record<Rating, string> = { great: 'Ótimo', good: 'Bom', fair: 'Regular', attention: 'Atenção' };

function RatingPill({ rating }: { rating: Rating }) {
  const { c } = useGlassTheme();
  // Neutro: "Ótimo" preenchido em grafite, os demais só contorno; vermelho só em "Atenção".
  const style: Record<Rating, { bg: string; fg: string; border: string }> = {
    great: { bg: c.ink, fg: c.onInk, border: c.ink },
    good: { bg: 'transparent', fg: c.text, border: c.gray2 },
    fair: { bg: 'transparent', fg: c.muted, border: c.gray3 },
    attention: { bg: 'transparent', fg: c.negative, border: c.negative },
  };
  const s = style[rating];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg, borderColor: s.border }]}>
      <T weight="medium" size={11} color={s.fg}>
        {ratingLabel[rating]}
      </T>
    </View>
  );
}

function Initials({ name }: { name: string }) {
  const { c } = useGlassTheme();
  return (
    <View style={[styles.initials, { backgroundColor: c.soft }]}>
      <T weight="medium" size={11}>
        {name
          .split(' ')
          .map((n) => n[0])
          .join('')}
      </T>
    </View>
  );
}

function PerformanceTable({ compact }: { compact: boolean }) {
  const { c } = useGlassTheme();
  return (
    <Card style={{ flexGrow: 1 }}>
      <CardHeader title="Desempenho dos atletas" subtitle="Últimos 5 jogos" />
      <View style={[styles.tableHead, { borderBottomColor: c.border }]}>
        <T size={11} color={c.muted} style={{ flex: 2, minWidth: 0 }}>
          Atleta
        </T>
        {!compact && (
          <T size={11} color={c.muted} style={{ flex: 1 }}>
            Posição
          </T>
        )}
        <T size={11} color={c.muted} style={{ width: 84, textAlign: 'center' }}>
          Desempenho
        </T>
      </View>
      {demoPerformance.map((a, i) => (
        <View
          key={a.name}
          style={[styles.tableRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border }]}
          accessible
          accessibilityLabel={`${a.name}, ${a.position}, ${a.detail}, desempenho ${ratingLabel[a.rating]}`}
        >
          <View style={[ui.inline, { flex: 2, minWidth: 0, gap: 10 }]}>
            <Initials name={a.name} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <T weight="medium" size={13} numberOfLines={1}>
                {a.name}
              </T>
              <T size={11} color={c.muted} numberOfLines={compact ? 2 : 1} style={{ marginTop: 1 }}>
                {compact ? `${a.position} · ${a.detail}` : a.detail}
              </T>
            </View>
          </View>
          {!compact && (
            <T size={12} color={c.muted} style={{ flex: 1 }}>
              {a.position}
            </T>
          )}
          <View style={{ width: 84, alignItems: 'center' }}>
            <RatingPill rating={a.rating} />
          </View>
        </View>
      ))}
    </Card>
  );
}

function GoalsTable({ compact }: { compact: boolean }) {
  const { c } = useGlassTheme();
  const g = demoAthleteGoals;
  // Celular: números em largura fixa e o fundamento com o resto (não corta "Finalizações no alvo")
  const col = (i: number) => (i === 0 ? styles.labelCol : compact ? [styles.numCol, { flex: 0, width: [0, 44, 58, 64][i] }] : styles.numCol);
  const filters = (
    <>
      <Button small label={g.athlete} chevron accessibilityLabel={`Atleta: ${g.athlete}`} />
      <Button small label={g.month} chevron accessibilityLabel={`Mês: ${g.month}`} />
    </>
  );
  return (
    <Card style={{ flexGrow: 1 }}>
      {/* No celular os filtros descem para baixo do título para não espremê-lo */}
      <CardHeader title="Metas individuais" subtitle="Fundamentos do mês por atleta" action={!compact && filters} />
      {compact && <View style={[ui.inline, { marginTop: 12 }]}>{filters}</View>}
      <View style={[styles.tableHead, { borderBottomColor: c.border, marginTop: 14 }]}>
        {['Fundamento', 'Meta', 'Atingido', 'Resultado'].map((h, i) => (
          <T key={h} size={11} color={c.muted} style={col(i)}>
            {h}
          </T>
        ))}
      </View>
      {g.rows.map((r) => {
        // Meta batida em negrito (sem cor extra); vermelho só no texto abaixo de 80%
        const color = r.pct < 80 ? c.negative : c.text;
        return (
          <View
            key={r.label}
            style={styles.tableRowSlim}
            accessible
            accessibilityLabel={`${r.label}: meta ${r.target}, atingido ${r.achieved}, ${r.pct}% da meta`}
          >
            <T size={12} style={col(0)} numberOfLines={compact ? 2 : 1}>
              {r.label}
            </T>
            <T size={12} color={c.muted} style={col(1)}>
              {r.target}
            </T>
            <T size={12} color={c.muted} style={col(2)}>
              {r.achieved}
            </T>
            <T size={12} weight={r.pct >= 100 ? 'bold' : 'medium'} color={color} style={col(3)}>
              {r.pct}%
            </T>
          </View>
        );
      })}
    </Card>
  );
}

function Upcoming({ compact }: { compact: boolean }) {
  const { c, g } = useGlassTheme();
  return (
    <Card style={{ flexGrow: 1 }}>
      <CardHeader title="Próximos eventos" subtitle={`Esta semana · ${demoUpcoming.length} eventos`} />
      <View style={{ gap: 12, marginTop: 16 }}>
        {demoUpcoming.map((e) => (
          <View key={e.title} style={[styles.eventCard, g.inner]}>
            <View style={ui.inline}>
              <T size={11} color={c.muted} style={{ flex: 1 }}>
                {e.subtitle}
              </T>
              <Icon name="dots-horizontal" size={16} color={c.muted} />
            </View>
            <View style={[ui.inline, { marginTop: 4, gap: 8 }]}>
              {/* Marcador vermelho só para jogos */}
              {e.kind === 'match' && <View style={[styles.matchMark, { backgroundColor: c.brand }]} />}
              <T weight="medium" size={14} style={{ flex: 1 }}>
                {e.title}
              </T>
            </View>
            {/* Dados e horário quebram linha na coluna deles; os avatares ficam sempre à direita */}
            <View style={[ui.inline, { marginTop: 12, alignItems: 'flex-end', gap: 8 }]}>
              <View style={[ui.inline, { flex: 1, minWidth: 0, flexWrap: 'wrap', rowGap: 8 }]}>
                {e.stats.map((s) => (
                  <View key={s.icon} style={[ui.inline, { gap: 4, marginRight: 8 }]} accessible accessibilityLabel={`${s.value} ${s.label}`}>
                    <Icon name={s.icon as IconName} size={14} color={c.muted} />
                    <T size={11} color={c.muted}>
                      {s.value}
                    </T>
                  </View>
                ))}
                <View style={[styles.timePill, g.control]}>
                  <Icon name="clock-outline" size={12} color={c.text} />
                  <T size={11}>{e.when}</T>
                </View>
              </View>
              <View style={[styles.avatarStack, { flexShrink: 0 }]} aria-hidden importantForAccessibility="no-hide-descendants">
                {(compact ? e.people.slice(0, 2) : e.people).map((initials, i) => (
                  <View key={initials} style={[styles.stackAvatar, { backgroundColor: c.avatar, borderColor: c.avatarRing, marginLeft: i ? -7 : 0 }]}>
                    <T weight="medium" size={8}>
                      {initials}
                    </T>
                  </View>
                ))}
                <View style={[styles.stackAvatar, { backgroundColor: c.avatar, borderColor: c.avatarRing, marginLeft: -7 }]}>
                  <T weight="medium" size={8} color={c.muted}>
                    +{compact ? e.more + e.people.length - 2 : e.more}
                  </T>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  kpiIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  gaugeLabel: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  pill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 2 },
  initials: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tableHead: { flexDirection: 'row', alignItems: 'center', columnGap: 12, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, marginTop: 12 },
  tableRow: { flexDirection: 'row', alignItems: 'center', columnGap: 12, paddingVertical: 10 },
  tableRowSlim: { flexDirection: 'row', alignItems: 'center', columnGap: 8, paddingVertical: 8 },
  labelCol: { flex: 1.6, minWidth: 0 },
  numCol: { flex: 1, textAlign: 'right' },
  eventCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  matchMark: { width: 3, height: 14, borderRadius: 2 },
  timePill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  avatarStack: { flexDirection: 'row' },
  stackAvatar: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
