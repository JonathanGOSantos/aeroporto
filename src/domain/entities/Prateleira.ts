import Aviao from "./Aviao";

export default class Prateleira {
  private _id: number;
  private _avioes: Aviao[];

  constructor(id: number) {
    this._avioes = [];
    this._id = id;
  }

  public adicionarAviao(aviao: Aviao): void {
    this._avioes.push(aviao);
  }

  public verPrimeiroAviao(): Aviao | undefined {
    return this._avioes[0];
  }

  public get idProximoAviao(): number | undefined {
    return this._avioes[0]?.id;
  }

  public removerPrimeiroAviao(): Aviao | undefined {
    return this._avioes.shift();
  }

  public removerAviao(aviao: Aviao): void {
    this._avioes = this._avioes.filter((a) => a.id !== aviao.id);
  }

  public obterEmergencias(): Aviao[] {
    return this._avioes.filter((a) => a.emSituacaoDeEmergencia());
  }

  public get tamanho(): number {
    return this._avioes.length;
  }

  public get vazia(): boolean {
    return this._avioes.length === 0;
  }

  public atualizarTempoDeEspera(): void {
    this._avioes.forEach((a) => {
      a.decrementarCombustivel();
    });
  }
  
  public get id() : number {
    return this._id;
  }
  
}