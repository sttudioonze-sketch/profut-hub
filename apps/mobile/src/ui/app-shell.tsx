// Estrutura padrão das páginas: fundo glass, menu lateral fosco (fixo em telas largas, gaveta
// no celular) e barra superior fosca com busca, tema, notificações e conta.
import { Link, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { BackHandler, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { demoDashboard as d, demoTeam } from '@/data/demo';
import { GlassBackdrop, Icon, IconBtn, liquidGlass, Pane, T, ui, type IconName } from '@/ui/glass';
import { useGlassTheme } from '@/ui/glass-theme';

export type NavKey = 'Dashboard' | 'Elenco' | 'Agenda' | 'Treinos' | 'Táticas' | 'Desempenho' | 'Jogos e súmulas';

const PLAN_LIMIT = 40;
const TRIAL_DAYS_LEFT = 9;
const web = Platform.OS === 'web';

// wide: menu lateral fixo · xl: três cards lado a lado no Dashboard · medium: tablet
export function useBreakpoints() {
  const { width } = useWindowDimensions();
  return { width, xl: width >= 1280, wide: width >= 1100, medium: width >= 720 };
}

export function AppShell({ title, active, children }: { title: string; active: NavKey; children: ReactNode }) {
  const { mode, c } = useGlassTheme();
  const { wide, medium } = useBreakpoints();
  const insets = useSafeAreaInsets();
  const [drawer, setDrawer] = useState(false);
  const open = !wide && drawer;
  const mainRef = useRef<View>(null);
  const menuRef = useRef<View>(null);
  const closeRef = useRef<View>(null);

  // Gaveta virou menu fixo (janela alargou): fecha, para não reaparecer aberta ao estreitar.
  useEffect(() => {
    if (wide) setDrawer(false);
  }, [wide]);

  // Gaveta modal: voltar do Android e Esc na web fecham; na web o conteúdo atrás fica inerte
  // (fora do Tab e do leitor de tela) e o foco vai para o X, voltando ao botão de menu depois.
  useEffect(() => {
    if (!open) return;
    const close = () => setDrawer(false);
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    if (!web) return () => back.remove();
    const main = mainRef.current as unknown as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    if (main) main.inert = true;
    (closeRef.current as unknown as HTMLElement | null)?.focus();
    return () => {
      back.remove();
      window.removeEventListener('keydown', onKey);
      if (main) main.inert = false;
      (menuRef.current as unknown as HTMLElement | null)?.focus();
    };
  }, [open]);

  return (
    <View style={[styles.root, { backgroundColor: c.page }]}>
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
      <GlassBackdrop />
      {wide && <Sidebar active={active} />}
      <SafeAreaView
        ref={mainRef}
        edges={['top']}
        style={{ flex: 1 }}
        aria-hidden={open || undefined}
        importantForAccessibility={open ? 'no-hide-descendants' : 'auto'}
      >
        <TopBar title={title} compact={!medium} menuRef={menuRef} onMenu={wide ? undefined : () => setDrawer(true)} />
        <ScrollView contentContainerStyle={[styles.main, !medium && { padding: 16 }, { paddingBottom: (medium ? 24 : 16) + insets.bottom }]}>
          {children}
          <T size={11} color={c.mutedOnPage} style={{ textAlign: 'center', marginTop: 4 }}>
            Dados fictícios de demonstração
          </T>
        </ScrollView>
      </SafeAreaView>

      {open && (
        <View style={StyleSheet.absoluteFill} role="dialog" aria-modal aria-label="Menu" accessibilityViewIsModal>
          {/* O X é o controle acessível de fechar; o fundo escurecido só responde ao toque */}
          <Pressable
            style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]}
            onPress={() => setDrawer(false)}
            focusable={false}
            aria-hidden
            importantForAccessibility="no"
          />
          <Sidebar active={active} onClose={() => setDrawer(false)} closeRef={closeRef} />
        </View>
      )}
    </View>
  );
}

type NavItem = { label: NavKey; icon: IconName; href?: Href };

// Só Dashboard e Desempenho existem por enquanto; os demais itens ficam inertes.
const sections: { title?: string; items: NavItem[] }[] = [
  { items: [{ label: 'Dashboard', icon: 'view-grid-outline', href: '/painel' }] },
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
      { label: 'Desempenho', icon: 'chart-line', href: '/desempenho' },
      { label: 'Jogos e súmulas', icon: 'soccer' },
    ],
  },
];

function Sidebar({ active, onClose, closeRef }: { active: NavKey; onClose?: () => void; closeRef?: Ref<View> }) {
  const { c, g } = useGlassTheme();
  const usedPct = Math.round((d.squad.total / PLAN_LIMIT) * 100);
  const drawer = !!onClose;

  return (
    <Pane
      kind={drawer ? 'drawer' : 'panel'}
      // Na web vale a borda clara do vidro (como no visual aprovado); a cor cinza só no Liquid Glass
      style={[styles.sidebar, liquidGlass && { borderRightColor: c.border }]}
    >
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
          <View style={[ui.spread, { marginBottom: drawer ? 14 : 20, minHeight: 26 }]}>
            <View style={ui.inline}>
              <View style={[styles.logo, { backgroundColor: c.ink }]}>
                <Icon name="soccer" size={16} color={c.onInk} />
              </View>
              <T weight="bold" size={15}>
                ProFut HUB
              </T>
            </View>
            {/* Só na gaveta: no menu fixo não há o que recolher por enquanto */}
            {drawer && (
              <Pressable ref={closeRef} onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Fechar menu">
                <Icon name="close" size={18} color={c.muted} />
              </Pressable>
            )}
          </View>

          <Pressable style={[styles.teamPicker, g.control]} accessibilityRole="button" accessibilityLabel={`Equipe ${demoTeam.name}, trocar`}>
            {/* Escudo do time: um dos poucos lugares onde o vermelho da marca aparece */}
            <View style={[styles.teamCrest, { backgroundColor: c.brand }]}>
              <T weight="bold" size={9} color="#FFFFFF">
                EC
              </T>
            </View>
            <T weight="medium" size={13} style={{ flex: 1 }}>
              {demoTeam.name}
            </T>
            <Icon name="unfold-more-horizontal" size={16} color={c.muted} />
          </Pressable>

          {sections.map((s, i) => (
            <View key={i} style={{ marginTop: s.title ? 16 : 0 }}>
              {s.title && (
                <T weight="medium" size={10} color={c.muted} style={styles.sectionTitle}>
                  {s.title.toUpperCase()}
                </T>
              )}
              {s.items.map((it) => (
                <NavRow key={it.label} item={it} active={it.label === active} tall={drawer} onNavigate={onClose} />
              ))}
            </View>
          ))}

          <View style={{ marginTop: 'auto', paddingTop: 24 }}>
            {[
              { label: 'Ajustes', icon: 'cog-outline' as IconName },
              { label: 'Ajuda e suporte', icon: 'help-circle-outline' as IconName },
            ].map((it) => (
              <Pressable
                key={it.label}
                style={[styles.navItem, drawer && styles.navItemTall]}
                accessibilityRole="button"
                aria-disabled
                accessibilityHint="Em breve"
              >
                <Icon name={it.icon} size={17} color={c.muted} />
                <T size={13} color={c.navText}>
                  {it.label}
                </T>
              </Pressable>
            ))}

            {/* Teste grátis + uso do plano (limite de atletas do plano Treinador). O botão fica fora
                do bloco "accessible": no iOS um bloco acessível esconde os botões de dentro. */}
            <View style={[styles.plan, g.control]}>
              <View
                style={{ gap: 8 }}
                accessible
                accessibilityLabel={`Teste grátis, ${TRIAL_DAYS_LEFT} dias restantes. ${d.squad.total} de ${PLAN_LIMIT} atletas do plano usados`}
              >
                <View style={[ui.inline, { gap: 10 }]}>
                  <View style={[styles.planIcon, { backgroundColor: c.soft }]}>
                    <Icon name="crown-outline" size={15} color={c.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T size={12} weight="medium">
                      Teste grátis
                    </T>
                    <T size={11} color={c.muted} style={{ marginTop: 1 }}>
                      {TRIAL_DAYS_LEFT} dias restantes
                    </T>
                  </View>
                </View>
                <View style={[ui.spread, { marginTop: 4 }]}>
                  <T size={11} color={c.muted}>
                    Atletas no plano
                  </T>
                  <T size={11} weight="medium">
                    {d.squad.total}/{PLAN_LIMIT}
                  </T>
                </View>
                <View style={[styles.planTrack, { backgroundColor: c.track }]}>
                  <View style={[styles.planFill, { width: `${usedPct}%`, backgroundColor: c.ink }]} />
                </View>
              </View>
              <Pressable style={[styles.upgrade, g.control]} accessibilityRole="button">
                <T size={12} weight="medium">
                  Assinar o Pro
                </T>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Pane>
  );
}

function NavRow({ item, active, tall, onNavigate }: { item: NavItem; active: boolean; tall: boolean; onNavigate?: () => void }) {
  const { c } = useGlassTheme();
  const row = (
    <Pressable
      // Estilo achatado: o Link com asChild mescla o style como objeto e quebraria um array na web
      style={StyleSheet.flatten([
        styles.navItem,
        tall && styles.navItemTall,
        active && { backgroundColor: c.navActive, borderColor: c.navActiveBorder },
        active && web && styles.navActiveShadow,
      ])}
      // Fecha a gaveta (também ao tocar na página atual); o Link compõe este handler com o dele.
      // Passar onPress ao próprio Link substituiria a navegação interna e a web recarregaria.
      onPress={item.href ? onNavigate : undefined}
      accessibilityRole={item.href ? 'link' : 'button'}
      aria-current={active ? 'page' : undefined}
      // Seções ainda não construídas: anunciadas como indisponíveis
      aria-disabled={item.href ? undefined : true}
      accessibilityHint={item.href ? undefined : 'Em breve'}
    >
      <Icon name={item.icon} size={17} color={active ? c.text : c.muted} />
      <T size={13} weight={active ? 'medium' : 'regular'} color={active ? c.text : c.navText}>
        {item.label}
      </T>
    </Pressable>
  );
  if (!item.href || active) return row;
  // replace: seções do menu não empilham telas (a pilha e o histórico não crescem a cada clique)
  return (
    <Link href={item.href} replace asChild>
      {row}
    </Link>
  );
}

function TopBar({ title, compact, onMenu, menuRef }: { title: string; compact: boolean; onMenu?: () => void; menuRef: Ref<View> }) {
  const { mode, toggle, c, g } = useGlassTheme();
  return (
    <Pane kind="panel" style={[styles.topBar, { borderBottomColor: c.border }, compact && { paddingHorizontal: 10, gap: 0 }]}>
      {/* Busca centralizada na barra (não no espaço que sobra do título): não muda de lugar entre páginas */}
      {!compact && (
        <View style={styles.searchWrap} pointerEvents="box-none">
          <Pressable style={[styles.search, g.control]} accessibilityRole="button" accessibilityLabel="Buscar no ProFut">
            <Icon name="magnify" size={15} color={c.muted} />
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
      {onMenu && (
        <Pressable ref={menuRef} onPress={onMenu} style={ui.touch} accessibilityRole="button" accessibilityLabel="Abrir menu">
          <Icon name="menu" size={22} color={c.text} />
        </Pressable>
      )}
      <T weight="medium" size={17} style={{ flex: 1, marginLeft: compact ? 2 : 0 }} numberOfLines={1} heading={1}>
        {title}
      </T>
      {compact && <IconBtn icon="magnify" label="Buscar" touch />}
      <IconBtn
        icon={mode === 'light' ? 'white-balance-sunny' : 'weather-night'}
        label="Tema escuro"
        accessibilityRole="switch"
        aria-checked={mode === 'dark'}
        accessibilityState={{ checked: mode === 'dark' }}
        onPress={toggle}
        touch={compact}
      />
      <IconBtn icon="bell-outline" label="Notificações, 3 novas" touch={compact}>
        <View style={[styles.badge, { backgroundColor: c.brand }]} />
      </IconBtn>
      <View style={[styles.avatar, { backgroundColor: c.ink }]} role="img" accessibilityLabel={`Conta de ${demoTeam.coach}`}>
        <T weight="bold" size={12} color={c.onInk}>
          {demoTeam.coach[0]}
        </T>
      </View>
    </Pane>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  // Largura máxima: em telas muito largas sobra margem dos lados em vez de esticar tabelas
  main: { padding: 24, gap: 16, width: '100%', maxWidth: 1480, alignSelf: 'center' },

  sidebar: { width: 232, height: '100%', borderRightWidth: 1 },
  logo: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginVertical: -9, marginRight: -12 },
  teamPicker: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, height: 38, marginBottom: 8 },
  teamCrest: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { letterSpacing: 0.6, marginBottom: 4, marginLeft: 8 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 36,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navItemTall: { minHeight: 44 },
  navActiveShadow: { boxShadow: '0 1px 2px rgba(20,20,24,0.04)' },
  plan: { marginTop: 12, borderWidth: 1, borderRadius: 12, padding: 12, gap: 8 },
  planIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  planTrack: { height: 4, borderRadius: 2 },
  planFill: { height: 4, borderRadius: 2 },
  upgrade: { borderWidth: 1, borderRadius: 8, minHeight: 34, alignItems: 'center', justifyContent: 'center', marginTop: 4 },

  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 60, paddingHorizontal: 24, borderBottomWidth: 1 },
  searchWrap: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 260, height: 32, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10 },
  kbd: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  badge: { position: 'absolute', top: 6, right: 7, width: 6, height: 6, borderRadius: 3 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
});
