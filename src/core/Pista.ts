import type { Prateleira } from "./Prateleira";

export default class Pista {
  private _id: number;
  private _emUso: boolean;
  prateleirasDecolagem: Prateleira[] = [];
  prateleirasPouso: Prateleira[] = [];


  constructor(id: number){
    this._id = id;
    this._emUso = false;
  }

  public get id(): number {
    return this._id;
  }

  public get emUso(): boolean {
    return this._emUso;
  }

  public ocupar(): void {
    this._emUso = true;
  }

  public liberar(): void {
    this._emUso = false;
  }

  get totalAvioes() {
    const totalDecolagem = this.prateleirasDecolagem.reduce((acc, prat) => acc + prat.tamanho, 0);
    const totalPouso = this.prateleirasPouso.reduce((acc, prat) => acc + prat.tamanho, 0);
    return totalDecolagem + totalPouso;
  }
}