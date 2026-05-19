export default class Pista {
  private _id: number;
  private _emUso: boolean;

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
}