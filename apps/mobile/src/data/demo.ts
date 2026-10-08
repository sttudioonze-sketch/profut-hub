// Dados fictícios do dashboard até a conexão com o Supabase.

export type AthleteStatus = 'active' | 'injured' | 'suspended' | 'loaned';
export type Result = 'V' | 'E' | 'D';

export const demoTeam = {
  name: 'EC Exemplo',
  category: 'Profissional',
  season: '2026',
  coach: 'Luis',
};

export const demoDashboard = {
  squad: { total: 28, active: 22, injured: 3, suspended: 2, loaned: 1 },
  attendanceMonthPct: 87,
  attendancePrevPct: 82,
  attendanceByWeek: [
    { label: 'S1', value: 84 },
    { label: 'S2', value: 79 },
    { label: 'S3', value: 88 },
    { label: 'S4', value: 91 },
    { label: 'S5', value: 87 },
  ],
  season: { played: 14, wins: 8, draws: 3, losses: 3, goalsFor: 22, goalsAgainst: 13 },
  lastResults: [
    { result: 'V' as Result, score: '2 x 0', opponent: 'Atlético Serrano' },
    { result: 'V' as Result, score: '3 x 1', opponent: 'União do Vale' },
    { result: 'E' as Result, score: '1 x 1', opponent: 'Rio Branco FC' },
    { result: 'D' as Result, score: '0 x 1', opponent: 'Grêmio Litoral' },
    { result: 'V' as Result, score: '2 x 1', opponent: 'Nacional AC' },
  ],
  nextMatch: {
    opponent: 'Sport Clube Paulista',
    date: 'Sáb, 11/10',
    time: '16:00',
    location: 'Estádio Municipal',
    isHome: true,
    competition: 'Campeonato Estadual · Rodada 15',
    confirmed: 19,
    pending: 4,
  },
  nextTraining: {
    title: 'Tático: saída de bola sob pressão',
    date: 'Amanhã, 09/10',
    time: '09:30',
    location: 'CT · Campo 2',
    duration: '90 min',
  },
  alerts: [
    { name: 'Rafael Lima', detail: 'Lesão muscular · retorno previsto 20/10', status: 'injured' as AthleteStatus },
    { name: 'Diego Souza', detail: 'Entorse no tornozelo · avaliação 12/10', status: 'injured' as AthleteStatus },
    { name: 'Bruno Alves', detail: '3º cartão amarelo · fora da rodada 15', status: 'suspended' as AthleteStatus },
    { name: 'Caio Martins', detail: 'Pendurado · 2 cartões amarelos', status: 'active' as AthleteStatus },
  ],
  topScorers: [
    { name: 'Lucas Ferreira', position: 'ATA', goals: 7 },
    { name: 'Matheus Rocha', position: 'MEI', goals: 5 },
    { name: 'Pedro Henrique', position: 'ATA', goals: 4 },
  ],
};

// Teste Material 3: semana atual (hoje = qua, 08/10) e recortes por período.
export type EventKind = 'match' | 'training' | 'physical';

export const demoWeek = {
  today: 'Qua, 8 de outubro',
  days: [
    { key: 'seg', name: 'segunda-feira', label: 'S', day: 6, hasEvent: true },
    { key: 'ter', name: 'terça-feira', label: 'T', day: 7, hasEvent: true },
    { key: 'qua', name: 'quarta-feira', label: 'Q', day: 8, hasEvent: false, isToday: true },
    { key: 'qui', name: 'quinta-feira', label: 'Q', day: 9, hasEvent: true },
    { key: 'sex', name: 'sexta-feira', label: 'S', day: 10, hasEvent: true },
    { key: 'sab', name: 'sábado', label: 'S', day: 11, hasEvent: true },
    { key: 'dom', name: 'domingo', label: 'D', day: 12, hasEvent: false },
  ],
  events: [
    { weekday: 'Qui', day: 9, kind: 'training' as EventKind, title: 'Tático: saída de bola sob pressão', detail: '09:30 · 90 min · CT, Campo 2' },
    { weekday: 'Sex', day: 10, kind: 'physical' as EventKind, title: 'Físico: ativação pré-jogo', detail: '10:00 · 60 min · CT, Academia' },
    { weekday: 'Sáb', day: 11, kind: 'match' as EventKind, title: 'EC Exemplo x Sport Clube Paulista', detail: '16:00 · Estádio Municipal' },
  ],
};

export type Period = 'week' | 'month' | 'season';

export const demoByPeriod: Record<Period, { attendancePct: number; attendanceDiff: number; played: number; wins: number; draws: number; losses: number }> = {
  week: { attendancePct: 91, attendanceDiff: 4, played: 1, wins: 1, draws: 0, losses: 0 },
  month: { attendancePct: 87, attendanceDiff: 5, played: 4, wins: 2, draws: 1, losses: 1 },
  season: { attendancePct: 85, attendanceDiff: 2, played: 14, wins: 8, draws: 3, losses: 3 },
};

// Painel (referência CreatiHR): desempenho, metas individuais e próximos eventos.
export type Rating = 'great' | 'good' | 'fair' | 'attention';

export const demoPerformance: { name: string; detail: string; position: string; rating: Rating }[] = [
  { name: 'Lucas Ferreira', detail: 'Camisa 9 · 7 gols', position: 'Atacante', rating: 'great' },
  { name: 'Matheus Rocha', detail: 'Camisa 10 · 5 gols, 4 assist.', position: 'Meia', rating: 'good' },
  { name: 'Caio Martins', detail: 'Camisa 4 · pendurado', position: 'Zagueiro', rating: 'fair' },
  { name: 'Bruno Alves', detail: 'Camisa 6 · suspenso', position: 'Volante', rating: 'attention' },
];

export const demoAthleteGoals = {
  athlete: 'Lucas Ferreira',
  month: 'Out/2026',
  rows: [
    { label: 'Passes certos', target: '85%', achieved: '82%', pct: 96 },
    { label: 'Finalizações no alvo', target: '50%', achieved: '58%', pct: 116 },
    { label: 'Duelos ganhos', target: '55%', achieved: '49%', pct: 89 },
    { label: 'Desarmes por jogo', target: '2,0', achieved: '1,4', pct: 70 },
    { label: 'Gols', target: '8', achieved: '7', pct: 88 },
    { label: 'Assistências', target: '4', achieved: '3', pct: 75 },
    { label: 'Minutos jogados', target: '1.260', achieved: '1.134', pct: 90 },
  ],
};

export const demoUpcoming = [
  {
    kind: 'match' as EventKind,
    subtitle: 'Jogo · Estadual, rodada 15',
    title: 'EC Exemplo x Sport Clube Paulista',
    stats: [
      { icon: 'account-check-outline', value: '19' },
      { icon: 'help-circle-outline', value: '4' },
    ],
    when: 'Sáb 11/10 · 16:00',
    people: ['LF', 'MR', 'PH'],
    more: 16,
  },
  {
    kind: 'training' as EventKind,
    subtitle: 'Treino tático · CT, Campo 2',
    title: 'Saída de bola sob pressão',
    stats: [
      { icon: 'account-check-outline', value: '22' },
      { icon: 'clock-outline', value: '90 min' },
    ],
    when: 'Amanhã · 09:30',
    people: ['CM', 'BA', 'DS'],
    more: 19,
  },
];
