import { Aviao } from './Aviao';

export class Prateleira {
  private _cabeca: Nodo | null;
  private _cauda: Nodo | null;
  private _tamanho: number;

  constructor() {
    this._cabeca = null;
    this._cauda = null;
    this._tamanho = 0;
  }

  public get tamanho() {
    return this._tamanho;
  }

  public get vazia() {
    return this._tamanho === 0;
  }

  public adicionarAviao(aviao: Aviao): void {
    const novoNodo: Nodo = {
      prev: null,
      next: null,
      value: aviao,
    };

    if (this._cabeca === null) {
      this._cabeca = novoNodo;
      this._cauda = novoNodo;
    } else {
      this._cauda!.next = novoNodo;
      novoNodo.prev = this._cauda;
      this._cauda = novoNodo;
    }
    this._tamanho++;
  }

  public removerPrimeiroAviao(): Aviao | null {
    if (this._cabeca === null) {
      return null;
    }

    const aviao = this._cabeca.value;
    this._cabeca = this._cabeca.next;

    if (this._cabeca === null) {
      this._cauda = null;
    } else {
      this._cabeca.prev = null;
    }

    this._tamanho--;
    return aviao;
  }

  public removerAviao(aviao: Aviao): Aviao | null {
    if (this._cauda === null) {
      return null;
    }
    let nodoAtual: Nodo | null = this._cauda;
    while (nodoAtual !== null) {
      if (nodoAtual.value === aviao) {
        if (nodoAtual.prev !== null) {
          nodoAtual.prev.next = nodoAtual.next;
        } else {
          this._cabeca = nodoAtual.next;
        }
        if (nodoAtual.next !== null) {
          nodoAtual.next.prev = nodoAtual.prev;
        } else {
          this._cauda = nodoAtual.prev;
        }
      }
      nodoAtual = nodoAtual.prev;
    }
    this._tamanho--;
    return aviao;
  }
}

interface Nodo {
  prev: Nodo | null;
  next: Nodo | null;
  value: Aviao;
}
