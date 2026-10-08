// Paleta e tipografia das referências de design (vermelho #EB0D0D, grafite #343434, Roboto)

export const colors = {
  background: '#E6E6E6',
  surface: '#F7F7F7',
  text: '#343434',
  muted: '#747474',
  border: '#D1D1D1',
  brand: '#EB0D0D',
  brandSoft: '#FDE4E4',
  graphite: '#343434',
  graphite2: '#484848',
  silver: '#D1D1D1',
  positive: '#1F8A4C',
  white: '#FFFFFF',
} as const;

export const fonts = {
  regular: 'Roboto_400Regular',
  medium: 'Roboto_500Medium',
  bold: 'Roboto_700Bold',
} as const;

// Grid mobile das referências: margem 20, gutter 20
export const spacing = { margin: 20, gutter: 12, card: 16 } as const;
