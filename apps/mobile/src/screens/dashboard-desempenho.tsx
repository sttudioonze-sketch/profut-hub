// Teste: página Desempenho no layout da referência "Vocalyn" (branco, minimalista, gráfico de
// área grande e três cards). Menu lateral fixo em telas largas, gaveta no celular.
// Variante "glass": fundo com manchas de luz e painéis de vidro fosco (Liquid Glass no iOS 26).
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, useState, type ComponentProps, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import Svg, { Circle, Defs, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { demoDashboard as d, demoTeam } from '@/data/demo';
import { fonts } from '@/theme';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const c = {
  page: '#FFFFFF',
  sidebar: '#FAFAFA',
  card: '#FFFFFF',
  border: '#EBEBEB',
  text: '#141414',
  muted: '#6E6E6E',
  faint: '#8C8C8C',
  hover: '#F0F0F0',
  ink: '#141414',
  gray1: '#6B6B6B',
  gray2: '#A8A8A8',
  gray3: '#D4D4D4',
  track: '#EDEDED',
  brand: '#EB0D0D',
};

// Vidro fosco: branco translúcido + desfoque do que está atrás (na web via backdrop-filter;
// no iPhone com iOS 26 os painéis viram Liquid Glass nativo).
const GlassContext = createContext(false);
const useGlass = () => useContext(GlassContext);
const liquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();
const web = Platform.OS === 'web';
const blur = (px: number) => (web ? { backdropFilter: `blur(${px}px) saturate(170%)` } : {}) as unknown as ViewStyle;
// Brilho na borda de cima, como a luz batendo no vidro (só web; no iOS o Liquid Glass já faz isso).
const rim = (web ? { boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 10px 30px rgba(20,20,24,0.06)' } : {}) as unknown as ViewStyle;
const glass: Record<'panel' | 'drawer' | 'card' | 'control' | 'tooltip', ViewStyle> = {
  panel: { backgroundColor: 'rgba(255,255,255,0.55)', borderColor: 'rgba(255,255,255,0.9)', ...blur(30) },
  // Gaveta sobre o conteúdo no celular: quase opaca. Na web o desfoque não alcança o conteúdo
  // atrás dela (cada View do react-native-web isola o empilhamento), então o texto competiria.
  drawer: { backgroundColor: 'rgba(250,250,252,0.94)', borderColor: 'rgba(255,255,255,0.9)', ...blur(36) },
  card: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    // Na web a sombra vem junto com o brilho da borda (rim); no app, sombra nativa
    ...(web ? rim : { shadowColor: '#141418', shadowOpacity: 0.1, shadowRadius: 32, shadowOffset: { width: 0, height: 12 } }),
    ...blur(26),
  },
  control: { backgroundColor: 'rgba(255,255,255,0.7)', borderColor: 'rgba(225,225,230,0.9)', ...blur(14) },
  tooltip: { backgroundColor: 'rgba(255,255,255,0.62)', borderColor: 'rgba(255,255,255,0.95)', ...blur(18) },
};

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
  return <DesempenhoScreen glass={false} />;
}

export function DashboardDesempenhoGlassScreen() {
  return <DesempenhoScreen glass />;
}

function DesempenhoScreen({ glass: isGlass }: { glass: boolean }) {
  const { width } = useWindowDimensions();
  const wide = width >= 1100;
  const medium = width >= 720;
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState('Resumo');
  const [view, setView] = useState('Visão geral');

  return (
    <GlassContext.Provider value={isGlass}>
      <View style={[styles.root, isGlass && { backgroundColor: '#F4F4F6' }]}>
        <StatusBar style="dark" />
        {isGlass && <GlassBackdrop />}
        {wide && <Sidebar />}
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          <TopBar compact={!medium} onMenu={wide ? undefined : () => setDrawer(true)} />
          <ScrollView contentContainerStyle={[styles.main, !medium && { padding: 16 }]}>
            <View style={styles.spread}>
              <Button icon="calendar-blank-outline" label="Últimos 30 dias" chevron />
              <View style={[styles.segmented, isGlass && glass.control, isGlass && { borderWidth: 1 }]}>
                {['Visão geral', 'Tabelas'].map((v) => (
                  <Pressable key={v} onPress={() => setView(v)} style={[styles.segment, v === view && styles.segmentOn]} role="tab" aria-selected={v === view}>
                    <T size={12} weight={v === view ? 'medium' : 'regular'} color={v === view ? c.text : c.muted}>
                      {v}
                    </T>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={[styles.tabsRow, { borderBottomColor: c.border }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }} role="tablist">
                {['Resumo', 'Tendência semanal', 'Por treino'].map((t) => (
                  <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, t === tab && styles.tabOn]} role="tab" aria-selected={t === tab}>
                    <T size={13} weight={t === tab ? 'medium' : 'regular'} color={t === tab ? c.text : c.muted}>
                      {t}
                    </T>
                  </Pressable>
                ))}
              </ScrollView>
              {medium && (
                <View style={[styles.inline, { gap: 8, paddingBottom: 8 }]}>
                  <Button icon="tune-variant" label="Filtrar" />
                  <Button icon="plus" label="Adicionar visão" />
                </View>
              )}
            </View>

            <LoadChart compact={!medium} />

            <View style={medium ? styles.cardsRow : { gap: 16 }}>
              <DonutCard
                stretch={medium}
                title="Resultados"
                subtitle={`${d.season.played} jogos · temporada ${demoTeam.season}`}
                totalLabel={`${d.season.played} jogos`}
                items={results}
                colors={[c.ink, c.gray2, c.gray3]}
                callout={`${d.season.wins} vitórias`}
              />
              <BarsCard stretch={medium} />
              <DonutCard
                stretch={medium}
                title="Ausências nos treinos"
                subtitle="24 faltas · 22 treinos"
                totalLabel="24 faltas"
                items={absences}
                colors={[c.ink, c.gray1, c.gray3]}
                callout="Lesão · 14"
              />
            </View>

            <T size={11} color={c.muted} style={{ textAlign: 'center', marginTop: 4 }}>
              Dados fictícios de demonstração · Teste referência Vocalyn
            </T>
          </ScrollView>
        </SafeAreaView>

        {!wide && drawer && (
          <View style={StyleSheet.absoluteFill}>
            <Pressable
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isGlass ? 'rgba(20,20,24,0.12)' : 'rgba(0,0,0,0.3)',
                },
              ]}
              onPress={() => setDrawer(false)}
              accessibilityLabel="Fechar menu"
            />
            <Sidebar onClose={() => setDrawer(false)} />
          </View>
        )}
      </View>
    </GlassContext.Provider>
  );
}

// Fundo da variante glass: quase branco, com névoa prata bem leve só para o vidro ter o que
// desfocar. Sem vermelho e sem tons escuros (Luis quer algo clean).
const blobs = [
  { id: 'b1', color: '#FFFFFF', opacity: 1, x: 0.1, y: 0.05, r: 0.55 },
  { id: 'b2', color: '#C9CAD3', opacity: 0.55, x: 0.92, y: 0.1, r: 0.4 },
  { id: 'b3', color: '#D3D4DC', opacity: 0.5, x: 0.85, y: 0.95, r: 0.45 },
  { id: 'b4', color: '#D8D8DE', opacity: 0.55, x: 0.18, y: 0.8, r: 0.42 },
  { id: 'b5', color: '#FFFFFF', opacity: 0.9, x: 0.55, y: 0.45, r: 0.32 },
];

function GlassBackdrop() {
  const { width, height } = useWindowDimensions();
  const size = Math.max(width, height);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="bgBase" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FAFAFB" />
            <Stop offset="1" stopColor="#ECECF0" />
          </LinearGradient>
          {blobs.map((b) => (
            <RadialGradient key={b.id} id={b.id} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={b.color} stopOpacity={b.opacity} />
              <Stop offset="1" stopColor={b.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#bgBase)" />
        {blobs.map((b) => (
          <Circle key={b.id} cx={b.x * width} cy={b.y * height} r={b.r * size} fill={`url(#${b.id})`} />
        ))}
      </Svg>
    </View>
  );
}

// Painel: vidro na variante glass (Liquid Glass nativo no iOS 26), sólido na normal.
function Pane({
  kind,
  style,
  children,
  ...props
}: ComponentProps<typeof View> & {
  kind: 'panel' | 'drawer' | 'card';
  style?: StyleProp<ViewStyle>;
}) {
  const isGlass = useGlass();
  if (isGlass && liquidGlass) {
    return (
      <GlassView glassEffectStyle="regular" style={[style, { backgroundColor: 'transparent' }]} {...props}>
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[style, isGlass && glass[kind]]} {...props}>
      {children}
    </View>
  );
}

/* ---------- Estrutura ---------- */

function Sidebar({ onClose }: { onClose?: () => void }) {
  const isGlass = useGlass();
  const sections: {
    title?: string;
    items: { label: string; icon: IconName; active?: boolean }[];
  }[] = [
    { items: [{ label: 'Dashboard', icon: 'view-grid-outline' }] },
    {
      title: 'Equipe',
      items: [
        { label: 'Elenco', icon: 'account-group-outline' },
        { label: 'Agenda', icon: 'calendar-month-outline' },
      ],
    },
    {
      title: 'Treinamento',
      items: [
        { label: 'Treinos', icon: 'whistle-outline' },
        { label: 'Táticas', icon: 'strategy' },
      ],
    },
    {
      title: 'Análise',
      items: [
        { label: 'Desempenho', icon: 'chart-line', active: true },
        { label: 'Jogos e súmulas', icon: 'soccer' },
      ],
    },
  ];
  const usedPct = Math.round((d.squad.total / 40) * 100);

  return (
    <Pane kind={onClose ? 'drawer' : 'panel'} style={styles.sidebar}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
          <View style={[styles.spread, { marginBottom: 20 }]}>
            <View style={styles.inline}>
              <View style={styles.logo}>
                <MaterialCommunityIcons name="soccer" size={16} color="#FFFFFF" />
              </View>
              <T weight="bold" size={15}>
                ProFut HUB
              </T>
            </View>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel={onClose ? 'Fechar menu' : 'Recolher menu'}>
              <MaterialCommunityIcons name={onClose ? 'close' : 'dock-left'} size={18} color={c.muted} />
            </Pressable>
          </View>

          <Pressable
            style={[styles.teamPicker, { borderColor: c.border }, isGlass && glass.control]}
            accessibilityRole="button"
            accessibilityLabel={`Equipe ${demoTeam.name}, trocar`}
          >
            <View style={styles.teamCrest}>
              <T weight="bold" size={9} color="#FFFFFF">
                EC
              </T>
            </View>
            <T weight="medium" size={13} style={{ flex: 1 }}>
              {demoTeam.name}
            </T>
            <MaterialCommunityIcons name="unfold-more-horizontal" size={16} color={c.muted} />
          </Pressable>

          {sections.map((s, i) => (
            <View key={i} style={{ marginTop: s.title ? 16 : 0 }}>
              {s.title && (
                <T weight="medium" size={10} color={c.muted} style={styles.sectionTitle}>
                  {s.title.toUpperCase()}
                </T>
              )}
              {s.items.map((it) => (
                <Pressable
                  key={it.label}
                  style={[
                    styles.navItem,
                    it.active && {
                      backgroundColor: isGlass ? 'rgba(255,255,255,0.7)' : c.hover,
                    },
                  ]}
                  accessibilityRole="button"
                  aria-current={it.active ? 'page' : undefined}
                >
                  <MaterialCommunityIcons name={it.icon} size={17} color={it.active ? c.text : c.muted} />
                  <T size={13} weight={it.active ? 'medium' : 'regular'} color={it.active ? c.text : '#3A3A3A'}>
                    {it.label}
                  </T>
                </Pressable>
              ))}
            </View>
          ))}

          <View style={{ marginTop: 'auto', paddingTop: 24 }}>
            {[
              { label: 'Ajustes', icon: 'cog-outline' as IconName },
              {
                label: 'Ajuda e suporte',
                icon: 'help-circle-outline' as IconName,
              },
            ].map((it) => (
              <Pressable key={it.label} style={styles.navItem} accessibilityRole="button">
                <MaterialCommunityIcons name={it.icon} size={17} color={c.muted} />
                <T size={13} color="#3A3A3A">
                  {it.label}
                </T>
              </Pressable>
            ))}
            {/* Uso do plano no lugar dos "Minutes" da referência: limite de 40 atletas do plano Treinador */}
            <View
              style={[styles.usage, { borderColor: c.border }, isGlass && glass.control]}
              accessible
              accessibilityLabel={`${d.squad.total} de 40 atletas do plano usados`}
            >
              <View style={styles.spread}>
                <View style={styles.inline}>
                  <MaterialCommunityIcons name="account-multiple-outline" size={15} color={c.text} />
                  <T size={12} weight="medium">
                    Atletas no plano
                  </T>
                </View>
                <T size={12} weight="bold">
                  {usedPct}%
                </T>
              </View>
              <View style={styles.usageTrack}>
                <View style={[styles.usageFill, { width: `${usedPct}%` }]} />
              </View>
              <View style={styles.spread}>
                <T size={10} color={c.muted}>
                  {d.squad.total}
                </T>
                <T size={10} color={c.muted}>
                  40
                </T>
              </View>
              <Pressable style={[styles.upgrade, { borderColor: c.border }, isGlass && glass.control]} accessibilityRole="button">
                <T size={12} weight="medium">
                  Fazer upgrade
                </T>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Pane>
  );
}

function TopBar({ compact, onMenu }: { compact: boolean; onMenu?: () => void }) {
  const isGlass = useGlass();
  return (
    <Pane kind="panel" style={[styles.topBar, { borderBottomColor: c.border }, compact && { paddingHorizontal: 16 }]}>
      {onMenu && (
        <Pressable onPress={onMenu} hitSlop={8} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Abrir menu">
          <MaterialCommunityIcons name="menu" size={22} color={c.text} />
        </Pressable>
      )}
      <T weight="medium" size={17} style={{ flex: compact ? 1 : undefined }} accessibilityRole="header">
        Desempenho
      </T>
      {!compact && (
        <View style={styles.searchWrap}>
          <Pressable
            style={[styles.search, { borderColor: c.border }, isGlass && glass.control]}
            accessibilityRole="search"
            accessibilityLabel="Buscar no ProFut"
          >
            <MaterialCommunityIcons name="magnify" size={15} color={c.muted} />
            <T size={12} color={c.muted} style={{ flex: 1 }}>
              Buscar no ProFut
            </T>
            <View style={[styles.kbd, { borderColor: c.border }]}>
              <T size={10} color={c.muted}>
                Ctrl K
              </T>
            </View>
          </Pressable>
        </View>
      )}
      {compact && <IconBtn icon="magnify" label="Buscar" />}
      <IconBtn icon="white-balance-sunny" label="Tema" />
      <IconBtn icon="bell-outline" label="Notificações" />
      <View style={styles.avatar} accessibilityLabel={`Conta de ${demoTeam.coach}`}>
        <T weight="bold" size={12} color="#FFFFFF">
          {demoTeam.coach[0]}
        </T>
      </View>
    </Pane>
  );
}

/* ---------- Cards ---------- */

function LoadChart({ compact }: { compact: boolean }) {
  const isGlass = useGlass();
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
  const avg = (pse.reduce((s, v) => s + v, 0) / pse.length).toFixed(1).replace('.', ',');
  const tipLeft = Math.min(Math.max(x(peak) + 8, 0), w - 132);

  return (
    <Pane kind="card" style={[styles.card, { padding: compact ? 14 : 18 }]}>
      <View style={[styles.spread, { alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }]}>
        <View>
          <T weight="medium" size={15} accessibilityRole="header">
            Esforço percebido (PSE)
          </T>
          <T size={11} color={c.muted} style={{ marginTop: 2 }}>
            22 treinos · {d.squad.total} atletas · média {avg} de 10
          </T>
        </View>
        <View style={[styles.inline, { gap: 6 }]}>
          <Button label="Diário" chevron small />
          <Button label="Treino" chevron small />
          {!compact && <Button label="Média" chevron small />}
        </View>
      </View>

      <View
        style={{ height: h, marginTop: 14 }}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
        accessible
        accessibilityLabel={`PSE média diária dos últimos 30 dias, de ${Math.min(...pse)} a ${Math.max(...pse)}; pico em ${dayLabel(peak, true)}`}
      >
        {w > 0 && (
          <>
            <Svg width={w} height={h}>
              <Defs>
                <LinearGradient id="pseFill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={c.ink} stopOpacity={0.16} />
                  <Stop offset="1" stopColor={c.ink} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Path d={area} fill="url(#pseFill)" />
              <Path d={line} stroke={c.ink} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
              <Line x1={x(peak)} x2={x(peak)} y1={y(10)} y2={y(0)} stroke={c.gray2} strokeWidth={1} strokeDasharray="3 3" />
              <Circle cx={x(peak)} cy={y(pse[peak])} r={4} fill={c.ink} stroke="#FFFFFF" strokeWidth={2} />
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
            <View style={[styles.tooltip, { left: tipLeft, top: y(10) }, isGlass && glass.tooltip]}>
              <T size={11} weight="medium">
                {dayLabel(peak, true)}
              </T>
              <View style={[styles.spread, { marginTop: 4, gap: 12 }]}>
                <T size={10} color={c.muted}>
                  PSE média
                </T>
                <T size={10} weight="bold">
                  {pse[peak].toFixed(1).replace('.', ',')}
                </T>
              </View>
            </View>
          </>
        )}
      </View>
    </Pane>
  );
}

function CardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const isGlass = useGlass();
  return (
    <View style={[styles.spread, { alignItems: 'flex-start' }]}>
      <View>
        <T weight="medium" size={14} accessibilityRole="header">
          {title}
        </T>
        <T size={11} color={c.muted} style={{ marginTop: 2 }}>
          {subtitle}
        </T>
      </View>
      <Pressable
        style={[styles.kebab, { borderColor: c.border }, isGlass && glass.control]}
        accessibilityRole="button"
        accessibilityLabel={`Mais opções de ${title}`}
      >
        <MaterialCommunityIcons name="dots-vertical" size={15} color={c.text} />
      </Pressable>
    </View>
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
  const isGlass = useGlass();
  const total = items.reduce((s, i) => s + i.value, 0);
  const size = 150;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const gap = 14; // espaço entre segmentos já descontando as pontas arredondadas
  let acc = 0;
  const slices = items.map((it, i) => {
    const s = {
      ...it,
      color: colors[i],
      start: acc / total,
      frac: it.value / total,
      pct: Math.round((it.value / total) * 100),
    };
    acc += it.value;
    return s;
  });

  return (
    <Pane kind="card" style={[styles.card, stretch && styles.flexCard]}>
      <CardHeader title={title} subtitle={subtitle} />
      <View
        style={{ alignItems: 'center', marginVertical: 18 }}
        accessible
        accessibilityLabel={slices.map((s) => `${s.label}: ${s.value}, ${s.pct}%`).join('; ')}
      >
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
                strokeLinecap="round"
                strokeDasharray={`${Math.max(s.frac * circ - gap, 1)} ${circ}`}
                strokeDashoffset={-(s.start * circ + gap / 2)}
              />
            ))}
          </Svg>
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <T weight="medium" size={15}>
              Total
            </T>
            <T size={11} color={c.muted}>
              {totalLabel}
            </T>
          </View>
          <View style={[styles.callout, isGlass && glass.tooltip]}>
            <T size={9} color={c.muted}>
              {callout}
            </T>
          </View>
        </View>
      </View>
      <View style={{ gap: 8, marginTop: 'auto' }} aria-hidden>
        {slices.map((s) => (
          <View key={s.label} style={styles.spread}>
            <View style={styles.inline}>
              <View style={[styles.dot, { backgroundColor: s.color }]} />
              <T size={11}>{s.label}</T>
            </View>
            <T size={11} color={c.muted}>
              {s.value} · {s.pct}%
            </T>
          </View>
        ))}
      </View>
    </Pane>
  );
}

function BarsCard({ stretch }: { stretch: boolean }) {
  const isGlass = useGlass();
  const total = goalOrigins.reduce((s, g) => s + g.value, 0);
  const shades = [c.ink, c.gray1, c.gray1, c.gray2, c.gray2];
  return (
    <Pane kind="card" style={[styles.card, stretch && styles.flexCard]}>
      <CardHeader title="Origem dos gols" subtitle={`${total} gols · temporada ${demoTeam.season}`} />
      <View style={{ gap: 14, marginTop: 16 }}>
        {goalOrigins.map((g, i) => {
          const pct = Math.round((g.value / total) * 100);
          const filled = Math.max(1, Math.round(pct / 5));
          return (
            <View key={g.label} accessible accessibilityLabel={`${g.label}: ${g.value} gols, ${pct}%`}>
              <View style={styles.spread}>
                <T size={11}>{g.label}</T>
                <T size={11} color={c.muted}>
                  {pct}%
                </T>
              </View>
              {/* 10 blocos de 5% cada, como na referência */}
              <View style={styles.blocks}>
                {Array.from({ length: 10 }, (_, k) => (
                  <View
                    key={k}
                    style={[
                      styles.block,
                      {
                        backgroundColor: k < filled ? shades[i] : isGlass ? 'rgba(255,255,255,0.7)' : c.track,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </Pane>
  );
}

/* ---------- Base ---------- */

function Button({ icon, label, chevron, small }: { icon?: IconName; label: string; chevron?: boolean; small?: boolean }) {
  const isGlass = useGlass();
  return (
    <Pressable
      style={[styles.button, { borderColor: c.border }, small && { height: 28, paddingHorizontal: 8 }, isGlass && glass.control]}
      accessibilityRole="button"
    >
      {icon && <MaterialCommunityIcons name={icon} size={14} color={c.text} />}
      <T size={small ? 11 : 12}>{label}</T>
      {chevron && <MaterialCommunityIcons name="chevron-down" size={14} color={c.muted} />}
    </Pressable>
  );
}

function IconBtn({ icon, label }: { icon: IconName; label: string }) {
  const isGlass = useGlass();
  return (
    <Pressable
      style={[styles.iconBtn, styles.iconBtnBorder, { borderColor: c.border }, isGlass && glass.control]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialCommunityIcons name={icon} size={16} color={c.text} />
    </Pressable>
  );
}

function T({
  weight = 'regular',
  size = 13,
  color = c.text,
  style,
  ...props
}: TextProps & {
  weight?: 'regular' | 'medium' | 'bold';
  size?: number;
  color?: string;
  children?: ReactNode;
}) {
  return <Text style={[{ fontFamily: fonts[weight], fontSize: size, color }, style]} {...props} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: c.page },
  main: { padding: 24, gap: 16 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  spread: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: { alignItems: 'center', justifyContent: 'center' },

  sidebar: {
    width: 232,
    height: '100%',
    backgroundColor: c.sidebar,
    borderRightWidth: 1,
    borderRightColor: c.border,
  },
  logo: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: c.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  teamCrest: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: c.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { letterSpacing: 0.6, marginBottom: 4, marginLeft: 8 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 36,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  usage: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  usageTrack: { height: 4, borderRadius: 2, backgroundColor: c.track },
  usageFill: { height: 4, borderRadius: 2, backgroundColor: c.ink },
  upgrade: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 60,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  searchWrap: { flex: 1, alignItems: 'center' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 260,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  kbd: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnBorder: { borderWidth: 1, borderRadius: 8 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: c.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },

  segmented: {
    flexDirection: 'row',
    backgroundColor: c.hover,
    borderRadius: 8,
    padding: 3,
  },
  segment: {
    paddingHorizontal: 10,
    height: 28,
    justifyContent: 'center',
    borderRadius: 6,
  },
  segmentOn: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  tab: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabOn: { borderBottomColor: c.ink },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },

  card: {
    backgroundColor: c.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    padding: 18,
  },
  cardsRow: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  flexCard: { flex: 1, minWidth: 0 },
  kebab: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  yLabel: { position: 'absolute', left: 0, width: 16, textAlign: 'right' },
  xLabel: { position: 'absolute', width: 40, textAlign: 'center' },
  tooltip: {
    position: 'absolute',
    width: 124,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: c.border,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  callout: {
    position: 'absolute',
    top: -6,
    right: -34,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  blocks: { flexDirection: 'row', gap: 3, marginTop: 6 },
  block: { flex: 1, height: 8, borderRadius: 2 },
});
