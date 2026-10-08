# ProFut HUB · Proposta de Escopo do MVP

Versão 0.2 · 08/10/2026

## 1. Visão do produto

O ProFut HUB é um aplicativo de assinatura mensal para treinadores de futebol (profissional e categorias de base) organizarem e controlarem sua equipe em um só lugar, cobrindo três dimensões:

- **Organizacional:** elenco, agenda, presença, comunicação, documentos.
- **Técnica:** planejamento de treinos, biblioteca de exercícios, avaliação individual dos atletas.
- **Tática:** prancheta tática, formações, plano de jogo e análise pós-jogo.

**Quem paga:** o treinador (ou o clube, num plano de equipe). Atletas e familiares usam de graça, como convidados.

**Objetivo do MVP:** colocar nas mãos de 10 a 30 treinadores reais uma versão que eles usem toda semana, validando que pagariam a mensalidade.

## 2. Perfis de usuário (papéis)

| Papel | Quem é | O que faz no MVP |
|---|---|---|
| **Treinador principal** (dono da conta) | Assinante pagante | Acesso total à equipe: cria elenco, treinos, jogos, táticas, convida pessoas, gerencia assinatura. |
| **Comissão técnica** | Auxiliar, preparador físico, preparador de goleiros, analista | Acesso de edição definido pelo treinador (ex.: preparador físico edita treinos, não vê pagamentos). |
| **Atleta** | Jogador do elenco | Vê agenda, confirma presença, vê convocação e plano de treino, recebe avisos. |
| **Responsável** (só base) | Pai/mãe de atleta menor | Mesmo que atleta, em nome do filho; recebe avisos e autoriza participação. |

Fora do MVP: perfil "Diretor/Clube" gerenciando várias equipes (entra no plano Clube, fase 2).

## 3. Funcionalidades do MVP

Prioridade: **P0** = obrigatório no lançamento, **P1** = entra se couber, **P2** = depois do MVP.

### 3.1 Organizacional

| Funcionalidade | Prior. | Detalhe |
|---|---|---|
| Cadastro de equipe | P0 | Nome, categoria (Profissional, Sub-20, Sub-17, Sub-15...), temporada, escudo. |
| Elenco | P0 | Atleta com foto, posição, pé dominante, número, data de nascimento, contato, responsável (base), status (ativo, lesionado, suspenso, emprestado). |
| Agenda | P0 | Treinos, jogos e eventos em calendário; local, horário, convocados. |
| Presença | P0 | Atleta confirma pelo app; treinador marca presença real; relatório de frequência por atleta. |
| Convites | P0 | Treinador convida comissão e atletas por link ou WhatsApp. |
| Mural de avisos | P1 | Comunicados com notificação push. |
| Documentos do atleta | P2 | Exames, atestados, autorizações. |
| Controle de mensalidade dos atletas (escolinhas) | P2 | Útil para base/escolinhas; fica para depois. |

### 3.2 Técnica

| Funcionalidade | Prior. | Detalhe |
|---|---|---|
| Biblioteca de exercícios | P0 | Exercício com nome, objetivo (técnico, tático, físico), duração, nº de atletas, descrição e desenho no campo. Vem com uma base inicial pronta. |
| Planejamento de treino | P0 | Sessão montada com exercícios da biblioteca, tempo total, objetivo do dia; vincula à agenda. |
| Microciclo semanal | P1 | Visão da semana com cargas e objetivos por dia. |
| Avaliação de atletas | P0 | Notas periódicas por fundamento (passe, finalização, marcação, físico, comportamento...) com histórico e gráfico de evolução. |
| Controle de carga e lesões | P1 | Percepção de esforço (PSE) pós-treino respondida pelo atleta; registro de lesão e retorno. |
| Testes físicos | P2 | Velocidade, resistência (Yo-Yo), etc. |

### 3.3 Tática

| Funcionalidade | Prior. | Detalhe |
|---|---|---|
| Prancheta tática | P0 | Campo interativo: arrastar jogadores, setas, zonas; salvar como imagem e compartilhar. |
| Formações | P0 | Montar escalação (4-3-3, 4-4-2, 3-5-2...) com atletas reais do elenco, titulares e reservas. |
| Plano de jogo | P0 | Para cada jogo: adversário, escalação, instruções por fase (com bola, sem bola, transições, bola parada). |
| Súmula/estatísticas do jogo | P0 | Resultado, gols, assistências, cartões, minutos jogados, substituições. Alimenta estatísticas do atleta. |
| Bola parada | P1 | Jogadas ensaiadas desenhadas na prancheta. |
| Prancheta animada (sequência de quadros) | P2 | Movimentação em etapas. |
| Análise de vídeo | P2 | Marcação de lances em vídeo; caro de construir, fica fora do MVP. |

### 3.4 Painel do treinador

| Funcionalidade | Prior. | Detalhe |
|---|---|---|
| Início | P0 | Próximo treino/jogo, pendências de presença, atletas lesionados/suspensos. |
| Estatísticas da equipe | P1 | Vitórias/empates/derrotas, gols, artilharia, frequência média. |
| Exportar relatório em PDF | P1 | Relatório de atleta ou de jogo. |

## 4. Modelo de assinatura

Proposta inicial (valores para validar com treinadores):

| Plano | Preço sugerido | Para quem | Limites |
|---|---|---|---|
| **Teste grátis** | 14 dias | Todos | Acesso completo ao plano Treinador. |
| **Treinador** | R$ 39,90/mês ou R$ 399/ano | Treinador individual, base ou amador | 1 equipe, até 40 atletas, até 3 membros de comissão. |
| **Pro** | R$ 79,90/mês ou R$ 799/ano | Treinador profissional ou com várias categorias | Até 3 equipes, atletas ilimitados, comissão ilimitada, relatórios PDF. |
| **Clube** (fase 2) | Sob consulta | Clubes e escolinhas | Várias equipes, perfil de diretoria, gestão central. |

Regras:
- Atletas e responsáveis nunca pagam.
- Sem pagamento ativo, a conta entra em modo leitura (não perde dados).
- Cobrança recorrente por cartão e Pix Automático (Brasil); boleto para plano anual.
- Gateway sugerido: **Stripe** (cartão e assinaturas, também serve fora do Brasil) ou **Asaas / Pagar.me** (melhor suporte a Pix e boleto no Brasil). Recomendo começar com Asaas se o público for 100% Brasil.
- Se o app for vendido dentro das lojas (Apple/Google), elas cobram de 15% a 30%. Para evitar isso no início, a assinatura é contratada pela web e o app só faz login.

## 5. Stack tecnológica sugerida

Critérios: um único código para Android, iOS e web; baixo custo inicial; rápido para um MVP.

| Camada | Escolha | Por quê |
|---|---|---|
| App mobile + web | **React Native com Expo** (TypeScript) | Um código gera Android, iOS e versão web. Publicação nas lojas facilitada pelo EAS. |
| Prancheta tática | **react-native-skia** ou SVG | Desenho fluido no campo, exportação para imagem. |
| Backend, banco e login | **Supabase** (PostgreSQL + Auth + Storage + Realtime) | Banco relacional ideal para equipes/atletas/jogos, login pronto (e-mail, Google, Apple), regras de permissão por papel direto no banco, plano gratuito para começar. |
| Pagamentos | **Asaas** (ou Stripe) com webhooks em Supabase Edge Functions | Assinatura recorrente, Pix, cartão, boleto. |
| Notificações | **Expo Push Notifications** | Avisos de treino, convocação, presença. |
| Site de vendas e checkout | **Next.js** na Vercel | Landing page, planos e contratação. |
| Monitoramento | Sentry + PostHog | Erros e uso do app (quais funções os treinadores usam). |

Custo de infraestrutura estimado no início: perto de zero (planos gratuitos), mais as contas de desenvolvedor das lojas (Apple US$ 99/ano, Google US$ 25 uma vez).

Alternativa: Flutter + Firebase. Funciona bem, mas o Firestore (banco não relacional) complica relatórios e estatísticas, que são centrais aqui.

## 6. Modelo de dados (visão simplificada)

```
Conta (treinador) ─┬─ Assinatura
                   └─ Equipe ─┬─ Membros (papel: comissão, atleta, responsável)
                              ├─ Atleta ── Avaliações, Lesões, Estatísticas
                              ├─ Evento (treino | jogo) ── Presenças
                              │     ├─ Treino ── Exercícios da sessão
                              │     └─ Jogo ── Escalação, Plano de jogo, Súmula
                              ├─ Exercícios (biblioteca)
                              └─ Pranchetas táticas
```

## 7. Fases sugeridas

1. **Fundação:** login, equipe, elenco, convites, agenda, presença, assinatura com teste grátis.
2. **Técnica:** biblioteca de exercícios, planejamento de treino, avaliação de atletas.
3. **Tática:** prancheta, formações, plano de jogo, súmula e estatísticas.
4. **Beta fechado:** 10 a 30 treinadores usando de verdade; ajustes; ativação da cobrança.
5. **Lançamento nas lojas.**

## 8. Decisões tomadas

1. Público inicial: Brasil (cobrança via Asaas).
2. Foco do lançamento: treinadores profissionais.
3. Repositório e código: aprovados. Primeiras entregas: painel admin de assinantes e dashboard de controle geral do app.
4. Visual: referências em `docs/design/` (vermelho #EB0D0D, grafite #343434, cinza #E6E6E6, Roboto).
