import type { Operacao } from "../types/Operacao";

export class Aviao {
  private _id: number;
  private _combustivel: number;
  private _operacao: Operacao;
  private _tempoDeEspera: number;

  constructor(id: number, combustivel: number, operacao: Operacao) {
    this._id = id;
    this._combustivel = combustivel;
    this._operacao = operacao;
    this._tempoDeEspera = 0;
  }

  public incrementarTempoDeEspera() {
    this._tempoDeEspera++;
  }

  public decrementarCombustivel(): void {
    if (this._operacao === "POUSO" && this._combustivel > 0) {
      this._combustivel--;
    }
  }

  public emSituacaoDeEmergencia(): boolean {
    return this._combustivel === 1;
  }

  public get id() {
    return this._id;
  }

  public get combustivel() {
    return this._combustivel;
  }

  public get operacao() {
    return this._operacao;
  }

  public get tempoDeEspera() {
    return this._tempoDeEspera;
  }
}
