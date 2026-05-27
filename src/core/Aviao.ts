import type { Operacao } from "../types/Operacao";

export class Aviao {
  private readonly _id: number;
  private readonly _operacao: Operacao;
  private _combustivel: number;
  private _tempoDeEspera: number;

  constructor(id: number, operacao: Operacao, combustivel: number, tempoDeEspera: number) {
    this._id = id;
    this._operacao = operacao;
    this._combustivel = combustivel;
    this._tempoDeEspera = tempoDeEspera;
  }

  public aumentarCombustivel(quantidade: number) {
    this._combustivel += quantidade;
  }

  public diminuirCombustivel(quantidade: number) {
    this._combustivel = Math.max(0, this._combustivel - quantidade);
  }

  public aumentarTempoDeEspera(quantidade: number) {
    this._tempoDeEspera += quantidade;
  }

  public diminuirTempoDeEspera(quantidade: number) {
    this._tempoDeEspera = Math.max(0, this._tempoDeEspera - quantidade);
  }

  public get emSituacaoCritica() {
    return this._combustivel <= 0;
  }

  public get id() {
    return this._id;
  }

  public get operacao() {
    return this._operacao;
  }

  public get combustivel() {
    return this._combustivel;
  }

  public get tempoDeEspera() {
    return this._tempoDeEspera;
  }
}