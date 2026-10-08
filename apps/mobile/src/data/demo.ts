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
