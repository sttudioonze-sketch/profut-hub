// Rota antiga/atalho: redireciona para a página real, em vez de montar uma segunda cópia dela.
import { Redirect } from 'expo-router';

export default function RedirectRoute() {
  return <Redirect href="/desempenho" />;
}
