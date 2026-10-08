// No export web publicado junto do painel admin o site fica em /app (EXPO_WEB_BASE_URL=/app).
// Sem a variável (app nativo e expo start) nada muda.
module.exports = ({ config }) => {
  const baseUrl = process.env.EXPO_WEB_BASE_URL;
  if (!baseUrl) return config;
  return { ...config, experiments: { ...config.experiments, baseUrl } };
};
