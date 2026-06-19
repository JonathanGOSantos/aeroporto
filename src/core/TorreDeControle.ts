import { Estatisticas } from '../analytics/Estatisticas';
import { Estagio } from '../types/Estagio';
import { Operacao } from '../types/Operacao';
import type { ContextoPista } from '../types/Pista';
import { Aviao } from './Aviao';
import Pista from './Pista';
import { Prateleira } from './Prateleira';

export class TorreDeControle {
  private _instante = 1;
  private _idAviao = 1;

  private _estatisticas: Estatisticas;
  private _pistas: Map<number, ContextoPista> = new Map();

  constructor() {
    this._estatisticas = new Estatisticas();

    const p1 = new Pista(1);
    const p2 = new Pista(2);
    const p3 = new Pista(3);

    this._pistas.set(p1.id, {
      pista: p1,
      prateleirasDecolagem: [new Prateleira(1, Operacao.DECOLAGEM)],
      prateleirasPouso: [
        new Prateleira(1, Operacao.POUSO),
        new Prateleira(2, Operacao.POUSO),
      ],
    });

    this._pistas.set(p2.id, {
      pista: p2,
      prateleirasDecolagem: [new Prateleira(2, Operacao.DECOLAGEM)],
      prateleirasPouso: [
        new Prateleira(3, Operacao.POUSO),
        new Prateleira(4, Operacao.POUSO),
      ],
    });

    this._pistas.set(p3.id, {
      pista: p3,
      prateleirasDecolagem: [new Prateleira(3, Operacao.DECOLAGEM)],
      prateleirasPouso: [],
    });
  }

  novoAviao(operacao: Operacao, combustivel: number = 0) {
    return new Aviao(this._idAviao++, combustivel, operacao);
  }

  processarAviao(aviao: Aviao): Prateleira {
    let menorPistaId = -1;
    let menorQuantidade = Infinity;

    for (const [id, contextoPista] of this._pistas.entries()) {
      const totalDecolagem = contextoPista.prateleirasDecolagem.reduce(
        (acc, p) => acc + p.tamanho,
        0,
      );
      const totalPouso = contextoPista.prateleirasPouso.reduce(
        (acc, p) => acc + p.tamanho,
        0,
      );
      const totalEspera = totalDecolagem + totalPouso;

      if (aviao.operacao === Operacao.POUSO && id === 3) {
        continue;
      }
      if (totalEspera < menorQuantidade) {
        menorQuantidade = totalEspera;
        menorPistaId = id;
      }
    }

    const contexto = this._pistas.get(menorPistaId)!;
    let prateleiraEscolhida: Prateleira;

    if (aviao.operacao === Operacao.DECOLAGEM) {
      prateleiraEscolhida = contexto.prateleirasDecolagem[0];
    } else {
      prateleiraEscolhida = contexto.prateleirasPouso.reduce((atual, prox) =>
        atual.tamanho <= prox.tamanho ? atual : prox,
      );
    }

    prateleiraEscolhida.adicionar(aviao);

    this._estatisticas.novoRegistro(
      this._instante,
      aviao,
      Estagio.INICIOU,
      aviao.operacao,
      contexto.pista.id,
      prateleiraEscolhida.id,
    );

    return prateleiraEscolhida;
  }

  processarPistas(): Aviao[] {
    for (const contexto of this._pistas.values()) {
      contexto.pista.liberar();
    }

    const avioes: Aviao[] = [];

    avioes.push(...this.alocarPistasParaEmergencias());

    avioes.push(...this.alocarPistas());

    for (const contexto of this._pistas.values()) {
      contexto.prateleirasDecolagem.forEach((p) => p.atualizarTempoDeEspera());
      contexto.prateleirasPouso.forEach((p) => p.atualizarTempoDeEspera());
    }
    return avioes;
  }

  private alocarPistasParaEmergencias(): Aviao[] {
    const avioes: Aviao[] = [];
    for (const contexto of this._pistas.values()) {
      for (const prateleira of contexto.prateleirasPouso) {
        const emergencias = prateleira.obterEmergencias();

        for (const emergencia of emergencias) {
          let pistaAlocada: Pista | null = null;

          const p3 = this._pistas.get(3)!.pista;
          const p1 = this._pistas.get(1)!.pista;
          const p2 = this._pistas.get(2)!.pista;

          if (!p3.emUso) pistaAlocada = p3;
          else if (!p1.emUso) pistaAlocada = p1;
          else if (!p2.emUso) pistaAlocada = p2;

          if (!pistaAlocada) {
            prateleira.remover(emergencia);
            this._estatisticas.novoRegistro(
              this._instante,
              emergencia,
              Estagio.CAIU,
              Operacao.POUSO,
              -1,
              prateleira.id,
            );
            avioes.push(emergencia);
            continue;
          }

          pistaAlocada.ocupar();
          avioes.push(emergencia);
          prateleira.remover(emergencia);
          this._estatisticas.novoRegistro(
            this._instante,
            emergencia,
            Estagio.FINALIZOU,
            Operacao.POUSO,
            pistaAlocada.id,
            prateleira.id,
          );
        }
      }
    }
    return avioes;
  }

  private alocarPistas(): Aviao[] {
    const avioes: Aviao[] = [];
    for (const contexto of this._pistas.values()) {
      if (!contexto.pista.emUso) {
        const aviao = this.alocarAviaoParaPista(contexto);
        if (aviao != null) {
          avioes.push(aviao);
        }
      }
    }
    return avioes;
  }

  private alocarAviaoParaPista(contexto: ContextoPista): Aviao | null {
    const todasPrateleirasDaPista = [
      ...contexto.prateleirasDecolagem,
      ...contexto.prateleirasPouso,
    ];
    let prateleiraEscolhida: Prateleira | null = null;

    for (const p of todasPrateleirasDaPista) {
      if (p.isVazia()) continue;

      const aviaoTopo = p.verPrimeiroAviao()!;
      if (!prateleiraEscolhida) {
        prateleiraEscolhida = p;
      } else {
        const aviaoEscolhidoTopo = prateleiraEscolhida.verPrimeiroAviao()!;
        if (aviaoTopo.id < aviaoEscolhidoTopo.id) {
          prateleiraEscolhida = p;
        }
      }
    }

    if (!prateleiraEscolhida) return null;

    const aviao = prateleiraEscolhida.removerPrimeiroAviao()!;
    contexto.pista.ocupar();

    this._estatisticas.novoRegistro(
      this._instante,
      aviao,
      Estagio.FINALIZOU,
      aviao.operacao,
      contexto.pista.id,
      prateleiraEscolhida.id,
    );
    return aviao;
  }

  passarTempo() {
    this._instante++;
  }

  get estatisticas(): Estatisticas {
    return this._estatisticas;
  }

  get instante(): number {
    return this._instante;
  }

  get pistas(): ContextoPista[] {
    return Array.from(this._pistas.values());
  }
}
