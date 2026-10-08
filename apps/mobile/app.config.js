// No export web publicado junto do painel admin o site fica em /app (EXPO_WEB_BASE_URL=/app).
// Sem a variável (app nativo e expo start) nada muda.
// Atenção: o expo-router remove o prefixo sem checar a barra, então nenhuma rota pode começar com "app" (ex.: /apple).
module.exports = ({ config }) => {
  const baseUrl = process.env.EXPO_WEB_BASE_URL;
  if (!baseUrl) return config;
  return {
    ...config,
    experiments: { ...config.experiments, baseUrl },
    // Sem o /_sitemap de desenvolvimento no site publicado.
    extra: { ...config.extra, router: { ...config.extra?.router, sitemap: false } },
  };
};
