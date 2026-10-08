// Dashboard de controle geral no layout da referência "CreatiHR" (menu lateral, cards de KPI,
// rosca, medidor, tabelas e próximos eventos). Responsivo: menu lateral fixo em telas largas,
// gaveta no celular. Tema claro e escuro.
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, useState, type ComponentProps, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View, type TextProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { demoAthleteGoals, demoDashboard as d, demoPerformance, demoTeam, demoUpcoming, type Rating } from '@/data/demo';
import { fonts } from '@/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const light = {
  background: '#E6E6E6',
  sidebar: '#EFEFEF',
  card: '#F7F7F7',
  inner: '#FFFFFF',
  text: '#343434',
  muted: '#6E6E6E',
  border: '#D1D1D1',
  track: '#DCDCDC',
  active: '#343434',
  onActive: '#FFFFFF',
  chip: '#E6E6E6',
  brand: '#EB0D0D',
  brandText: '#C40C0C',
  positive: '#1F7A43',
  chart: ['#343434', '#EB0D0D', '#8C8C8C', '#C4C4C4'],
};

const dark: typeof light = {
  background: '#161616',
  sidebar: '#1D1D1D',
  card: '#242424',
  inner: '#2C2C2C',
  text: '#F2F2F2',
  muted: '#A6A6A6',
  border: '#3A3A3A',
  track: '#3A3A3A',
  active: '#F2F2F2',
  onActive: '#161616',
  chip: '#333333',
  brand: '#FF2D2D',
  brandText: '#FF6B6B',
  positive: '#5BC58A',
  chart: ['#E6E6E6', '#FF2D2D', '#8C8C8C', '#5A5A5A'],
};

type Palette = typeof light;
const PaletteContext = createContext<Palette>(light);
const usePalette = () => useContext(PaletteContext);

const SIDEBAR_W = 248;

// Hora de Brasília (sem horário de verão desde 2019).
function greeting() {
  const h = (new Date().getUTCHours() + 21) % 24;
  return h < 5 || h >= 18 ? 'Boa noite' : h < 12 ? 'Bom dia' : 'Boa tarde';
}

export default function DashboardPainelScreen() {
  const { width } = useWindowDimensions();
  const [isDark, setDark] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const p = isDark ? dark : light;
  const wide = width >= 1100;
  const medium = width >= 720;

  return (
    <PaletteContext.Provider value={p}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.root, { backgroundColor: p.background }]}>
        {wide && <Sidebar />}
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[styles.main, !medium && { padding: 16, gap: 12 }]}>
            <Header compact={!medium} isDark={isDark} onTheme={setDark} onMenu={wide ? undefined : () => setDrawer(true)} />
            <Grid columns={wide ? 4 : 2}>
              <Kpi icon="account-group-outline" title={'Atletas\ndisponíveis'} value={`${d.squad.active}/${d.squad.total}`} strong={`${d.squad.total - d.squad.active}`} note="fora de combate" />
              <Kpi
                icon="clipboard-check-outline"
                title={'Frequência\nnos treinos'}
                value={`${d.attendanceMonthPct}%`}
                strong={`▲ ${d.attendanceMonthPct - d.attendancePrevPct} p.p.`}
                strongColor={p.positive}
                note="vs. mês anterior"
              />
              <Kpi
                icon="trophy-outline"
                title={'Aproveitamento\nna temporada'}
                value={`${Math.round(((d.season.wins * 3 + d.season.draws) / (d.season.played * 3)) * 100)}%`}
                strong={`${d.season.wins}V ${d.season.draws}E ${d.season.losses}D`}
                note={`em ${d.season.played} jogos`}
              />
              <Kpi
                icon="soccer"
                title={'Gols\nmarcados'}
                value={String(d.season.goalsFor)}
                strong={(d.season.goalsFor / d.season.played).toFixed(1).replace('.', ',')}
                note={`por jogo · ${d.season.goalsAgainst} sofridos`}
              />
            </Grid>

            <Row wide={wide} medium={medium} flex={[1, 1, 2]}>
              <SquadDonut />
              <PointsGauge />
              <PerformanceTable compact={!medium} />
            </Row>

            <Row wide={wide} medium={medium} flex={[1.25, 1]}>
              <GoalsTable />
              <Upcoming />
            </Row>

            <Text style={[styles.demoNote, { color: p.muted }]}>Dados fictícios de demonstração</Text>
          </ScrollView>
        </SafeAreaView>

        {!wide && drawer && (
          <View style={StyleSheet.absoluteFill}>
            <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={() => setDrawer(false)} accessibilityLabel="Fechar menu" />
            <Sidebar onClose={() => setDrawer(false)} />
          </View>
        )}
      </View>
    </PaletteContext.Provider>
  );
}

/* ---------- Estrutura ---------- */

function Sidebar({ onClose }: { onClose?: () => void }) {
  const p = usePalette();
  const [open, setOpen] = useState<string | null>('squad');
  const groups: { key: string; label: string; icon: IconName; items?: string[] }[] = [
    { key: 'squad', label: 'Elenco', icon: 'account-group-outline', items: ['Gerenciar elenco', 'Presença', 'Avaliações'] },
    { key: 'agenda', label: 'Agenda', icon: 'calendar-month-outline', items: ['Calendário', 'Convocações'] },
    { key: 'training', label: 'Treinos', icon: 'whistle-outline', items: ['Sessões', 'Biblioteca de exercícios'] },
    { key: 'tactics', label: 'Táticas', icon: 'strategy', items: ['Prancheta', 'Formações'] },
    { key: 'games', label: 'Jogos', icon: 'soccer', items: ['Plano de jogo', 'Súmulas'] },
    { key: 'stats', label: 'Desempenho', icon: 'chart-line', items: ['Equipe', 'Atletas'] },
  ];

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.sidebar, { backgroundColor: p.sidebar, borderRightColor: p.border }]}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 4, flexGrow: 1 }}>
        <View style={[styles.inline, { marginBottom: 24, gap: 10 }]}>
          <View style={[styles.logo, { backgroundColor: p.brand }]}>
            <MaterialCommunityIcons name="soccer" size={20} color="#FFFFFF" />
          </View>
          <T weight="bold" size={20} style={{ flex: 1 }}>
            ProFut HUB
          </T>
          {onClose && (
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Fechar menu">
              <MaterialCommunityIcons name="close" size={22} color={p.text} />
            </Pressable>
          )}
        </View>

        <Pressable style={[styles.navActive, { backgroundColor: p.active }]} accessibilityRole="button" aria-current="page">
          <T weight="medium" size={15} color={p.onActive}>
            Dashboard
          </T>
          <MaterialCommunityIcons name="view-grid-outline" size={18} color={p.onActive} />
        </Pressable>

        <View style={{ marginTop: 12, gap: 2 }}>
          {groups.map((g) => {
            const expanded = open === g.key;
            return (
              <View key={g.key}>
                <Pressable
                  style={styles.navItem}
                  onPress={() => setOpen(expanded ? null : g.key)}
                  accessibilityRole="button"
                  aria-expanded={expanded}
                >
                  <MaterialCommunityIcons name={g.icon} size={18} color={p.text} />
                  <T weight="medium" size={14} style={{ flex: 1 }}>
                    {g.label}
                  </T>
                  <MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={p.muted} />
                </Pressable>
                {expanded && (
                  <View style={[styles.subnav, { borderLeftColor: p.border }]}>
                    {g.items?.map((item) => (
                      <Pressable key={item} style={styles.subItem} accessibilityRole="button">
                        <T size={13} color={p.muted}>
                          {item}
                        </T>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Card de assinatura no lugar do "Need AI Help?" da referência */}
        <View style={[styles.promo, { backgroundColor: p.card, borderColor: p.border }]}>
          <View style={[styles.promoArt, { backgroundColor: p.active }]}>
            <MaterialCommunityIcons name="crown-outline" size={34} color={p.onActive} />
          </View>
          <T weight="bold" size={16} style={{ marginTop: 12 }}>
            Teste grátis: 9 dias
          </T>
          <T size={12} color={p.muted} style={{ marginTop: 4, lineHeight: 17 }}>
            Assine o plano Pro e tenha até 3 equipes, comissão ilimitada e relatórios em PDF.
          </T>
          <Pressable style={[styles.promoButton, { backgroundColor: p.brand }]} accessibilityRole="button">
            <T weight="medium" size={13} color="#FFFFFF">
              Assinar o Pro
            </T>
          </Pressable>
        </View>

        <Pressable style={[styles.userCard, { backgroundColor: p.card, borderColor: p.border }]} accessibilityRole="button">
          <View style={[styles.avatar, { backgroundColor: p.active }]}>
            <T weight="bold" size={14} color={p.onActive}>
              {demoTeam.coach[0]}
            </T>
          </View>
          <View style={{ flex: 1 }}>
            <T weight="bold" size={14}>
              {demoTeam.coach}
            </T>
            <T size={11} color={p.muted}>
              Treinador principal
            </T>
          </View>
          <MaterialCommunityIcons name="chevron-down" size={18} color={p.muted} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ compact, isDark, onTheme, onMenu }: { compact: boolean; isDark: boolean; onTheme: (v: boolean) => void; onMenu?: () => void }) {
  const p = usePalette();
  const search = (
    <View style={[styles.search, { backgroundColor: p.card, borderColor: p.border }, compact && { width: '100%' }]}>
      <MaterialCommunityIcons name="magnify" size={18} color={p.muted} />
      <TextInput placeholder="Buscar atleta, treino ou jogo" placeholderTextColor={p.muted} style={[styles.searchInput, { color: p.text }]} />
    </View>
  );
  const toggle = (
    <View style={[styles.themeToggle, { backgroundColor: p.card, borderColor: p.border }]} role="radiogroup">
      {[
        { dark: false, label: 'Claro', icon: 'white-balance-sunny' as IconName },
        { dark: true, label: 'Escuro', icon: 'weather-night' as IconName },
      ].map((o) => {
        const active = o.dark === isDark;
        return (
          <Pressable
            key={o.label}
            style={[styles.themeOption, active && { backgroundColor: p.active }]}
            onPress={() => onTheme(o.dark)}
            role="radio"
            aria-checked={active}
          >
            <MaterialCommunityIcons name={o.icon} size={16} color={active ? p.onActive : p.text} />
            {!compact && (
              <T size={13} color={active ? p.onActive : p.text}>
                {o.label}
              </T>
            )}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.header}>
        {onMenu && (
          <Pressable onPress={onMenu} hitSlop={8} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Abrir menu">
            <MaterialCommunityIcons name="menu" size={24} color={p.text} />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <T weight="bold" size={compact ? 18 : 20} accessibilityRole="header">
            Olá, {demoTeam.coach}
          </T>
          <T size={13} color={p.muted}>
            {greeting()} · {demoTeam.name}
          </T>
        </View>
        {!compact && search}
        <Pressable style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Notificações, 3 novas">
          <MaterialCommunityIcons name="bell-outline" size={22} color={p.text} />
          <View style={[styles.badgeDot, { backgroundColor: p.brand, borderColor: p.background }]} />
        </Pressable>
        {toggle}
      </View>
      {compact && search}
    </View>
  );
}

function Grid({ columns, children }: { columns: number; children: ReactNode[] }) {
  const rows: ReactNode[][] = [];
  children.forEach((child, i) => {
    if (i % columns === 0) rows.push([]);
    rows[rows.length - 1].push(child);
  });
  return (
    <View style={{ gap: 16 }}>
      {rows.map((row, r) => (
        <View key={r} style={styles.gridRow}>
          {row.map((child, i) => (
            <View key={i} style={{ flex: 1, minWidth: 0 }}>
              {child}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// Linha de cards: lado a lado na tela larga, empilhados no celular.
function Row({ wide, medium, flex, children }: { wide: boolean; medium: boolean; flex: number[]; children: ReactNode[] }) {
  if (wide) {
    return (
      <View style={styles.gridRow}>
        {children.map((child, i) => (
          <View key={i} style={{ flex: flex[i], minWidth: 0 }}>
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
        <View style={styles.gridRow}>
          <View style={{ flex: 1 }}>{children[0]}</View>
          <View style={{ flex: 1 }}>{children[1]}</View>
        </View>
        {children[2]}
      </View>
    );
  }
  return <View style={{ gap: medium ? 16 : 12 }}>{children}</View>;
}

/* ---------- Cards ---------- */

function Card({ title, filter, children, style }: { title: string; filter?: string; children: ReactNode; style?: ViewStyle }) {
  const p = usePalette();
  return (
    <View style={[styles.card, { backgroundColor: p.card }, style]}>
      <View style={styles.cardHeader}>
        <T weight="bold" size={17} style={{ flex: 1 }} accessibilityRole="header">
          {title}
        </T>
        {filter && <Select label={filter} />}
        <Pressable style={[styles.kebab, { borderColor: p.border }]} accessibilityRole="button" accessibilityLabel={`Mais opções de ${title}`}>
          <MaterialCommunityIcons name="dots-vertical" size={16} color={p.muted} />
        </Pressable>
      </View>
      {children}
    </View>
  );
}

function Select({ label }: { label: string }) {
  const p = usePalette();
  return (
    <Pressable style={[styles.select, { borderColor: p.border, backgroundColor: p.inner }]} accessibilityRole="button" accessibilityLabel={`Filtro: ${label}`}>
      <T size={11} color={p.muted}>
        {label}
      </T>
      <MaterialCommunityIcons name="chevron-down" size={14} color={p.muted} />
    </Pressable>
  );
}

function Kpi({ icon, title, value, strong, strongColor, note }: { icon: IconName; title: string; value: string; strong: string; strongColor?: string; note: string }) {
  const p = usePalette();
  return (
    <View style={[styles.card, styles.kpi, { backgroundColor: p.card }]} accessible accessibilityLabel={`${title.replace('\n', ' ')}: ${value}. ${strong} ${note}`}>
      <View style={styles.inline}>
        <View style={[styles.kpiIcon, { backgroundColor: p.active }]}>
          <MaterialCommunityIcons name={icon} size={20} color={p.onActive} />
        </View>
        <T weight="medium" size={14} style={{ flex: 1, lineHeight: 18 }}>
          {title}
        </T>
      </View>
      <T weight="bold" size={30} style={{ marginTop: 18, letterSpacing: -0.5 }}>
        {value}
      </T>
      <T size={11} color={p.muted} style={{ marginTop: 6 }}>
        <T weight="bold" size={11} color={strongColor ?? p.text}>
          {strong}
        </T>{' '}
        {note}
      </T>
    </View>
  );
}

function SquadDonut() {
  const p = usePalette();
  const segments = [
    { label: 'Disponíveis', value: d.squad.active },
    { label: 'Lesionados', value: d.squad.injured },
    { label: 'Suspensos', value: d.squad.suspended },
    { label: 'Emprestado', value: d.squad.loaned },
  ];
  const size = 150;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const gap = 3;
  const slices = segments.map((s, i) => {
    const start = segments.slice(0, i).reduce((sum, x) => sum + x.value, 0) / d.squad.total;
    return { ...s, color: p.chart[i], start, frac: s.value / d.squad.total };
  });
  const pct = Math.round((d.squad.active / d.squad.total) * 100);

  return (
    <Card title="Elenco" filter="Hoje">
      <View style={{ alignItems: 'center', marginTop: 8 }} accessible accessibilityLabel={segments.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(', ')}>
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
            {slices.map((s) => (
              <Circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${Math.max(s.frac * circ - gap, 1)} ${circ}`}
                strokeDashoffset={-s.start * circ}
              />
            ))}
          </Svg>
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <T weight="bold" size={26}>
              {pct}%
            </T>
            <T size={11} color={p.muted}>
              disponíveis
            </T>
          </View>
        </View>
      </View>
      <View style={styles.legend} aria-hidden>
        {slices.map((s) => (
          <View key={s.label} style={[styles.legendChip, { backgroundColor: p.inner }]}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <T size={11}>
              <T weight="bold" size={11}>
                {s.value}
              </T>{' '}
              {s.label}
            </T>
          </View>
        ))}
      </View>
      <T size={11} color={p.muted} style={{ textAlign: 'center', marginTop: 10, lineHeight: 16 }}>
        {d.squad.total - d.squad.active} atletas fora de combate.{'\n'}Rafael Lima volta em 20/10.
      </T>
    </Card>
  );
}

function PointsGauge() {
  const p = usePalette();
  const s = d.season;
  const points = s.wins * 3 + s.draws;
  const max = s.played * 3;
  const pct = Math.round((points / max) * 100);
  const w = 180;
  const stroke = 22;
  const r = (w - stroke) / 2;
  const cx = w / 2;
  const cy = r + stroke / 2;
  const arcLen = Math.PI * r;
  const semi = `M ${stroke / 2} ${cy} A ${r} ${r} 0 0 1 ${w - stroke / 2} ${cy}`;
  const legend = [
    { label: 'vitórias', value: s.wins, color: p.chart[0], pts: s.wins * 3 },
    { label: 'empates', value: s.draws, color: p.chart[2], pts: s.draws },
    { label: 'derrotas', value: s.losses, color: p.brand, pts: 0 },
  ];

  return (
    <Card title="Pontos ganhos">
      <View style={{ alignItems: 'center', marginTop: 12 }} accessible accessibilityLabel={`${points} de ${max} pontos possíveis, ${pct}% de aproveitamento`}>
        <Svg width={w} height={cy + 4}>
          <Path d={semi} stroke={p.track} strokeWidth={stroke} fill="none" strokeLinecap="round" />
          <Path d={semi} stroke={p.chart[0]} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${(pct / 100) * arcLen} ${arcLen}`} />
        </Svg>
        <View style={[styles.gaugeLabel, { top: cy - 34 }]}>
          <T weight="bold" size={28}>
            {pct}%
          </T>
        </View>
        <T size={11} color={p.muted} style={{ marginTop: 4 }}>
          {points} de {max} pontos possíveis
        </T>
      </View>
      <View style={{ gap: 8, marginTop: 14 }}>
        {legend.map((l) => (
          <View key={l.label} style={styles.inline}>
            <View style={[styles.dot, { backgroundColor: l.color }]} />
            <T weight="bold" size={12} style={{ width: 22 }}>
              {l.value}
            </T>
            <T size={12} color={p.muted} style={{ flex: 1 }}>
              {l.label}
            </T>
            <T size={12} color={p.muted}>
              {l.pts} pts
            </T>
          </View>
        ))}
      </View>
    </Card>
  );
}

const ratingLabel: Record<Rating, string> = { great: 'Ótimo', good: 'Bom', fair: 'Regular', attention: 'Atenção' };

function RatingPill({ rating }: { rating: Rating }) {
  const p = usePalette();
  const style: Record<Rating, { bg: string; fg: string; border: string }> = {
    great: { bg: p.active, fg: p.onActive, border: p.active },
    good: { bg: p.chip, fg: p.text, border: p.chip },
    fair: { bg: 'transparent', fg: p.text, border: p.border },
    attention: { bg: 'transparent', fg: p.brandText, border: p.brand },
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

function PerformanceTable({ compact }: { compact: boolean }) {
  const p = usePalette();
  return (
    <Card title="Desempenho dos atletas" filter="Últimos 5 jogos">
      <View style={[styles.tableHead, { borderBottomColor: p.border }]}>
        <T size={11} weight="medium" color={p.muted} style={{ flex: 2 }}>
          Atleta
        </T>
        {!compact && (
          <T size={11} weight="medium" color={p.muted} style={{ flex: 1 }}>
            Posição
          </T>
        )}
        <T size={11} weight="medium" color={p.muted} style={{ width: 76, textAlign: 'center' }}>
          Desempenho
        </T>
      </View>
      {demoPerformance.map((a) => (
        <View key={a.name} style={styles.tableRow} accessible accessibilityLabel={`${a.name}, ${a.position}, ${a.detail}, desempenho ${ratingLabel[a.rating]}`}>
          <View style={[styles.inline, { flex: 2, gap: 10 }]}>
            <View style={[styles.avatar, { backgroundColor: p.chip }]}>
              <T weight="bold" size={12}>
                {a.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </T>
            </View>
            <View style={{ flex: 1 }}>
              <T weight="medium" size={14} numberOfLines={1}>
                {a.name}
              </T>
              <T size={11} color={p.muted} numberOfLines={1}>
                {compact ? `${a.position} · ${a.detail}` : a.detail}
              </T>
            </View>
          </View>
          {!compact && (
            <T size={12} color={p.muted} style={{ flex: 1 }}>
              {a.position}
            </T>
          )}
          <View style={{ width: 76, alignItems: 'center' }}>
            <RatingPill rating={a.rating} />
          </View>
        </View>
      ))}
    </Card>
  );
}

function GoalsTable() {
  const p = usePalette();
  const g = demoAthleteGoals;
  return (
    <Card title="Metas individuais">
      <View style={[styles.inline, { marginTop: -4, marginBottom: 8 }]}>
        <Select label={g.athlete} />
        <Select label={g.month} />
      </View>
      <View style={[styles.tableHead, { borderBottomColor: p.border }]}>
        {['Fundamento', 'Meta', 'Atingido', 'Resultado'].map((h, i) => (
          <T key={h} size={11} weight="medium" color={p.muted} style={i === 0 ? { flex: 1.6 } : styles.numCol}>
            {h}
          </T>
        ))}
      </View>
      {g.rows.map((r) => {
        const color = r.pct >= 100 ? p.positive : r.pct < 80 ? p.brandText : p.text;
        return (
          <View key={r.label} style={styles.tableRowSlim} accessible accessibilityLabel={`${r.label}: meta ${r.target}, atingido ${r.achieved}, ${r.pct}% da meta`}>
            <T size={12} style={{ flex: 1.6 }} numberOfLines={1}>
              {r.label}
            </T>
            <T size={12} color={p.muted} style={styles.numCol}>
              {r.target}
            </T>
            <T size={12} color={p.muted} style={styles.numCol}>
              {r.achieved}
            </T>
            <T size={12} weight="bold" color={color} style={styles.numCol}>
              {r.pct}%
            </T>
          </View>
        );
      })}
    </Card>
  );
}

function Upcoming() {
  const p = usePalette();
  return (
    <Card title="Próximos eventos" filter="Esta semana">
      <View style={{ gap: 12 }}>
        {demoUpcoming.map((e) => (
          <View key={e.title} style={[styles.eventCard, { backgroundColor: p.inner, borderColor: p.border }]}>
            <View style={styles.inline}>
              <T size={11} color={p.muted} style={{ flex: 1 }}>
                {e.subtitle}
              </T>
              <MaterialCommunityIcons name="dots-horizontal" size={18} color={p.muted} />
            </View>
            <View style={[styles.inline, { marginTop: 4 }]}>
              {e.kind === 'match' && <View style={[styles.matchMark, { backgroundColor: p.brand }]} />}
              <T weight="bold" size={15} style={{ flex: 1 }}>
                {e.title}
              </T>
            </View>
            <View style={[styles.inline, { marginTop: 12, flexWrap: 'wrap', rowGap: 8 }]}>
              {e.stats.map((s) => (
                <View key={s.icon} style={[styles.inline, { gap: 4, marginRight: 8 }]}>
                  <MaterialCommunityIcons name={s.icon as IconName} size={15} color={p.muted} />
                  <T size={12} color={p.muted}>
                    {s.value}
                  </T>
                </View>
              ))}
              <View style={[styles.timePill, { backgroundColor: p.chip }]}>
                <MaterialCommunityIcons name="clock-outline" size={13} color={p.text} />
                <T size={11}>{e.when}</T>
              </View>
              <View style={[styles.avatarStack, { marginLeft: 'auto' }]} aria-hidden>
                {e.people.map((initials, i) => (
                  <View key={initials} style={[styles.stackAvatar, { backgroundColor: p.chart[2 + (i % 2)], borderColor: p.inner, marginLeft: i ? -8 : 0 }]} />
                ))}
                <View style={[styles.stackAvatar, { backgroundColor: p.active, borderColor: p.inner, marginLeft: -8 }]}>
                  <T weight="bold" size={9} color={p.onActive}>
                    +{e.more}
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

/* ---------- Base ---------- */

function T({
  weight = 'regular',
  size = 14,
  color,
  style,
  ...props
}: TextProps & { weight?: 'regular' | 'medium' | 'bold'; size?: number; color?: string }) {
  const p = usePalette();
  return <Text style={[{ fontFamily: fonts[weight], fontSize: size, color: color ?? p.text }, style]} {...props} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  main: { padding: 24, gap: 16 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  center: { alignItems: 'center', justifyContent: 'center' },
  gridRow: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  demoNote: { textAlign: 'center', fontFamily: fonts.regular, fontSize: 11, marginTop: 4, marginBottom: 12 },
  backdrop: { backgroundColor: 'rgba(0,0,0,0.35)' },

  sidebar: { width: SIDEBAR_W, height: '100%', borderRightWidth: StyleSheet.hairlineWidth },
  logo: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  navActive: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 10, paddingHorizontal: 16, minHeight: 44 },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40, paddingHorizontal: 4 },
  subnav: { marginLeft: 12, paddingLeft: 14, borderLeftWidth: 1, marginBottom: 4 },
  subItem: { minHeight: 32, justifyContent: 'center' },
  promo: { marginTop: 'auto', borderRadius: 16, padding: 14, borderWidth: StyleSheet.hairlineWidth },
  promoArt: { height: 84, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  promoButton: { marginTop: 12, borderRadius: 8, minHeight: 36, alignItems: 'center', justifyContent: 'center' },
  userCard: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 10, borderWidth: StyleSheet.hairlineWidth },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  badgeDot: { position: 'absolute', top: 8, right: 9, width: 9, height: 9, borderRadius: 5, borderWidth: 2 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, height: 40, width: 280 },
  // outlineStyle 'none' tira o contorno de foco do navegador; o RN só tipa solid/dotted/dashed
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 13, ...({ outlineStyle: 'none' } as object) },
  themeToggle: { flexDirection: 'row', borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, padding: 3 },
  themeOption: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, paddingHorizontal: 10, height: 34 },

  card: { borderRadius: 18, padding: 18, flexGrow: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  kebab: { width: 28, height: 28, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  select: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 10, height: 28 },

  kpi: { flex: 1, padding: 16 },
  kpiIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 6 },

  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 14 },
  legendChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  gaugeLabel: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },

  tableHead: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 4 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  tableRowSlim: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  numCol: { flex: 1, textAlign: 'right' },
  pill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },

  eventCard: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 14 },
  matchMark: { width: 4, height: 16, borderRadius: 2 },
  timePill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  avatarStack: { flexDirection: 'row' },
  stackAvatar: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
