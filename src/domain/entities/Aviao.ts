import type { Operacao } from '../types/Operacao';

export default class Aviao {
  private _id: number;
  private _combustivel: number;
  private _operacao: Operacao;

  constructor(id: number, combustivel: number, operacao: Operacao) {
    this._id = id;
    this._combustivel = combustivel;
    this._operacao = operacao;
  }

  public decrementarCombustivel(): void {
    if (this._operacao === "POUSO" && this._combustivel > 0) {
      this._combustivel--;
    }
  }

  public emSituacaoDeEmergencia(): boolean {
    return this._combustivel === 0;
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
}
