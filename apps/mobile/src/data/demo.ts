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
    { key: 'seg', label: 'S', day: 6, hasEvent: true },
    { key: 'ter', label: 'T', day: 7, hasEvent: true },
    { key: 'qua', label: 'Q', day: 8, hasEvent: false, isToday: true },
    { key: 'qui', label: 'Q', day: 9, hasEvent: true },
    { key: 'sex', label: 'S', day: 10, hasEvent: true },
    { key: 'sab', label: 'S', day: 11, hasEvent: true },
    { key: 'dom', label: 'D', day: 12, hasEvent: false },
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
