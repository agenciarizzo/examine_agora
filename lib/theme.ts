/** Linha visual Eco Editorial — ver `design/HANDOFF.md`. */
export const cor = {
  campo: '#061423',
  navy: '#0A2A52',
  eco: '#1470C4',
  ceu: '#A9D6F5',
  gelo: '#EEF6FC',
  branco: '#FFFFFF',
  whatsapp: '#25D366',
} as const;

/** Grão de ruído dos panos escuros (idêntico ao dos HTML de referência). */
export const GRAIN =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%27220%27%20height=%27220%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%27.85%27%20numOctaves=%272%27/%3E%3C/filter%3E%3Crect%20width=%27220%27%20height=%27220%27%20filter=%27url(%23n)%27/%3E%3C/svg%3E";

/** Instrument Serif itálico — a ênfase tipográfica da matriz. */
export const serif = {
  fontFamily: "'Instrument Serif',serif",
  fontStyle: 'italic',
  fontWeight: 400,
} as const;

/** Largura da coluna editorial. */
export const WRAP = 1100;
