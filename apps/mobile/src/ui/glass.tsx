// Peças do visual "glass clean" compartilhadas pelas páginas: fundo, painéis de vidro,
// texto, botões, cabeçalho de card, controles segmentados/abas e rosca.
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useId, type ComponentProps, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { fonts } from '@/theme';
import { backdrops, useGlassTheme } from '@/ui/glass-theme';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

// Algumas versões beta do iOS 26 não têm a API e travariam: checa as duas coisas.
export const liquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

// Ícone decorativo: a fonte de ícones vira texto na web (caractere de uso privado), então
// fica fora da árvore de acessibilidade; o significado vem do rótulo do controle.
export function Icon(props: ComponentProps<typeof MaterialCommunityIcons>) {
  return <MaterialCommunityIcons aria-hidden importantForAccessibility="no" {...props} />;
}

// Número decimal no formato brasileiro (5,9).
export const decimal = (n: number, digits = 1) => n.toFixed(digits).replace('.', ',');

// Nível de título na web (o react-native-web transforma todo "header" em h1).
const level = (n: number) => ({ 'aria-level': n }) as object;

// Ids de gradiente únicos por instância: na web as telas anteriores da pilha continuam no
// DOM (ocultas) e um url(#id) repetido apontaria para o gradiente da tela escondida.
export function useSvgId(prefix: string) {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, '');
}

export function GlassBackdrop() {
  const { mode } = useGlassTheme();
  const { width, height } = useWindowDimensions();
  const id = useSvgId('bg');
  const size = Math.max(width, height);
  const b = backdrops[mode];
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" aria-hidden importantForAccessibility="no-hide-descendants">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={`${id}base`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={b.base[0]} />
            <Stop offset="1" stopColor={b.base[1]} />
          </LinearGradient>
          {b.blobs.map((blob, i) => (
            <RadialGradient key={i} id={`${id}b${i}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={blob.color} stopOpacity={blob.opacity} />
              <Stop offset="1" stopColor={blob.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill={`url(#${id}base)`} />
        {b.blobs.map((blob, i) => (
          <Circle key={i} cx={blob.x * width} cy={blob.y * height} r={blob.r * size} fill={`url(#${id}b${i})`} />
        ))}
      </Svg>
    </View>
  );
}

// Painel de vidro: Liquid Glass nativo no iOS 26 (no esquema de cor do tema do app, não do
// sistema), View translúcida no resto.
export function Pane({
  kind,
  style,
  children,
  ...props
}: ComponentProps<typeof View> & {
  kind: 'panel' | 'drawer' | 'card';
  style?: StyleProp<ViewStyle>;
}) {
  const { mode, g } = useGlassTheme();
  if (liquidGlass) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme={mode} style={[style, { backgroundColor: 'transparent' }]} {...props}>
        {children}
      </GlassView>
    );
  }
  return (
    // Estilo de quem chama por último, para poder ajustar raio/borda em qualquer plataforma
    <View style={[g[kind], style]} {...props}>
      {children}
    </View>
  );
}

// Card padrão: vidro branco fosco, raio 20, borda de 1px (na web a borda branca do vidro;
// a cinza só no Liquid Glass, que não tem borda própria).
export function Card({ style, children, ...props }: ComponentProps<typeof View> & { style?: StyleProp<ViewStyle> }) {
  const { c } = useGlassTheme();
  return (
    <Pane kind="card" style={[ui.card, liquidGlass && { borderColor: c.border }, style]} {...props}>
      {children}
    </Pane>
  );
}

export function T({
  weight = 'regular',
  size = 13,
  color,
  heading,
  style,
  ...props
}: TextProps & {
  weight?: 'regular' | 'medium' | 'bold';
  size?: number;
  color?: string;
  // Título com nível (1 = título da página, 2 = título de card)
  heading?: 1 | 2;
  children?: ReactNode;
}) {
  const { c } = useGlassTheme();
  return (
    <Text
      style={[{ fontFamily: fonts[weight], fontSize: size, color: color ?? c.text }, style]}
      {...(heading ? { accessibilityRole: 'header', ...level(heading) } : null)}
      {...props}
    />
  );
}

export function Button({
  icon,
  label,
  chevron,
  small,
  onPress,
  accessibilityLabel,
}: {
  icon?: IconName;
  label: string;
  chevron?: boolean;
  small?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const { c, g } = useGlassTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={small ? 8 : 6}
      style={[ui.button, small && { height: 28, paddingHorizontal: 8 }, g.control]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {icon && <Icon name={icon} size={14} color={c.text} />}
      <T size={small ? 11 : 12}>{label}</T>
      {chevron && <Icon name="chevron-down" size={14} color={c.muted} />}
    </Pressable>
  );
}

// Botão de ícone 32x32. `touch` aumenta a área de toque para 44x44 (celular) mantendo o
// desenho de 32: na web o hitSlop é ignorado, por isso a área maior é uma caixa de verdade.
export function IconBtn({
  icon,
  label,
  onPress,
  touch,
  children,
  ...a11y
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  touch?: boolean;
  children?: ReactNode;
} & Pick<ComponentProps<typeof Pressable>, 'accessibilityRole' | 'accessibilityState' | 'aria-checked'>) {
  const { c, g } = useGlassTheme();
  const chip = (
    <View style={[ui.iconBtn, ui.iconBtnBorder, g.control]}>
      <Icon name={icon} size={16} color={c.text} />
      {children}
    </View>
  );
  return (
    <Pressable
      onPress={onPress}
      style={touch ? ui.touch : null}
      hitSlop={touch ? undefined : 6}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...a11y}
    >
      {chip}
    </Pressable>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  const { c, g } = useGlassTheme();
  return (
    <View style={[ui.spread, { alignItems: 'flex-start', gap: 8 }]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <T weight="medium" size={14} heading={2}>
          {title}
        </T>
        {subtitle && (
          <T size={11} color={c.muted} style={{ marginTop: 2 }}>
            {subtitle}
          </T>
        )}
      </View>
      <View style={ui.inline}>
        {action}
        <Pressable style={[ui.kebab, g.control]} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Mais opções de ${title}`}>
          <Icon name="dots-vertical" size={15} color={c.text} />
        </Pressable>
      </View>
    </View>
  );
}

export function Segmented({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const { c, g, mode } = useGlassTheme();
  return (
    <View style={[ui.segmented, g.control]} role="tablist">
      {options.map((v) => (
        <Pressable
          key={v}
          onPress={() => onChange(v)}
          hitSlop={{ top: 8, bottom: 8 }}
          style={[ui.segment, v === value && [ui.segmentOn, { backgroundColor: c.segmentOn }, mode === 'dark' && { shadowOpacity: 0 }]]}
          role="tab"
          aria-selected={v === value}
        >
          <T size={12} weight={v === value ? 'medium' : 'regular'} color={v === value ? c.text : c.muted}>
            {v}
          </T>
        </Pressable>
      ))}
    </View>
  );
}

// Abas sublinhadas; `right` fica alinhado à direita na mesma linha (ex.: botões de filtro).
export function Tabs({ options, value, onChange, right }: { options: string[]; value: string; onChange: (v: string) => void; right?: ReactNode }) {
  const { c } = useGlassTheme();
  return (
    <View style={[ui.tabsRow, { borderBottomColor: c.border }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }} role="tablist">
        {options.map((t) => (
          <Pressable key={t} onPress={() => onChange(t)} style={[ui.tab, t === value && { borderBottomColor: c.ink }]} role="tab" aria-selected={t === value}>
            {/* As abas ficam direto sobre o fundo: cinza mais escuro que o de dentro dos cards */}
            <T size={13} weight={t === value ? 'medium' : 'regular'} color={t === value ? c.text : c.mutedOnPage}>
              {t}
            </T>
          </Pressable>
        ))}
      </ScrollView>
      {right}
    </View>
  );
}

// Rosca com pontas arredondadas e espaço entre segmentos, centro e etiqueta opcional.
export function Donut({
  items,
  size = 150,
  stroke = 18,
  gap = 14,
  cap = 'round',
  center,
  callout,
  accessibilityLabel,
}: {
  items: { label: string; value: number; color: string }[];
  size?: number;
  stroke?: number;
  // espaço entre segmentos já descontando as pontas arredondadas
  gap?: number;
  // 'butt' para séries com fatias muito pequenas, que viram bolinhas com ponta redonda
  cap?: 'round' | 'butt';
  center: ReactNode;
  callout?: string;
  accessibilityLabel: string;
}) {
  const { c, g } = useGlassTheme();
  const total = items.reduce((s, i) => s + i.value, 0);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  const slices = items.map((it) => {
    const s = { ...it, start: acc / total, frac: it.value / total };
    acc += it.value;
    return s;
  });
  return (
    // role img: na web o leitor de tela lê o rótulo (com todas as fatias) e ignora os filhos
    <View style={{ width: size, height: size }} accessible role="img" accessibilityLabel={accessibilityLabel}>
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
            strokeLinecap={cap}
            strokeDasharray={`${Math.max(s.frac * circ - gap, 0.1)} ${circ}`}
            strokeDashoffset={-(s.start * circ + gap / 2)}
          />
        ))}
      </Svg>
      <View style={[StyleSheet.absoluteFill, ui.center]}>{center}</View>
      {callout && (
        <View style={[ui.callout, { borderColor: c.border }, g.tooltip]}>
          <T size={9} color={c.muted}>
            {callout}
          </T>
        </View>
      )}
    </View>
  );
}

export function Dot({ color, size = 7, outline }: { color: string; size?: number; outline?: string }) {
  return <View style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }, outline && { borderWidth: 1, borderColor: outline }]} />;
}

// Legenda dos gráficos: bolinha + rótulo à esquerda, valor à direita. Fica fora da árvore de
// acessibilidade porque o gráfico já tem o rótulo completo.
export function Legend({ items }: { items: { label: ReactNode; color: string; outline?: string; value: ReactNode }[] }) {
  const { c } = useGlassTheme();
  return (
    <View style={{ gap: 8, marginTop: 'auto' }} aria-hidden importantForAccessibility="no-hide-descendants">
      {items.map((it, i) => (
        <View key={i} style={ui.spread}>
          <View style={ui.inline}>
            <Dot color={it.color} outline={it.outline} />
            <T size={11}>{it.label}</T>
          </View>
          <T size={11} color={c.muted}>
            {it.value}
          </T>
        </View>
      ))}
    </View>
  );
}

export const ui = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  center: { alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 20, borderWidth: 1, padding: 18 },
  cardsRow: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  flexCard: { flex: 1, minWidth: 0 },
  button: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  touch: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  iconBtnBorder: { borderWidth: 1, borderRadius: 8 },
  kebab: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  segmented: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, padding: 3 },
  segment: { paddingHorizontal: 10, height: 28, justifyContent: 'center', borderRadius: 6 },
  segmentOn: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  tabsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderBottomWidth: 1 },
  tab: { paddingHorizontal: 8, paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  callout: { position: 'absolute', top: -6, right: -34, borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
});
