export const Estagio = {
  INICIOU: 'INICIOU',
  FINALIZOU: 'FINALIZOU',
  CAIU: 'CAIU'
} as const;

export type Estagio = typeof Estagio[keyof typeof Estagio];