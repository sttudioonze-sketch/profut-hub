// Dashboard de controle geral no estilo Apple (iOS 26, Liquid Glass). Usado no iPhone.
import Ionicons from '@expo/vector-icons/Ionicons';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { StatusBar } from 'expo-status-bar';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View, type TextProps, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { demoByPeriod, demoDashboard as d, demoTeam, demoWeek, type AthleteStatus, type EventKind, type Period, type Result } from '@/data/demo';
import { apple as c, type, webGlass } from '@/theme-apple';

type IconName = ComponentProps<typeof Ionicons>['name'];

const NAV_BAR = 52;
const TAB_BAR = 64;
const liquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

const tabs: { key: string; label: string; icon: IconName; iconOff: IconName }[] = [
  { key: 'home', label: 'Início', icon: 'home', iconOff: 'home-outline' },
  { key: 'squad', label: 'Elenco', icon: 'people', iconOff: 'people-outline' },
  { key: 'agenda', label: 'Agenda', icon: 'calendar', iconOff: 'calendar-outline' },
  { key: 'tactics', label: 'Táticas', icon: 'easel', iconOff: 'easel-outline' },
];

const periods: { value: Period; label: string }[] = [
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
  { value: 'season', label: 'Temporada' },
];

const positionLabel: Record<string, string> = { ATA: 'Atacante', MEI: 'Meia', ZAG: 'Zagueiro', LAT: 'Lateral', VOL: 'Volante', GOL: 'Goleiro' };
const resultLabel: Record<Result, string> = { V: 'Vitória', E: 'Empate', D: 'Derrota' };

// Barras de cor das agendas, como no app Calendário: só o jogo em vermelho.
const eventColor: Record<EventKind, string> = { match: c.tint, training: c.graphite, physical: c.tertiaryLabel };
const eventLabel: Record<EventKind, string> = { match: 'Jogo', training: 'Treino', physical: 'Físico' };

// Ícones em quadrado colorido, como nos Ajustes do iPhone.
const alertTile: Record<AthleteStatus, { bg: string; icon: IconName }> = {
  injured: { bg: c.tint, icon: 'medkit' },
  suspended: { bg: c.graphite, icon: 'ban' },
  active: { bg: c.orange, icon: 'warning' },
  loaned: { bg: c.tertiaryLabel, icon: 'swap-horizontal' },
};

const resultTint: Record<Result, { bg: string; fg: string }> = {
  V: { bg: c.greenFill, fg: c.green },
  E: { bg: c.fill, fg: c.graphite },
  D: { bg: c.tintFill, fg: c.tintText },
};

export default function DashboardAppleScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('month');
  const [tab, setTab] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  const p = demoByPeriod[period];
  const performance = p.played > 0 ? Math.round(((p.wins * 3 + p.draws) / (p.played * 3)) * 100) : null;
  const m = d.nextMatch;
  const games = `${p.played} ${p.played === 1 ? 'jogo' : 'jogos'}`;
  const weekAvg = Math.round(d.attendanceByWeek.reduce((sum, w) => sum + w.value, 0) / d.attendanceByWeek.length);
  const squadRows = [
    { label: 'Disponíveis', value: d.squad.active, color: c.graphite },
    { label: 'Lesionados', value: d.squad.injured, color: c.tint },
    { label: 'Suspensos', value: d.squad.suspended, color: c.orange },
    { label: 'Emprestado', value: d.squad.loaned, color: c.tertiaryLabel },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + NAV_BAR, paddingBottom: insets.bottom + TAB_BAR + 40 }]}
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 48)}
        scrollEventThrottle={16}
      >
        {/* Título grande: encolhe para a barra do topo ao rolar */}
        <View style={styles.largeTitle}>
          <Txt v="footnoteBold" color={c.tintText} style={{ textTransform: 'uppercase' }}>
            {demoWeek.today.replace('Qua', 'Quarta')}
          </Txt>
          <Txt v="largeTitle" accessibilityRole="header">
            Controle geral
          </Txt>
          <Txt v="subheadline" color={c.secondaryLabel}>
            {demoTeam.name} · {demoTeam.category} {demoTeam.season}
          </Txt>
        </View>

        <Segmented value={period} onChange={setPeriod} />

        {/* Próximo jogo, no formato de placar do app Apple Sports */}
        <Card style={{ padding: 18 }}>
          <View style={styles.spread}>
            <View style={styles.inline}>
              <Ionicons name="football" size={15} color={c.tintText} />
              <Txt v="footnoteBold" color={c.tintText} style={{ textTransform: 'uppercase' }}>
                Próximo jogo
              </Txt>
            </View>
            <Txt v="footnote" color={c.secondaryLabel}>
              em 3 dias
            </Txt>
          </View>
          <View style={styles.scoreboard} accessible accessibilityLabel={`${demoTeam.name} contra ${m.opponent}, ${m.date} às ${m.time}`}>
            <Crest initials="EC" name={demoTeam.name} color={c.tint} />
            <View style={{ alignItems: 'center', gap: 2 }}>
              <Txt v="title2">{m.time}</Txt>
              <Txt v="footnote" color={c.secondaryLabel}>
                {m.date}
              </Txt>
            </View>
            <Crest initials="SC" name={m.opponent} color={c.graphite} />
          </View>
          <View style={[styles.inline, { justifyContent: 'center' }]}>
            <Ionicons name="location-outline" size={14} color={c.secondaryLabel} />
            <Txt v="footnote" color={c.secondaryLabel}>
              {m.location}
            </Txt>
          </View>
          <Txt v="footnote" color={c.secondaryLabel} style={{ textAlign: 'center', marginTop: 2 }}>
            {m.competition}
          </Txt>
          <View style={styles.confirmBar} accessible accessibilityLabel={`${m.confirmed} confirmados, ${m.pending} sem resposta`}>
            <View style={{ flex: m.confirmed, backgroundColor: c.green, borderRadius: 3 }} />
            <View style={{ flex: m.pending, backgroundColor: c.barIdle, borderRadius: 3 }} />
          </View>
          <View style={styles.spread} aria-hidden>
            <Txt v="footnote" color={c.secondaryLabel}>
              <Txt v="footnoteBold" color={c.label}>
                {m.confirmed}
              </Txt>{' '}
              confirmados
            </Txt>
            <Txt v="footnote" color={c.secondaryLabel}>
              <Txt v="footnoteBold" color={c.label}>
                {m.pending}
              </Txt>{' '}
              sem resposta
            </Txt>
          </View>
          <Pressable style={({ pressed }) => [styles.tintedButton, pressed && { opacity: 0.6 }]} accessibilityRole="button" onPress={() => {}}>
            <Txt v="headline" color={c.tintText}>
              Ver convocação
            </Txt>
          </Pressable>
        </Card>

        <SectionHeader title="Resumo" />
        <View style={styles.row}>
          <Metric
            icon="people"
            label="Disponíveis"
            value={String(d.squad.active)}
            unit={`/${d.squad.total}`}
            detail={`${d.squad.total - d.squad.active} fora de combate`}
            a11yLabel={`Disponíveis: ${d.squad.active} de ${d.squad.total} atletas`}
          />
          <Metric
            icon="checkmark-circle"
            label="Frequência"
            value={String(p.attendancePct)}
            unit="%"
            detail={`${p.attendanceDiff >= 0 ? '▲' : '▼'} ${Math.abs(p.attendanceDiff)} p.p. vs. anterior`}
            detailColor={p.attendanceDiff >= 0 ? c.green : c.tintText}
            a11yLabel={`Frequência: ${p.attendancePct}%, ${p.attendanceDiff >= 0 ? 'alta' : 'queda'} de ${Math.abs(p.attendanceDiff)} pontos`}
          />
        </View>
        <View style={styles.row}>
          <Metric
            icon="trophy"
            label="Aproveitamento"
            value={performance == null ? '—' : String(performance)}
            unit={performance == null ? '' : '%'}
            detail={p.played > 0 ? `${p.wins}V ${p.draws}E ${p.losses}D em ${games}` : 'Sem jogos no período'}
            a11yLabel={
              performance == null
                ? 'Aproveitamento: sem jogos no período'
                : `Aproveitamento: ${performance}%, ${p.wins} vitórias, ${p.draws} empates e ${p.losses} derrotas em ${games}`
            }
          />
          <Metric
            icon="medkit"
            label="Lesionados"
            value={String(d.squad.injured)}
            valueColor={c.tint}
            detail={`+ ${d.squad.suspended} suspensos`}
            a11yLabel={`Lesionados: ${d.squad.injured}, mais ${d.squad.suspended} suspensos`}
          />
        </View>

        <SectionHeader title="Esta semana" action="Agenda" />
        <Card>
          <View style={styles.weekStrip} role="list">
            {demoWeek.days.map((day) => (
              <View
                key={day.key}
                style={styles.weekDay}
                role="listitem"
                accessible
                accessibilityLabel={`${day.name}, ${day.day} de outubro${day.isToday ? ', hoje' : ''}, ${day.hasEvent ? 'com evento' : 'sem eventos'}`}
              >
                <Txt v="caption2" color={c.secondaryLabel}>
                  {day.label}
                </Txt>
                <View style={[styles.dayCircle, day.isToday && { backgroundColor: c.tint }]}>
                  <Txt v={day.isToday ? 'headline' : 'body'} color={day.isToday ? c.white : day.day < 8 ? c.secondaryLabel : c.label}>
                    {day.day}
                  </Txt>
                </View>
                <View style={[styles.dot, { backgroundColor: day.hasEvent ? c.tertiaryLabel : 'transparent' }]} />
              </View>
            ))}
          </View>
          <View style={styles.separatorFull} />
          {demoWeek.events.map((e, i) => (
            <ListRow
              key={e.title}
              first={i === 0}
              a11yLabel={`${e.weekday} ${e.day}. ${eventLabel[e.kind]}: ${e.title}. ${e.detail}`}
              left={<View style={[styles.eventBar, { backgroundColor: eventColor[e.kind] }]} />}
              title={e.title}
              subtitle={`${e.weekday} ${e.day} · ${e.detail}`}
            />
          ))}
        </Card>

        <SectionHeader title="Elenco" />
        <Card style={{ padding: 16 }}>
          <View style={styles.inline}>
            <Txt v="title1">{d.squad.total}</Txt>
            <Txt v="subheadline" color={c.secondaryLabel} style={{ marginTop: 6 }}>
              atletas inscritos
            </Txt>
          </View>
          {/* Barra única segmentada, como em Ajustes › Armazenamento */}
          <View style={styles.stackBar} accessible accessibilityLabel={squadRows.map((r) => `${r.value} ${r.label.toLowerCase()}`).join(', ')}>
            {squadRows.map((r) => (
              <View key={r.label} style={{ flex: r.value, backgroundColor: r.color }} />
            ))}
          </View>
          <View style={styles.legend} aria-hidden>
            {squadRows.map((r) => (
              <View key={r.label} style={styles.inline}>
                <View style={[styles.legendDot, { backgroundColor: r.color }]} />
                <Txt v="footnote" color={c.secondaryLabel}>
                  {r.label}{' '}
                  <Txt v="footnoteBold" color={c.label}>
                    {r.value}
                  </Txt>
                </Txt>
              </View>
            ))}
          </View>
        </Card>

        <SectionHeader title="Últimos jogos" />
        <Card style={{ padding: 16, gap: 14 }}>
          <View style={styles.results} role="list">
            {d.lastResults.map((r, i) => (
              <View key={i} style={styles.result} role="listitem" accessible accessibilityLabel={`${resultLabel[r.result]}, ${r.score}, contra ${r.opponent}`}>
                <View style={[styles.resultCircle, { backgroundColor: resultTint[r.result].bg }]}>
                  <Txt v="headline" color={resultTint[r.result].fg}>
                    {r.result}
                  </Txt>
                </View>
                <Txt v="caption1" color={c.secondaryLabel}>
                  {r.score}
                </Txt>
              </View>
            ))}
          </View>
          <Txt v="footnote" color={c.secondaryLabel} style={{ textAlign: 'center' }}>
            Temporada: {d.season.wins}V {d.season.draws}E {d.season.losses}D · {d.season.goalsFor} gols pró, {d.season.goalsAgainst} contra
          </Txt>
        </Card>

        <SectionHeader title="Frequência nos treinos" />
        <Card style={{ padding: 16 }}>
          <Txt v="footnoteBold" color={c.secondaryLabel} style={{ textTransform: 'uppercase' }}>
            Média semanal
          </Txt>
          <Txt v="title1">{weekAvg}%</Txt>
          {/* Gráfico no estilo Tempo de Uso: linhas de grade à direita e média tracejada */}
          <View style={styles.chart}>
            {[100, 50, 0].map((g) => (
              <View key={g} style={[styles.gridline, { bottom: (g / 100) * CHART_H }]}>
                <View style={styles.gridlineRule} />
                <Txt v="caption1" color={c.secondaryLabel} style={styles.gridLabel}>
                  {g}
                </Txt>
              </View>
            ))}
            <View style={[styles.avgLine, { bottom: (weekAvg / 100) * CHART_H }]} aria-hidden>
              {Array.from({ length: 34 }, (_, i) => (
                <View key={i} style={styles.avgDash} />
              ))}
            </View>
            <View style={styles.bars}>
              {d.attendanceByWeek.map((w, i) => {
                const current = i === d.attendanceByWeek.length - 1;
                return (
                  <View key={w.label} style={styles.barCol} accessible accessibilityLabel={`Semana ${i + 1}${current ? ', atual' : ''}: ${w.value}%`}>
                    <View style={[styles.bar, { height: (w.value / 100) * CHART_H, backgroundColor: current ? c.tint : c.barIdle }]} />
                  </View>
                );
              })}
            </View>
          </View>
          <View style={[styles.bars, { paddingRight: GRID_LABEL_W, marginTop: 6 }]} aria-hidden>
            {d.attendanceByWeek.map((w, i) => (
              <Txt key={w.label} v="caption1" color={i === d.attendanceByWeek.length - 1 ? c.label : c.secondaryLabel} style={{ flex: 1, textAlign: 'center' }}>
                {i === d.attendanceByWeek.length - 1 ? 'Atual' : w.label}
              </Txt>
            ))}
          </View>
        </Card>

        <SectionHeader title="Alertas" />
        <Card>
          {d.alerts.map((a, i) => (
            <ListRow
              key={a.name}
              first={i === 0}
              left={
                <View style={[styles.tile, { backgroundColor: alertTile[a.status].bg }]}>
                  <Ionicons name={alertTile[a.status].icon} size={17} color={c.white} />
                </View>
              }
              title={a.name}
              subtitle={a.detail}
            />
          ))}
        </Card>

        <SectionHeader title="Artilharia" />
        <Card>
          {d.topScorers.map((s, i) => (
            <ListRow
              key={s.name}
              first={i === 0}
              a11yLabel={`${i + 1}º, ${s.name}, ${positionLabel[s.position] ?? s.position}, ${s.goals} gols`}
              left={
                <Txt v="headline" color={i === 0 ? c.tintText : c.secondaryLabel} style={{ width: 22, textAlign: 'center' }}>
                  {i + 1}
                </Txt>
              }
              title={s.name}
              subtitle={positionLabel[s.position] ?? s.position}
              right={`${s.goals} gols`}
            />
          ))}
        </Card>

        <Txt v="footnote" color={c.secondaryLabel} style={{ textAlign: 'center', marginTop: 8 }}>
          Dados fictícios de demonstração · Teste Apple
        </Txt>
      </ScrollView>

      {/* Barra do topo: transparente no início, vidro com título pequeno ao rolar */}
      <Glass style={[styles.navBar, { paddingTop: insets.top, height: insets.top + NAV_BAR }]} enabled={scrolled}>
        <Pressable style={styles.crestButton} accessibilityRole="button" accessibilityLabel={`Trocar equipe, atual ${demoTeam.name}`}>
          <Txt v="footnoteBold" color={c.white}>
            EC
          </Txt>
        </Pressable>
        <Txt v="headline" style={[styles.navTitle, { opacity: scrolled ? 1 : 0 }]} aria-hidden={!scrolled}>
          Controle geral
        </Txt>
        <Glass style={styles.navCapsule} enabled>
          <Pressable style={styles.navButton} accessibilityRole="button" accessibilityLabel="Notificações, 3 novas">
            <Ionicons name="notifications-outline" size={21} color={c.label} />
            <View style={styles.badgeDot} />
          </Pressable>
          <Pressable style={styles.navButton} accessibilityRole="button" accessibilityLabel="Novo evento">
            <Ionicons name="add" size={26} color={c.label} />
          </Pressable>
        </Glass>
      </Glass>

      {/* Tab bar flutuante de vidro (iOS 26) */}
      <View style={[styles.tabBarWrap, { bottom: Math.max(insets.bottom, 12) }]} pointerEvents="box-none">
        <Glass style={styles.tabBar} enabled role="tablist">
          {tabs.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable
                key={t.key}
                style={[styles.tab, active && { backgroundColor: c.fill }]}
                onPress={() => setTab(t.key)}
                role="tab"
                aria-selected={active}
                accessibilityLabel={t.label}
              >
                <Ionicons name={active ? t.icon : t.iconOff} size={22} color={active ? c.tint : c.label} />
                <Txt v="caption2" color={active ? c.tintText : c.label}>
                  {t.label}
                </Txt>
              </Pressable>
            );
          })}
        </Glass>
      </View>
    </View>
  );
}

const CHART_H = 120;
const GRID_LABEL_W = 30;

function Txt({ v, color = c.label, style, ...props }: TextProps & { v: keyof typeof type; color?: string }) {
  return <Text style={[type[v], { color }, style]} {...props} />;
}

// Liquid Glass nativo no iOS 26; nas outras plataformas, branco translúcido com desfoque.
function Glass({ enabled, style, children, ...props }: ComponentProps<typeof View> & { enabled: boolean }) {
  if (!enabled) return <View style={style} {...props}>{children}</View>;
  if (liquidGlass) {
    return (
      <GlassView glassEffectStyle="regular" isInteractive style={style} {...props}>
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[styles.glassFallback, webGlass, style]} {...props}>
      {children}
    </View>
  );
}

function Card({ style, children }: { style?: ViewStyle; children: ReactNode }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Txt v="title2" accessibilityRole="header">
        {title}
      </Txt>
      {action && (
        <Pressable hitSlop={12} accessibilityRole="button" style={styles.inline} onPress={() => {}}>
          <Txt v="body" color={c.tintText}>
            {action}
          </Txt>
          <Ionicons name="chevron-forward" size={17} color={c.tintText} />
        </Pressable>
      )}
    </View>
  );
}

function Segmented({ value, onChange }: { value: Period; onChange: (v: Period) => void }) {
  return (
    <View style={styles.segmented} role="tablist">
      {periods.map((p) => {
        const active = p.value === value;
        return (
          <Pressable
            key={p.value}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(p.value)}
            role="tab"
            aria-selected={active}
          >
            <Txt v={active ? 'subheadlineBold' : 'subheadline'}>{p.label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

function Crest({ initials, name, color }: { initials: string; name: string; color: string }) {
  return (
    <View style={styles.crest}>
      <View style={[styles.crestCircle, { backgroundColor: color }]}>
        <Txt v="headline" color={c.white}>
          {initials}
        </Txt>
      </View>
      <Txt v="footnoteBold" style={{ textAlign: 'center' }} numberOfLines={2}>
        {name}
      </Txt>
    </View>
  );
}

function Metric({
  icon,
  label,
  value,
  unit,
  detail,
  detailColor = c.secondaryLabel,
  valueColor = c.label,
  a11yLabel,
}: {
  icon: IconName;
  label: string;
  value: string;
  unit?: string;
  detail: string;
  detailColor?: string;
  valueColor?: string;
  a11yLabel: string;
}) {
  return (
    <View style={[styles.card, styles.metric]} accessible accessibilityLabel={a11yLabel}>
      <View style={styles.inline}>
        <Ionicons name={icon} size={15} color={c.tint} />
        <Txt v="subheadlineBold" color={c.tintText}>
          {label}
        </Txt>
      </View>
      <Txt v="title1" color={valueColor} style={{ marginTop: 10 }}>
        {value}
        {unit ? (
          <Txt v="subheadlineBold" color={c.secondaryLabel}>
            {unit}
          </Txt>
        ) : null}
      </Txt>
      <Txt v="footnote" color={detailColor}>
        {detail}
      </Txt>
    </View>
  );
}

function ListRow({
  left,
  title,
  subtitle,
  right,
  first,
  a11yLabel,
}: {
  left: ReactNode;
  title: string;
  subtitle?: string;
  right?: string;
  first?: boolean;
  a11yLabel?: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.listRow, pressed && { backgroundColor: c.fill }]}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? `${title}${subtitle ? `, ${subtitle}` : ''}`}
      onPress={() => {}}
    >
      <View style={styles.listLeft}>{left}</View>
      <View style={[styles.listBody, !first && styles.listDivider]}>
        <View style={{ flex: 1 }}>
          <Txt v="body" numberOfLines={1}>
            {title}
          </Txt>
          {subtitle && (
            <Txt v="footnote" color={c.secondaryLabel}>
              {subtitle}
            </Txt>
          )}
        </View>
        {right && (
          <Txt v="subheadline" color={c.secondaryLabel}>
            {right}
          </Txt>
        )}
        <Ionicons name="chevron-forward" size={16} color={c.chevron} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 12 },
  largeTitle: { paddingTop: 4, paddingBottom: 6 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', gap: 12 },
  card: { backgroundColor: c.card, borderRadius: 22, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingHorizontal: 4 },

  segmented: { flexDirection: 'row', backgroundColor: c.fill, borderRadius: 999, padding: 3 },
  segment: { flex: 1, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
  segmentActive: {
    backgroundColor: c.white,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  scoreboard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 12 },
  crest: { width: 104, alignItems: 'center', gap: 8 },
  crestCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  confirmBar: { flexDirection: 'row', gap: 3, height: 6, marginTop: 16, marginBottom: 6 },
  tintedButton: { marginTop: 16, minHeight: 50, borderRadius: 999, backgroundColor: c.tintFill, alignItems: 'center', justifyContent: 'center' },

  metric: { flex: 1, minWidth: 0, padding: 14 },

  weekStrip: { flexDirection: 'row', paddingHorizontal: 8, paddingTop: 12, paddingBottom: 8 },
  weekDay: { flex: 1, alignItems: 'center', gap: 4 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
  separatorFull: { height: StyleSheet.hairlineWidth, backgroundColor: c.separator, marginLeft: 16 },
  eventBar: { width: 4, height: 34, borderRadius: 2 },

  listRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, minHeight: 56 },
  listLeft: { width: 30, alignItems: 'center', marginRight: 14 },
  listBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 11, paddingRight: 14 },
  listDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.separator },
  tile: { width: 30, height: 30, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },

  stackBar: { flexDirection: 'row', gap: 2, height: 14, borderRadius: 7, overflow: 'hidden', marginTop: 12 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 6, marginTop: 12 },
  legendDot: { width: 9, height: 9, borderRadius: 4.5 },

  results: { flexDirection: 'row', justifyContent: 'space-between' },
  result: { alignItems: 'center', gap: 6 },
  resultCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },

  chart: { height: CHART_H, marginTop: 14 },
  gridline: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', height: 0 },
  gridlineRule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: c.gridline },
  gridLabel: { width: GRID_LABEL_W, textAlign: 'right' },
  avgLine: { position: 'absolute', left: 0, right: GRID_LABEL_W, flexDirection: 'row', justifyContent: 'space-between', height: 1.5 },
  avgDash: { width: 4, height: 1.5, backgroundColor: c.green },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, paddingRight: GRID_LABEL_W, height: '100%' },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  bar: { width: 22, borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },

  glassFallback: {
    backgroundColor: 'rgba(250, 250, 252, 0.78)',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: StyleSheet.hairlineWidth,
  },
  navBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderWidth: 0 },
  navTitle: { position: 'absolute', left: 0, right: 0, bottom: 15, textAlign: 'center', pointerEvents: 'none' },
  crestButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' },
  navCapsule: { marginLeft: 'auto', flexDirection: 'row', borderRadius: 22, paddingHorizontal: 4 },
  navButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  badgeDot: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: c.tint },

  tabBarWrap: { position: 'absolute', left: 20, right: 20, alignItems: 'center' },
  tabBar: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: TAB_BAR,
    borderRadius: TAB_BAR / 2,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: (TAB_BAR - 8) / 2 },
});
