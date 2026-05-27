const Operacoes = {
  POUSO: 'POUSO',
  DECOLAGEM: 'DECOLAGEM'
} as const
export type Operacao = (typeof Operacoes)[keyof typeof Operacoes];