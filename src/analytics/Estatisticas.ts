import { Operacao } from '../types/Operacao';
import { Estagio } from '../types/Estagio';
import type Registro from '../types/Registro';
import type { Aviao } from '../core/Aviao';

export class Estatisticas {
  private _totalAvioesDecolagem = 0;
  private _totalAvioesPouso = 0;
  private _tempoTotalParaPouso = 0;
  private _tempoTotalParaDecolagem = 0;
  private _totalAvioesPousaramSemCombustivel = 0;

  private _registros: Registro[] = [];

  novoRegistro(
    instante: number,
    aviao: Aviao,
    estagio: Estagio,
    operacao: Operacao,
    pistaId: number,
    prateleiraId: number,
  ): void {
    const registro: Registro = {
      instante,
      idAviao: aviao.id,
      combustivelNoMomento: aviao.combustivel,
      estagio,
      operacao,
      pistaId,
      prateleiraId,
    };

    this._registros.push(registro);

    if (estagio === Estagio.INICIOU) {
      if (operacao === Operacao.DECOLAGEM) {
        this._totalAvioesDecolagem++;
      } else if (operacao === Operacao.POUSO) {
        this._totalAvioesPouso++;
      }
    } else if (estagio === Estagio.FINALIZOU) {
      if (operacao === Operacao.DECOLAGEM) {
        this._tempoTotalParaDecolagem += aviao.tempoDeEspera;
      } else if (operacao === Operacao.POUSO) {
        this._tempoTotalParaPouso += aviao.tempoDeEspera;
        if (registro.combustivelNoMomento === 0) {
          this._totalAvioesPousaramSemCombustivel++;
        }
      }
    }

    if (estagio === Estagio.CAIU) {
      console.warn(
        `- [ALERTA] Avião ${aviao.id} CAIU por falta de combustível na prateleira ${prateleiraId}!`,
      );
      return;
    }

    let fraseAcao = '';
    if (estagio === Estagio.INICIOU) {
      fraseAcao =
        operacao === Operacao.POUSO
          ? 'chegou para pousar e entrou em órbita na prateleira'
          : 'entrou na fila de espera para decolar na prateleira';
    } else if (estagio === Estagio.FINALIZOU) {
      fraseAcao =
        operacao === Operacao.POUSO
          ? 'pousou com sucesso a partir da prateleira'
          : 'decolou com sucesso a partir da prateleira';
    }

    if (fraseAcao) {
      const deOnde =
        operacao === Operacao.POUSO ? 'vindo da prateleira' : 'da prateleira';
      console.log(
        `- Avião ${aviao.id} ${fraseAcao} na pista ${pistaId} ${deOnde} ${prateleiraId} com ${aviao.combustivel} un. de combustível.`,
      );
    }
  }

  get tempoMedioDeDecolagem(): number {
    if (this._totalAvioesDecolagem === 0) return 0.0;
    return this._tempoTotalParaDecolagem / this._totalAvioesDecolagem;
  }

  get tempoMedioDePouso(): number {
    if (this._totalAvioesPouso === 0) return 0.0;
    return this._tempoTotalParaPouso / this._totalAvioesPouso;
  }

  get avioesSemCombustivel(): number {
    return this._totalAvioesPousaramSemCombustivel;
  }

  get historico(): Registro[] {
    return this._registros;
  }

  // TODO: Criar um link para download dos registros
  exportar(): void {
    // const conteudo = Object.groupBy(this._registros, registro => registro.instante);
  }
}
