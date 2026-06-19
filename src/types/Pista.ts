import type Pista from "../core/Pista";
import type { Prateleira } from "../core/Prateleira";

export type ContextoPista = {
  pista: Pista;
  prateleirasDecolagem: Prateleira[];
  prateleirasPouso: Prateleira[];
};