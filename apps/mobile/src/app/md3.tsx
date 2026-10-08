// Teste: dashboard de controle geral em Material Design 3 (React Native Paper).
import { StatusBar } from 'expo-status-bar';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Badge,
  BottomNavigation,
  Button,
  FAB,
  Icon,
  IconButton,
  List,
  ProgressBar,
  SegmentedButtons,
  Surface,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { demoByPeriod, demoDashboard as d, demoTeam, demoWeek, type AthleteStatus, type EventKind, type Period, type Result } from '@/data/demo';
import { fonts } from '@/theme';
import { useAppTheme, type AppTheme } from '@/theme-md3';

const NAV_HEIGHT = 80;
// Avatares e badge têm círculo fixo: limita o aumento de fonte do sistema para o texto caber.
const FIXED_BOX_FONT_SCALE = 1.2;

const tabs = [
  { key: 'home', title: 'Início', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
  { key: 'squad', title: 'Elenco', focusedIcon: 'account-group', unfocusedIcon: 'account-group-outline' },
  { key: 'agenda', title: 'Agenda', focusedIcon: 'calendar-month', unfocusedIcon: 'calendar-month-outline' },
  { key: 'tactics', title: 'Táticas', focusedIcon: 'clipboard-play', unfocusedIcon: 'clipboard-play-outline' },
];

const positionLabel: Record<string, string> = { ATA: 'Atacante', MEI: 'Meia', ZAG: 'Zagueiro', LAT: 'Lateral', VOL: 'Volante', GOL: 'Goleiro' };
const resultLabel: Record<Result, string> = { V: 'Vitória', E: 'Empate', D: 'Derrota' };

// Só o jogo usa o vermelho; treino em grafite e físico em cinza neutro.
function eventStyle(kind: EventKind, c: AppTheme['colors']) {
  if (kind === 'match') return { bg: c.primary, fg: c.onPrimary, icon: 'soccer', label: 'Jogo' };
  if (kind === 'physical') return { bg: c.surfaceContainerHighest, fg: c.onSurface, icon: 'run', label: 'Físico' };
  return { bg: c.graphite, fg: c.onGraphite, icon: 'whistle', label: 'Treino' };
}

function alertStyle(status: AthleteStatus, c: AppTheme['colors']) {
  if (status === 'injured') return { bg: c.errorContainer, fg: c.onErrorContainer, icon: 'bandage' };
  if (status === 'suspended') return { bg: c.surfaceContainerHighest, fg: c.onSurface, icon: 'cancel' };
  return { bg: c.warningContainer, fg: c.onWarningContainer, icon: 'alert-outline' };
}

function resultStyle(result: Result, c: AppTheme['colors']) {
  if (result === 'V') return { bg: c.successContainer, fg: c.onSuccessContainer };
  if (result === 'D') return { bg: c.errorContainer, fg: c.onErrorContainer };
  return { bg: c.surfaceContainerHighest, fg: c.onSurfaceVariant };
}

export default function DashboardMd3Screen() {
  const theme = useAppTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('month');
  const [tabIndex, setTabIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const p = demoByPeriod[period];
  const performance = p.played > 0 ? Math.round(((p.wins * 3 + p.draws) / (p.played * 3)) * 100) : null;
  const m = d.nextMatch;
  const navHeight = NAV_HEIGHT + insets.bottom;
  const games = `${p.played} ${p.played === 1 ? 'jogo' : 'jogos'}`;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <StatusBar style="dark" />

      {/* Top app bar: sobe para surfaceContainer ao rolar, como no MD3 */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: scrolled ? c.surfaceContainer : c.surface }}>
        <View style={styles.topBar}>
          <Avatar.Text
            size={40}
            label="EC"
            color={c.onGraphite}
            style={{ backgroundColor: c.graphite }}
            labelStyle={{ fontFamily: fonts.medium }}
            maxFontSizeMultiplier={FIXED_BOX_FONT_SCALE}
            aria-hidden
          />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text variant="titleLarge" numberOfLines={1}>
              {demoTeam.name}
            </Text>
            <Text variant="labelMedium" style={{ color: c.onSurfaceVariant }} numberOfLines={1}>
              {demoTeam.category} · Temporada {demoTeam.season}
            </Text>
          </View>
          <View>
            <IconButton icon="bell-outline" accessibilityLabel="Notificações, 3 novas" onPress={() => {}} />
            <View style={styles.badge} pointerEvents="none" aria-hidden>
              <Badge size={16} style={styles.badgeText} maxFontSizeMultiplier={FIXED_BOX_FONT_SCALE}>
                3
              </Badge>
            </View>
          </View>
          <TouchableRipple
            borderless
            onPress={() => {}}
            style={styles.account}
            accessibilityRole="button"
            accessibilityLabel={`Conta de ${demoTeam.coach}`}
          >
            <Avatar.Text
              size={32}
              label={demoTeam.coach[0]}
              color={c.onSecondaryContainer}
              style={{ backgroundColor: c.secondaryContainer }}
              labelStyle={{ fontFamily: fonts.medium }}
              maxFontSizeMultiplier={FIXED_BOX_FONT_SCALE}
            />
          </TouchableRipple>
        </View>
      </SafeAreaView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 4)}
        scrollEventThrottle={16}
      >
        <View style={styles.headline}>
          <Text variant="labelLarge" style={{ color: c.onSurfaceVariant }}>
            {demoWeek.today}
          </Text>
          <Text variant="headlineMedium" accessibilityRole="header">
            Controle geral
          </Text>
        </View>

        <SegmentedButtons
          value={period}
          onValueChange={setPeriod}
          buttons={[
            { value: 'week', label: 'Semana', showSelectedCheck: true },
            { value: 'month', label: 'Mês', showSelectedCheck: true },
            { value: 'season', label: 'Temporada', showSelectedCheck: true },
          ]}
        />

        {/* Próximo jogo: único bloco no vermelho da marca */}
        <Surface elevation={0} style={[styles.matchCard, { backgroundColor: c.primaryContainer }]}>
          <View style={styles.inline}>
            <Icon source="soccer" size={18} color={c.onPrimaryContainer} />
            <Text variant="labelLarge" style={{ color: c.onPrimaryContainer }}>
              Próximo jogo
            </Text>
          </View>
          <Text variant="headlineSmall" style={{ color: c.onPrimaryContainer, marginTop: 12 }} accessibilityRole="header">
            {m.isHome ? `${demoTeam.name} x ${m.opponent}` : `${m.opponent} x ${demoTeam.name}`}
          </Text>
          <Text variant="bodyMedium" style={{ color: c.onPrimaryContainer, marginTop: 4 }}>
            {m.competition}
          </Text>
          <View style={[styles.inline, { marginTop: 12 }]}>
            <Icon source="calendar-blank-outline" size={18} color={c.onPrimaryContainer} />
            <Text variant="bodyMedium" style={{ color: c.onPrimaryContainer }}>
              {m.date} · {m.time}
            </Text>
          </View>
          <View style={[styles.inline, { marginTop: 6 }]}>
            <Icon source="map-marker-outline" size={18} color={c.onPrimaryContainer} />
            <Text variant="bodyMedium" style={{ color: c.onPrimaryContainer }}>
              {m.location} · {m.isHome ? 'em casa' : 'fora'}
            </Text>
          </View>
          {/* Em telas de 360dp o botão quebra para a linha de baixo em vez de vazar do card */}
          <View style={styles.matchFooter}>
            <View style={styles.matchStats}>
              <View accessible accessibilityLabel={`${m.confirmed} confirmados`}>
                <Text variant="titleLarge" style={{ color: c.onPrimaryContainer }}>
                  {m.confirmed}
                </Text>
                <Text variant="bodySmall" style={{ color: c.onPrimaryContainer }}>
                  confirmados
                </Text>
              </View>
              <View accessible accessibilityLabel={`${m.pending} sem resposta`}>
                <Text variant="titleLarge" style={{ color: c.onPrimaryContainer }}>
                  {m.pending}
                </Text>
                <Text variant="bodySmall" style={{ color: c.onPrimaryContainer }}>
                  sem resposta
                </Text>
              </View>
            </View>
            <Button
              mode="contained"
              buttonColor={c.onPrimaryContainer}
              textColor={c.primary}
              style={{ marginLeft: 'auto' }}
              hitSlop={{ top: 4, bottom: 4 }}
              onPress={() => {}}
            >
              Convocação
            </Button>
          </View>
        </Surface>

        <View style={styles.grid}>
          <View style={styles.row}>
            <KpiCard
              icon="account-check-outline"
              label="Disponíveis"
              value={`${d.squad.active}/${d.squad.total}`}
              support={`${d.squad.total - d.squad.active} fora de combate`}
              a11yLabel={`Disponíveis: ${d.squad.active} de ${d.squad.total} atletas. ${d.squad.total - d.squad.active} fora de combate`}
            />
            <KpiCard
              icon="clipboard-check-outline"
              label="Frequência"
              value={`${p.attendancePct}%`}
              trend={`${p.attendanceDiff >= 0 ? '+' : '−'}${Math.abs(p.attendanceDiff)} p.p. vs. anterior`}
              trendUp={p.attendanceDiff >= 0}
              a11yLabel={`Frequência: ${p.attendancePct}%. ${p.attendanceDiff >= 0 ? 'Alta' : 'Queda'} de ${Math.abs(p.attendanceDiff)} pontos percentuais em relação ao período anterior`}
            />
          </View>
          <View style={styles.row}>
            <KpiCard
              icon="trophy-outline"
              label="Aproveitamento"
              value={performance == null ? '—' : `${performance}%`}
              support={p.played > 0 ? `${p.wins}V ${p.draws}E ${p.losses}D em ${games}` : 'Sem jogos no período'}
              a11yLabel={
                performance == null
                  ? 'Aproveitamento: sem jogos no período'
                  : `Aproveitamento: ${performance}%. ${p.wins} vitórias, ${p.draws} empates e ${p.losses} derrotas em ${games}`
              }
            />
            <KpiCard
              icon="medical-bag"
              label="Lesionados"
              value={String(d.squad.injured)}
              support={`+ ${d.squad.suspended} suspensos`}
              tone="error"
              a11yLabel={`Lesionados: ${d.squad.injured}. Mais ${d.squad.suspended} suspensos`}
            />
          </View>
        </View>

        <Section title="Agenda da semana" action="Ver agenda">
          <View style={styles.weekStrip} role="list">
            {demoWeek.days.map((day) => (
              <View
                key={day.key}
                style={styles.weekDay}
                role="listitem"
                accessible
                accessibilityLabel={`${day.name}, ${day.day} de outubro${day.isToday ? ', hoje' : ''}, ${day.hasEvent ? 'com evento' : 'sem eventos'}`}
              >
                <Text variant="labelSmall" style={{ color: c.onSurfaceVariant }}>
                  {day.label}
                </Text>
                <View style={[styles.dayCircle, day.isToday && { backgroundColor: c.primary }]}>
                  <Text variant="titleSmall" style={{ color: day.isToday ? c.onPrimary : day.day < 8 ? c.onSurfaceVariant : c.onSurface }}>
                    {day.day}
                  </Text>
                </View>
                <View style={[styles.dot, { backgroundColor: day.hasEvent ? c.outline : 'transparent' }]} />
              </View>
            ))}
          </View>
          <View style={{ gap: 8, marginTop: 8 }}>
            {demoWeek.events.map((e) => {
              const s = eventStyle(e.kind, c);
              return (
                <View key={e.title} style={styles.eventRow} accessible accessibilityLabel={`${e.weekday} ${e.day}. ${s.label}: ${e.title}. ${e.detail}`}>
                  <View style={styles.eventDate}>
                    <Text variant="labelMedium" style={{ color: c.onSurfaceVariant }}>
                      {e.weekday}
                    </Text>
                    <Text variant="titleLarge">{e.day}</Text>
                  </View>
                  <View style={[styles.eventBlock, { backgroundColor: s.bg }]}>
                    <View style={styles.inline}>
                      <Icon source={s.icon} size={16} color={s.fg} />
                      <Text variant="titleSmall" style={{ color: s.fg, flex: 1 }} numberOfLines={1}>
                        {e.title}
                      </Text>
                    </View>
                    <Text variant="bodySmall" style={{ color: s.fg, marginTop: 2 }}>
                      {e.detail}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Section>

        <Section title="Situação do elenco" subtitle={`${d.squad.total} atletas inscritos`}>
          {[
            { label: 'Disponível', value: d.squad.active, color: c.graphite },
            { label: 'Lesionado', value: d.squad.injured, color: c.primary },
            { label: 'Suspenso', value: d.squad.suspended, color: c.tertiary },
            { label: 'Emprestado', value: d.squad.loaned, color: c.outline },
          ].map((row) => (
            <View key={row.label} style={{ marginBottom: 12 }}>
              {/* O ProgressBar já anuncia rótulo e valor; a linha de texto é só visual */}
              <View style={styles.progressLabel} aria-hidden>
                <Text variant="bodyMedium">{row.label}</Text>
                <Text variant="labelLarge">{row.value}</Text>
              </View>
              <ProgressBar
                progress={row.value / d.squad.total}
                color={row.color}
                style={[styles.progress, { backgroundColor: c.surfaceContainerHighest }]}
                accessibilityLabel={`${row.label}: ${row.value} de ${d.squad.total}`}
              />
            </View>
          ))}
        </Section>

        <Section title="Últimos resultados" subtitle={`${d.season.goalsFor} gols pró, ${d.season.goalsAgainst} contra na temporada`}>
          <View style={styles.results} role="list">
            {d.lastResults.map((r, i) => {
              const s = resultStyle(r.result, c);
              return (
                <View key={i} style={styles.result} role="listitem" accessible accessibilityLabel={`${resultLabel[r.result]}, ${r.score}, contra ${r.opponent}`}>
                  <View style={[styles.resultCircle, { backgroundColor: s.bg }]}>
                    <Text variant="titleMedium" style={{ color: s.fg }}>
                      {r.result}
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>
                    {r.score}
                  </Text>
                </View>
              );
            })}
          </View>
        </Section>

        <Section title="Frequência nos treinos" subtitle="Presença média por semana">
          <View style={styles.bars}>
            {d.attendanceByWeek.map((w, i) => {
              const current = i === d.attendanceByWeek.length - 1;
              return (
                <View
                  key={w.label}
                  style={styles.barCol}
                  accessible
                  accessibilityLabel={`Semana ${i + 1}${current ? ', atual' : ''}: ${w.value}% de presença`}
                >
                  <Text variant="labelMedium" style={{ color: current ? c.primary : c.onSurfaceVariant }}>
                    {w.value}%
                  </Text>
                  {/* Só a trilha tem altura fixa; os rótulos crescem com a fonte do sistema */}
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: `${w.value}%`, backgroundColor: current ? c.primary : c.secondaryContainer }]} />
                  </View>
                  <Text variant="labelSmall" style={{ color: current ? c.onSurface : c.onSurfaceVariant }}>
                    {current ? 'Atual' : w.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </Section>

        <Section title="Alertas" subtitle="Departamento médico e disciplina" flush>
          {d.alerts.map((a) => {
            const s = alertStyle(a.status, c);
            return (
              <List.Item
                key={a.name}
                title={a.name}
                description={a.detail}
                titleStyle={theme.fonts.bodyLarge}
                descriptionStyle={[theme.fonts.bodyMedium, { color: c.onSurfaceVariant }]}
                left={(props) => <Avatar.Icon size={40} icon={s.icon} color={s.fg} style={[props.style, { backgroundColor: s.bg }]} />}
              />
            );
          })}
        </Section>

        <Section title="Artilharia" flush>
          {d.topScorers.map((s, i) => (
            <List.Item
              key={s.name}
              title={s.name}
              description={positionLabel[s.position] ?? s.position}
              titleStyle={theme.fonts.bodyLarge}
              descriptionStyle={[theme.fonts.bodyMedium, { color: c.onSurfaceVariant }]}
              accessibilityLabel={`${i + 1}º, ${s.name}, ${positionLabel[s.position] ?? s.position}, ${s.goals} gols`}
              left={(props) => (
                <Avatar.Text
                  size={40}
                  label={String(i + 1)}
                  color={i === 0 ? c.onPrimaryContainer : c.onSurfaceVariant}
                  style={[props.style, { backgroundColor: i === 0 ? c.primaryContainer : c.surfaceContainerHighest }]}
                  labelStyle={{ fontFamily: fonts.medium }}
                  maxFontSizeMultiplier={FIXED_BOX_FONT_SCALE}
                />
              )}
              right={(props) => (
                <View style={[props.style, styles.goals]}>
                  <Text variant="titleLarge">{s.goals}</Text>
                  <Text variant="labelSmall" style={{ color: c.onSurfaceVariant }}>
                    gols
                  </Text>
                </View>
              )}
            />
          ))}
        </Section>

        <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, textAlign: 'center' }}>
          Dados fictícios de demonstração · Teste Material 3
        </Text>
      </ScrollView>

      {/* FAB tonal; recolhe para só o ícone ao rolar, como no Gmail e no Agenda.
          (AnimatedFAB do Paper desenha errado na web, por isso o rótulo é trocado direto.) */}
      <FAB
        icon="plus"
        label={scrolled ? undefined : 'Novo evento'}
        variant="secondary"
        accessibilityLabel="Novo evento"
        style={[styles.fab, { bottom: navHeight + 16 }]}
        onPress={() => {}}
      />

      {/* Navigation bar MD3 (as outras abas ainda não existem) */}
      <BottomNavigation.Bar
        navigationState={{ index: tabIndex, routes: tabs }}
        onTabPress={({ route }) => setTabIndex(tabs.findIndex((t) => t.key === route.key))}
        safeAreaInsets={{ bottom: insets.bottom }}
        style={{ backgroundColor: c.surfaceContainer }}
      />
    </View>
  );
}

function KpiCard({
  icon,
  label,
  value,
  support,
  trend,
  trendUp = true,
  tone = 'default',
  a11yLabel,
}: {
  icon: string;
  label: string;
  value: string;
  support?: string;
  trend?: string;
  trendUp?: boolean;
  tone?: 'default' | 'error';
  a11yLabel?: string;
}) {
  const { colors: c } = useAppTheme();
  const iconBg = tone === 'error' ? c.errorContainer : c.surfaceContainerHighest;
  const iconFg = tone === 'error' ? c.onErrorContainer : c.onSurfaceVariant;
  return (
    <Surface
      elevation={1}
      style={[styles.kpi, { backgroundColor: c.surfaceContainerLow }]}
      accessible
      accessibilityLabel={a11yLabel ?? `${label}: ${value}. ${trend ?? support ?? ''}`}
    >
      <View style={[styles.kpiIcon, { backgroundColor: iconBg }]}>
        <Icon source={icon} size={20} color={iconFg} />
      </View>
      <Text variant="bodyMedium" style={{ color: c.onSurfaceVariant, marginTop: 12 }}>
        {label}
      </Text>
      <Text variant="headlineMedium" style={tone === 'error' ? { color: c.error } : undefined}>
        {value}
      </Text>
      {trend ? (
        <View style={[styles.inline, { gap: 4, marginTop: 2 }]}>
          <Icon source={trendUp ? 'trending-up' : 'trending-down'} size={16} color={trendUp ? c.success : c.error} />
          <Text variant="labelMedium" style={{ color: trendUp ? c.success : c.error, flexShrink: 1 }}>
            {trend}
          </Text>
        </View>
      ) : (
        support && (
          <Text variant="labelMedium" style={{ color: c.onSurfaceVariant, marginTop: 2 }}>
            {support}
          </Text>
        )
      )}
    </Surface>
  );
}

function Section({ title, subtitle, action, flush, children }: { title: string; subtitle?: string; action?: string; flush?: boolean; children: ReactNode }) {
  const { colors: c } = useAppTheme();
  return (
    <Surface elevation={1} style={[styles.section, flush && styles.sectionFlush, { backgroundColor: c.surfaceContainerLow }]}>
      <View style={[styles.sectionHeader, flush && { paddingHorizontal: 16 }]}>
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium" accessibilityRole="header">
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant, marginTop: 2 }}>
              {subtitle}
            </Text>
          )}
        </View>
        {action && (
          // minHeight 48 só aumenta a área de toque; o botão de texto não tem fundo
          <Button mode="text" compact contentStyle={{ minHeight: 48 }} onPress={() => {}}>
            {action}
          </Button>
        )}
      </View>
      {children}
    </Surface>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 4, paddingVertical: 8, minHeight: 64 },
  badge: { position: 'absolute', top: 6, right: 6 },
  badgeText: { fontSize: 11, fontFamily: fonts.medium, paddingHorizontal: 4 },
  account: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 96, gap: 12 },
  headline: { paddingTop: 8, paddingBottom: 4, gap: 2 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  matchCard: { borderRadius: 16, padding: 20 },
  matchFooter: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 16, rowGap: 12, marginTop: 20 },
  matchStats: { flexDirection: 'row', gap: 24 },
  grid: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  kpi: { flex: 1, minWidth: 0, borderRadius: 16, padding: 16 },
  kpiIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  section: { borderRadius: 16, padding: 16 },
  sectionFlush: { paddingHorizontal: 0, paddingBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, minHeight: 48 },
  weekStrip: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { alignItems: 'center', gap: 4, flex: 1 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eventDate: { width: 40, alignItems: 'center' },
  eventBlock: { flex: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  progressLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progress: { height: 8, borderRadius: 4 },
  results: { flexDirection: 'row', justifyContent: 'space-between' },
  result: { alignItems: 'center', gap: 6 },
  resultCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  barTrack: { height: 110, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 12 },
  goals: { alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'absolute', right: 16 },
});
