// Teste: dashboard de controle geral em Material Design 3 (React Native Paper).
import { StatusBar } from 'expo-status-bar';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Badge, Button, FAB, Icon, IconButton, List, ProgressBar, SegmentedButtons, Surface, Text, TouchableRipple } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { demoByPeriod, demoDashboard as d, demoTeam, demoWeek, type AthleteStatus, type EventKind, type Period, type Result } from '@/data/demo';
import { fonts } from '@/theme';
import { useAppTheme, type AppTheme } from '@/theme-md3';

const NAV_HEIGHT = 80;

const tabs = [
  { key: 'home', label: 'Início', icon: 'home', iconOff: 'home-outline' },
  { key: 'squad', label: 'Elenco', icon: 'account-group', iconOff: 'account-group-outline' },
  { key: 'agenda', label: 'Agenda', icon: 'calendar-month', iconOff: 'calendar-month-outline' },
  { key: 'tactics', label: 'Táticas', icon: 'strategy', iconOff: 'strategy' },
];

const positionLabel: Record<string, string> = { ATA: 'Atacante', MEI: 'Meia', ZAG: 'Zagueiro', LAT: 'Lateral', VOL: 'Volante', GOL: 'Goleiro' };

function eventStyle(kind: EventKind, c: AppTheme['colors']) {
  if (kind === 'match') return { bg: c.primary, fg: c.onPrimary, icon: 'soccer' };
  if (kind === 'physical') return { bg: c.tertiary, fg: c.onTertiary, icon: 'run' };
  return { bg: c.graphite, fg: c.onGraphite, icon: 'whistle' };
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
  const [tab, setTab] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  const p = demoByPeriod[period];
  const performance = Math.round(((p.wins * 3 + p.draws) / (p.played * 3)) * 100);
  const m = d.nextMatch;
  const navHeight = NAV_HEIGHT + insets.bottom;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <StatusBar style="dark" />

      {/* Top app bar: sobe para surfaceContainer ao rolar, como no MD3 */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: scrolled ? c.surfaceContainer : c.surface }}>
        <View style={styles.topBar}>
          <Avatar.Text
            size={40}
            label="EC"
            color={c.onPrimaryContainer}
            style={{ backgroundColor: c.primaryContainer }}
            labelStyle={{ fontFamily: fonts.medium }}
          />
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium">{demoTeam.name}</Text>
            <Text variant="bodySmall" style={{ color: c.onSurfaceVariant }}>
              {demoTeam.category} · Temporada {demoTeam.season}
            </Text>
          </View>
          <View>
            <IconButton icon="bell-outline" accessibilityLabel="Notificações, 3 novas" onPress={() => {}} />
            <Badge size={16} style={styles.badge}>
              3
            </Badge>
          </View>
          <Avatar.Text
            size={32}
            label={demoTeam.coach[0]}
            color={c.onSecondaryContainer}
            style={{ backgroundColor: c.secondaryContainer }}
            labelStyle={{ fontFamily: fonts.medium }}
            accessibilityLabel={`Conta de ${demoTeam.coach}`}
          />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: navHeight + 88 }]}
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
          <Text variant="headlineSmall" style={{ color: c.onPrimaryContainer, marginTop: 12 }}>
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
          <View style={styles.matchFooter}>
            <View>
              <Text variant="titleLarge" style={{ color: c.onPrimaryContainer }}>
                {m.confirmed}
              </Text>
              <Text variant="bodySmall" style={{ color: c.onPrimaryContainer }}>
                confirmados
              </Text>
            </View>
            <View>
              <Text variant="titleLarge" style={{ color: c.onPrimaryContainer }}>
                {m.pending}
              </Text>
              <Text variant="bodySmall" style={{ color: c.onPrimaryContainer }}>
                sem resposta
              </Text>
            </View>
            <Button mode="contained" buttonColor={c.onPrimaryContainer} textColor={c.primary} style={{ marginLeft: 'auto' }} onPress={() => {}}>
              Convocação
            </Button>
          </View>
        </Surface>

        <View style={styles.grid}>
          <View style={styles.row}>
            <KpiCard icon="account-check-outline" label="Disponíveis" value={`${d.squad.active}/${d.squad.total}`} support={`${d.squad.total - d.squad.active} fora de combate`} />
            <KpiCard
              icon="clipboard-check-outline"
              label="Frequência"
              value={`${p.attendancePct}%`}
              trend={`${p.attendanceDiff >= 0 ? '+' : '−'}${Math.abs(p.attendanceDiff)} p.p. vs. anterior`}
              trendUp={p.attendanceDiff >= 0}
            />
          </View>
          <View style={styles.row}>
            <KpiCard icon="trophy-outline" label="Aproveitamento" value={`${performance}%`} support={`${p.wins}V ${p.draws}E ${p.losses}D em ${p.played} ${p.played === 1 ? 'jogo' : 'jogos'}`} />
            <KpiCard icon="medical-bag" label="Lesionados" value={String(d.squad.injured)} support={`+ ${d.squad.suspended} suspensos`} tone="error" />
          </View>
        </View>

        <Section title="Agenda da semana" action="Ver agenda">
          <View style={styles.weekStrip}>
            {demoWeek.days.map((day) => (
              <View key={day.key} style={styles.weekDay} accessibilityLabel={`Dia ${day.day}${day.isToday ? ', hoje' : ''}${day.hasEvent ? ', com evento' : ''}`}>
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
                <View key={e.title} style={styles.eventRow}>
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
              <View style={styles.progressLabel}>
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
          <View style={styles.results}>
            {d.lastResults.map((r, i) => {
              const s = resultStyle(r.result, c);
              return (
                <View key={i} style={styles.result} accessibilityLabel={`${r.result === 'V' ? 'Vitória' : r.result === 'E' ? 'Empate' : 'Derrota'} ${r.score} contra ${r.opponent}`}>
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
                <View key={w.label} style={styles.barCol}>
                  <Text variant="labelMedium" style={{ color: current ? c.primary : c.onSurfaceVariant }}>
                    {w.value}%
                  </Text>
                  <View style={[styles.bar, { height: Math.max(w.value * 1.1, 4), backgroundColor: current ? c.primary : c.secondaryContainer }]} />
                  <Text variant="labelSmall" style={{ color: c.onSurfaceVariant }}>
                    {w.label}
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
                left={() => <Avatar.Icon size={40} icon={s.icon} color={s.fg} style={{ backgroundColor: s.bg, marginLeft: 16 }} />}
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
              left={() => (
                <Avatar.Text
                  size={40}
                  label={String(i + 1)}
                  color={i === 0 ? c.onPrimaryContainer : c.onSurfaceVariant}
                  style={{ backgroundColor: i === 0 ? c.primaryContainer : c.surfaceContainerHighest, marginLeft: 16 }}
                  labelStyle={{ fontFamily: fonts.medium }}
                />
              )}
              right={() => (
                <View style={styles.goals}>
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

      <FAB icon="plus" label="Novo evento" style={[styles.fab, { bottom: navHeight + 16 }]} onPress={() => {}} />

      {/* Navigation bar MD3 (visual; as outras abas ainda não existem) */}
      <View style={[styles.navBar, { height: navHeight, paddingBottom: insets.bottom, backgroundColor: c.surfaceContainer }]} accessibilityRole="tablist">
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <TouchableRipple
              key={t.key}
              style={styles.navItem}
              onPress={() => setTab(t.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t.label}
              borderless
            >
              <View style={{ alignItems: 'center', gap: 4 }}>
                <View style={[styles.navIndicator, active && { backgroundColor: c.secondaryContainer }]}>
                  <Icon source={active ? t.icon : t.iconOff} size={24} color={active ? c.onSecondaryContainer : c.onSurfaceVariant} />
                </View>
                <Text variant="labelMedium" style={{ color: active ? c.onSurface : c.onSurfaceVariant }}>
                  {t.label}
                </Text>
              </View>
            </TouchableRipple>
          );
        })}
      </View>
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
}: {
  icon: string;
  label: string;
  value: string;
  support?: string;
  trend?: string;
  trendUp?: boolean;
  tone?: 'default' | 'error';
}) {
  const { colors: c } = useAppTheme();
  const iconBg = tone === 'error' ? c.errorContainer : c.surfaceContainerHighest;
  const iconFg = tone === 'error' ? c.onErrorContainer : c.onSurfaceVariant;
  return (
    <Surface elevation={0} style={[styles.kpi, { backgroundColor: c.surfaceContainerLow }]}>
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
    <Surface elevation={0} style={[styles.section, flush && styles.sectionFlush, { backgroundColor: c.surfaceContainerLow }]}>
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
          <Button mode="text" compact onPress={() => {}}>
            {action}
          </Button>
        )}
      </View>
      {children}
    </Surface>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 16, paddingRight: 12, height: 64 },
  badge: { position: 'absolute', top: 6, right: 6 },
  content: { paddingHorizontal: 16, gap: 12 },
  headline: { paddingTop: 8, paddingBottom: 4, gap: 2 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  matchCard: { borderRadius: 28, padding: 20 },
  matchFooter: { flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 20 },
  grid: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  kpi: { flex: 1, minWidth: 0, borderRadius: 16, padding: 16 },
  kpiIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  section: { borderRadius: 16, padding: 16 },
  sectionFlush: { paddingHorizontal: 0, paddingBottom: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, minHeight: 40 },
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
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, height: 150 },
  barCol: { flex: 1, alignItems: 'center', gap: 6 },
  bar: { width: '100%', borderRadius: 12 },
  goals: { alignItems: 'center', justifyContent: 'center', paddingRight: 8 },
  fab: { position: 'absolute', right: 16 },
  navBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  navItem: { flex: 1, alignItems: 'center', paddingTop: 12 },
  navIndicator: { width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
