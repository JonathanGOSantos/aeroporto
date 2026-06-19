export const Operacao = {
  POUSO: 'POUSO',
  DECOLAGEM: 'DECOLAGEM'
} as const;

export type Operacao = typeof Operacao[keyof typeof Operacao];