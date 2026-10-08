import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bars, Card, HBar, Kpi, T } from '@/components/ui';
import { demoDashboard as d, demoTeam, type AthleteStatus, type Result } from '@/data/demo';
import { colors, spacing } from '@/theme';

const resultColor: Record<Result, string> = { V: colors.graphite, E: colors.silver, D: colors.brand };
const alertColor: Record<AthleteStatus, string> = {
  injured: colors.brand,
  suspended: colors.graphite,
  active: colors.silver,
  loaned: colors.silver,
};
const alertLabel: Record<AthleteStatus, string> = {
  injured: 'Lesionado',
  suspended: 'Suspenso',
  active: 'Atenção',
  loaned: 'Emprestado',
};

export default function DashboardScreen() {
  const s = d.season;
  const points = s.wins * 3 + s.draws;
  const performance = Math.round((points / (s.played * 3)) * 100);
  const attendanceDiff = d.attendanceMonthPct - d.attendancePrevPct;
  const m = d.nextMatch;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.crest}>
            <T weight="bold" style={{ color: colors.white }}>
              EC
            </T>
          </View>
          <View style={{ flex: 1 }}>
            <T weight="bold" style={styles.teamName}>
              {demoTeam.name}
            </T>
            <T style={styles.teamMeta}>
              {demoTeam.category} · Temporada {demoTeam.season}
            </T>
          </View>
          <View style={styles.avatar}>
            <T weight="bold" style={{ color: colors.graphite, fontSize: 13 }}>
              {demoTeam.coach[0]}
            </T>
          </View>
        </View>
        <T weight="bold" style={styles.title}>
          Controle geral
        </T>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <Kpi label="Disponíveis" value={`${d.squad.active}/${d.squad.total}`} caption={`${d.squad.total - d.squad.active} fora de combate`} />
          <Kpi
            label="Frequência no mês"
            value={`${d.attendanceMonthPct}%`}
            caption={`${attendanceDiff >= 0 ? '▲' : '▼'} ${Math.abs(attendanceDiff)} p.p. vs. mês ant.`}
            tone={attendanceDiff >= 0 ? 'positive' : 'alert'}
          />
        </View>
        <View style={styles.row}>
          <Kpi label="Aproveitamento" value={`${performance}%`} caption={`${s.wins}V ${s.draws}E ${s.losses}D em ${s.played} jogos`} />
          <Kpi label="Lesionados" value={String(d.squad.injured)} caption={`+ ${d.squad.suspended} suspensos`} tone="alert" />
        </View>

        <View style={[styles.card, styles.matchCard]}>
          <View style={styles.matchTag}>
            <T weight="bold" style={{ color: colors.white, fontSize: 11, letterSpacing: 0.5 }}>
              PRÓXIMO JOGO
            </T>
          </View>
          <T style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 12 }}>{m.competition}</T>
          <T weight="bold" style={styles.matchTitle}>
            {m.isHome ? `${demoTeam.name} x ${m.opponent}` : `${m.opponent} x ${demoTeam.name}`}
          </T>
          <T style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>
            {m.date} · {m.time} · {m.location}
          </T>
          <View style={styles.matchFooter}>
            <View>
              <T weight="bold" style={{ color: colors.white, fontSize: 20 }}>
                {m.confirmed}
              </T>
              <T style={styles.matchFooterLabel}>confirmados</T>
            </View>
            <View>
              <T weight="bold" style={{ color: colors.white, fontSize: 20 }}>
                {m.pending}
              </T>
              <T style={styles.matchFooterLabel}>sem resposta</T>
            </View>
            <View>
              <T weight="bold" style={{ color: colors.white, fontSize: 20 }}>
                {m.isHome ? 'Casa' : 'Fora'}
              </T>
              <T style={styles.matchFooterLabel}>mando</T>
            </View>
          </View>
        </View>

        <Card title="Próximo treino">
          <T weight="bold" style={{ fontSize: 15 }}>
            {d.nextTraining.title}
          </T>
          <T style={{ color: colors.muted, fontSize: 13, marginTop: 4 }}>
            {d.nextTraining.date} · {d.nextTraining.time} · {d.nextTraining.duration} · {d.nextTraining.location}
          </T>
        </Card>

        <Card title="Últimos resultados" subtitle={`Gols: ${s.goalsFor} pró, ${s.goalsAgainst} contra`}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {d.lastResults.map((r, i) => (
              <View key={i} style={[styles.resultChip, { backgroundColor: resultColor[r.result] }]}>
                <T weight="bold" style={{ color: r.result === 'E' ? colors.graphite : colors.white, fontSize: 15 }}>
                  {r.result}
                </T>
                <T style={{ color: r.result === 'E' ? colors.graphite : 'rgba(255,255,255,0.8)', fontSize: 11 }}>{r.score}</T>
              </View>
            ))}
          </View>
        </Card>

        <Card title="Situação do elenco" subtitle={`${d.squad.total} atletas inscritos`}>
          <HBar label="Disponível" value={d.squad.active} total={d.squad.total} />
          <HBar label="Lesionado" value={d.squad.injured} total={d.squad.total} color={colors.brand} />
          <HBar label="Suspenso" value={d.squad.suspended} total={d.squad.total} color={colors.graphite2} />
          <HBar label="Emprestado" value={d.squad.loaned} total={d.squad.total} color="#9A9A9A" />
        </Card>

        <Card title="Frequência nos treinos" subtitle="Presença média por semana, %">
          <Bars data={d.attendanceByWeek} suffix="%" />
        </Card>

        <Card title="Alertas" subtitle="Departamento médico e disciplina">
          {d.alerts.map((a, i) => (
            <View key={a.name} style={[styles.listRow, i > 0 && styles.listDivider]}>
              <View style={{ flex: 1 }}>
                <T weight="medium" style={{ fontSize: 14 }}>
                  {a.name}
                </T>
                <T style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{a.detail}</T>
              </View>
              <View style={[styles.pill, { backgroundColor: alertColor[a.status] }]}>
                <T weight="medium" style={{ color: a.status === 'active' ? colors.graphite : colors.white, fontSize: 11 }}>
                  {alertLabel[a.status]}
                </T>
              </View>
            </View>
          ))}
        </Card>

        <Card title="Artilharia">
          {d.topScorers.map((p, i) => (
            <View key={p.name} style={[styles.listRow, i > 0 && styles.listDivider]}>
              <T weight="bold" style={{ width: 22, color: i === 0 ? colors.brand : colors.muted }}>
                {i + 1}
              </T>
              <T weight="medium" style={{ flex: 1, fontSize: 14 }}>
                {p.name} <T style={{ color: colors.muted, fontSize: 12 }}>{p.position}</T>
              </T>
              <T weight="bold" style={{ fontSize: 16 }}>
                {p.goals}
              </T>
            </View>
          ))}
        </Card>

        <T style={styles.demoNote}>Dados fictícios de demonstração</T>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.graphite, paddingHorizontal: spacing.margin, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12 },
  crest: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  teamName: { color: colors.white, fontSize: 16 },
  teamMeta: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 1 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.silver, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.white, fontSize: 30, letterSpacing: -1, marginTop: 20 },
  content: { padding: spacing.margin, gap: spacing.gutter, paddingBottom: 48 },
  row: { flexDirection: 'row', gap: spacing.gutter },
  card: { borderRadius: 18, padding: spacing.card },
  matchCard: { backgroundColor: colors.graphite },
  matchTag: { alignSelf: 'flex-start', backgroundColor: colors.brand, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  matchTitle: { color: colors.white, fontSize: 20, letterSpacing: -0.3, marginTop: 4 },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  matchFooterLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  resultChip: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', gap: 2 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  listDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  demoNote: { textAlign: 'center', color: colors.muted, fontSize: 11, marginTop: 8 },
});
