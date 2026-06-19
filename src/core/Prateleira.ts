import { Operacao } from "../types/Operacao";
import type { Aviao } from "./Aviao";


class Node {
    public prev: Node | null = null;
    public next: Node | null = null;
    public readonly aviao: Aviao;

    constructor(aviao: Aviao) {
        this.aviao = aviao;
    }
}

export class Prateleira {
    private _tamanho = 0;
    private cabeca: Node | null = null;
    private cauda: Node | null = null;
    public readonly id: number;
    public readonly operacaoPermitida: Operacao;

    constructor(id: number, operacaoPermitida: Operacao) {
        this.id = id;
        this.operacaoPermitida = operacaoPermitida;
    }

    get tamanho(): number {
        return this._tamanho;
    }

    public isVazia(): boolean {
        return this._tamanho === 0;
    }

    public adicionar(aviao: Aviao): void {
        const novoNo = new Node(aviao);
        if (!this.cabeca) {
            this.cabeca = novoNo;
            this.cauda = novoNo;
        } else {
            novoNo.prev = this.cauda;
            if (this.cauda) this.cauda.next = novoNo;
            this.cauda = novoNo;
        }
        this._tamanho++;
    }

    public verPrimeiroAviao(): Aviao | null {
        return this.cabeca ? this.cabeca.aviao : null;
    }

    public removerPrimeiroAviao(): Aviao | null {
        if (!this.cabeca) return null;

        const aviao = this.cabeca.aviao;
        this._tamanho--;

        if (this.cabeca === this.cauda) {
            this.cabeca = null;
            this.cauda = null;
        } else {
            this.cabeca = this.cabeca.next;
            if (this.cabeca) this.cabeca.prev = null;
        }
        return aviao;
    }

    public obterEmergencias(): Aviao[] {
        const emergencias: Aviao[] = [];
        let atual = this.cabeca;
        while (atual) {
            if (atual.aviao.operacao === Operacao.POUSO && atual.aviao.combustivel === 0) {
                emergencias.push(atual.aviao);
            }
            atual = atual.next;
        }
        return emergencias;
    }

    public remover(aviao: Aviao): boolean {
        let atual = this.cabeca;
        while (atual) {
            if (atual.aviao.id === aviao.id) {
                if (atual === this.cabeca) this.cabeca = atual.next;
                else if (atual.prev) atual.prev.next = atual.next;

                if (atual === this.cauda) this.cauda = atual.prev;
                else if (atual.next) atual.next.prev = atual.prev;

                this._tamanho--;
                return true;
            }
            atual = atual.next;
        }
        return false;
    }

    public atualizarTempoDeEspera(): void {
        let atual = this.cabeca;
        while (atual) {
            atual.aviao.incrementarTempoDeEspera();
            if (atual.aviao.operacao === Operacao.POUSO && atual.aviao.combustivel > 0) {
                atual.aviao.decrementarCombustivel();
            }
            atual = atual.next;
        }
    }

    public toArray(): Aviao[] {
        const arr: Aviao[] = [];
        let atual = this.cabeca;
        while (atual) {
            arr.push(atual.aviao);
            atual = atual.next;
        }
        return arr;
    }
}