const Estagios = {
  INICIOU: 'INICIOU',
  FINALIZOU: 'FINALIZOU',
  CAIU: 'CAIU'
} as const
export type Estagio = (typeof Estagios)[keyof typeof Estagios];