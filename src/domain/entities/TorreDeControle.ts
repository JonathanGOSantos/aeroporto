import type { Estagio } from '../types/Estagio';
import type { Operacao } from '../types/Operacao';
import Aviao from './Aviao';
import Pista from './Pista';
import Prateleira from './Prateleira';

export class Registro {
  public readonly instante: number;
  public readonly idAviao: number;
  public readonly combustivel: number;
  public readonly estagio: Estagio;
  public readonly operacao: Operacao;
  public readonly pista: number | undefined;
  public readonly prateleira: number;

  constructor(
    instante: number,
    idAviao: number,
    combustivel: number,
    estagio: Estagio,
    operacao: Operacao,
    pista: number | undefined,
    prateleira: number,
  ) {
    this.instante = instante;
    this.idAviao = idAviao;
    this.combustivel = combustivel;
    this.estagio = estagio;
    this.operacao = operacao;
    this.pista = pista;
    this.prateleira = prateleira;
  }
}

export default class TorreDeControle {
  private _instante: number;
  private _registros: Map<Number, Registro[]>;
  private _prateleirasDeDecolagem: Map<number, Prateleira>;
  private _prateleirasDePouso: Map<number, Prateleira>;
  private _pistas: Map<number, Pista>;

  constructor(registros: Map<Number, Registro[]>) {
    this._instante = 0;
    this._registros = registros;
    this._prateleirasDeDecolagem = new Map<number, Prateleira>();
    this._prateleirasDePouso = new Map<number, Prateleira>();
    this._pistas = new Map<number, Pista>();

    // TODO: Preencher as prateleiras
  }

  public processarAviao(aviao: Aviao): void {
    if (aviao.operacao == 'POUSO') {
      let menorPista: number = -1;
      let tamanhoMenorPista: number = -1;

      for (let p = 1; p <= 2; p++) {
        let tamanhoPistaAtual: number = this._prateleirasDePouso.get(
          p * 2 - 1,
        )!.tamanho;
        tamanhoPistaAtual += this._prateleirasDePouso.get(p * 2)!.tamanho;

        if (tamanhoMenorPista == -1 || tamanhoPistaAtual < tamanhoMenorPista) {
          tamanhoMenorPista = tamanhoPistaAtual;
          menorPista = p;
        }
      }

      let menorPrateleira: Prateleira;
      if (
        this._prateleirasDePouso.get(menorPista * 2 - 1)!.tamanho <
        this._prateleirasDePouso.get(menorPista * 2)!.tamanho
      ) {
        menorPrateleira = this._prateleirasDePouso.get(menorPista * 2 - 1)!;
      } else {
        menorPrateleira = this._prateleirasDePouso.get(menorPista * 2)!;
      }
      menorPrateleira.adicionarAviao(aviao);
      this.novoRegistro(
        new Registro(
          this._instante,
          aviao.id,
          aviao.combustivel,
          'INICIOU',
          'POUSO',
          undefined,
          menorPrateleira.id,
        ),
      );
      return;
    }

    if (aviao.operacao == 'DECOLAGEM') {
      let menorPrateleira: Prateleira = this._prateleirasDeDecolagem.get(1)!;

      for (const prateleira of this._prateleirasDeDecolagem.values()) {
        if (prateleira.tamanho < menorPrateleira.tamanho) {
          menorPrateleira = prateleira;
        }
      }
      menorPrateleira.adicionarAviao(aviao);
      this.novoRegistro(
        new Registro(
          this._instante,
          aviao.id,
          aviao.combustivel,
          'INICIOU',
          'DECOLAGEM',
          undefined,
          menorPrateleira.id,
        ),
      );
      return;
    }
  }

  public processarPistas(): void {
    for (let pista of this._pistas.values()) {
      pista.liberar();
    }

    this.alocarPistasParaEmergencias();
    this.alocarPistas();

    for (let prateleira of this._prateleirasDePouso.values()) {
      prateleira.atualizarTempoDeEspera();
    }
  }

  private alocarPistasParaEmergencias(): void {
    this._prateleirasDePouso.forEach((prateleira, id) => {
      const emergencias: Aviao[] = prateleira.obterEmergencias();
      for (let emergencia of emergencias) {
        let pista: Pista;
        if (!this._pistas.get(3)!.emUso) {
          pista = this._pistas.get(3)!;
        } else if (!this._pistas.get(2)!.emUso) {
          pista = this._pistas.get(2)!;
        } else if (!this._pistas.get(1)!.emUso) {
          pista = this._pistas.get(1)!;
        } else {
          prateleira.removerAviao(emergencia);
          this.novoRegistro(
            new Registro(
              this._instante,
              emergencia.id,
              emergencia.combustivel,
              'CAIU',
              'POUSO',
              this.pistaDe(prateleira, 'POUSO'),
              id,
            ),
          );
          return;
        }

        pista.ocupar();
        prateleira.removerAviao(emergencia);
        this.novoRegistro(
          new Registro(
            this._instante,
            emergencia.id,
            emergencia.combustivel,
            'FINALIZOU',
            'POUSO',
            this.pistaDe(prateleira, 'POUSO'),
            id,
          ),
        );
      }
    });
  }

  private alocarPistas(): void {
    if (!this._pistas.get(1)!.emUso) {
      this.alocarAviaoParaPista(this._pistas.get(1)!);
    }
    if (!this._pistas.get(2)!.emUso) {
      this.alocarAviaoParaPista(this._pistas.get(2)!);
    }
    if (!this._pistas.get(3)!.emUso) {
      if (!this._prateleirasDeDecolagem.get(3)!.vazia) {
        const aviao: Aviao = this._prateleirasDeDecolagem
          .get(3)!
          .removerPrimeiroAviao()!;
        this.novoRegistro(
          new Registro(
            this._instante,
            aviao.id,
            aviao.combustivel,
            'FINALIZOU',
            'DECOLAGEM',
            3,
            3,
          ),
        );
      }
    }
  }

  private alocarAviaoParaPista(pista: Pista): void {
    const prateleiraDecolagem = this._prateleirasDeDecolagem.get(pista.id)!;

    const prateleiraPousoA = this._prateleirasDePouso.get(pista.id * 2 - 1)!;
    const prateleiraPousoB = this._prateleirasDePouso.get(pista.id * 2)!;

    let prateleiraPousoEscolhida: Prateleira | undefined;

    const idA = prateleiraPousoA.idProximoAviao;
    const idB = prateleiraPousoB.idProximoAviao;

    if (idA !== undefined && idB !== undefined) {
      prateleiraPousoEscolhida =
        idA < idB ? prateleiraPousoA : prateleiraPousoB;
    } else if (idA !== undefined) {
      prateleiraPousoEscolhida = prateleiraPousoA;
    } else if (idB !== undefined) {
      prateleiraPousoEscolhida = prateleiraPousoB;
    }

    if (!prateleiraPousoEscolhida && prateleiraDecolagem.vazia) {
      return;
    }

    pista.ocupar();

    if (!prateleiraPousoEscolhida) {
      const aviao = prateleiraDecolagem.removerPrimeiroAviao()!;
      this.novoRegistro(
        new Registro(
          this._instante,
          aviao.id,
          aviao.combustivel,
          'FINALIZOU',
          'DECOLAGEM',
          pista.id,
          prateleiraDecolagem.id,
        ),
      );
      return;
    }

    if (prateleiraDecolagem.vazia) {
      const aviao = prateleiraPousoEscolhida.removerPrimeiroAviao()!;
      this.novoRegistro(
        new Registro(
          this._instante,
          aviao.id,
          aviao.combustivel,
          'FINALIZOU',
          'POUSO',
          pista.id,
          prateleiraPousoEscolhida.id,
        ),
      );
      return;
    }

    if (
      prateleiraDecolagem.idProximoAviao! <
      prateleiraPousoEscolhida.idProximoAviao!
    ) {
      const aviao = prateleiraDecolagem.removerPrimeiroAviao()!;
      this.novoRegistro(
        new Registro(
          this._instante,
          aviao.id,
          aviao.combustivel,
          'FINALIZOU',
          'DECOLAGEM',
          pista.id,
          prateleiraDecolagem.id,
        ),
      );
    } else {
      const aviao = prateleiraPousoEscolhida.removerPrimeiroAviao()!;
      this.novoRegistro(
        new Registro(
          this._instante,
          aviao.id,
          aviao.combustivel,
          'FINALIZOU',
          'POUSO',
          pista.id,
          prateleiraPousoEscolhida.id,
        ),
      );
    }
  }

  private novoRegistro(registro: Registro): void {
    if (!this._registros.has(registro.instante)) {
      this._registros.set(registro.instante, []);
    }
    this._registros.get(registro.instante)!.push(registro);
  }

  public get registros(): Registro[] {
    return Array.from(this._registros.values()).flat();
  }

  public registrosEm(instante: number): Registro[] {
    return this._registros.get(instante) || [];
  }

  private pistaDe(prateleira: Prateleira, operacao: Operacao): number {
    if (operacao === 'DECOLAGEM') {
      return prateleira.id;
    }
    return Math.ceil(prateleira.id / 2);
  }
}
