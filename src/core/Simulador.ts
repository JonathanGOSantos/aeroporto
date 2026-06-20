import { Renderizador } from '../ui/Renderizador';
import { Operacao } from '../types/Operacao';
import { TorreDeControle } from './TorreDeControle';
import type { Prateleira } from './Prateleira';

export class Simulador {
  public readonly torre = new TorreDeControle();
  public readonly renderizador = new Renderizador();

  private _velocidade: number = 1;
  private _pausado: boolean = true;
  private _tempoBaseFase: number = 1000;
  private _executandoTick: boolean = false;

  public static readonly VELOCIDADES = [1, 2, 4];

  get velocidade() { return this._velocidade; }
  get pausado() { return this._pausado; }
  get iniciado() { return this.torre.instante != 1; }

  alterarVelocidade(novaVelocidade: number) {
    if (Simulador.VELOCIDADES.includes(novaVelocidade)) {
      this._velocidade = novaVelocidade;
      this.renderizador.atualizarControlesDeTempo(this._pausado, this._velocidade);
    }
  }

  alternarPausa() {
    this._pausado = !this._pausado;
    this.renderizador.atualizarControlesDeTempo(this._pausado, this._velocidade);
    
    if (!this._pausado) {
      this.executarLoop();
    }
  }

  async forcarAvancoManual() {
    if (this._pausado && !this._executandoTick) {
      this._executandoTick = true;
      await this.avancarFase();
      this._executandoTick = false;
    }
  }

  private async executarLoop() {
    if (this._executandoTick || this._pausado) return;

    this._executandoTick = true;
    await this.avancarFase();
    this._executandoTick = false;

    if (!this._pausado) {
      this.executarLoop();
    }
  }

  private gerarNumeroAleatorio(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private async avancarFase() {
    const instanteAtual = this.torre.instante;

    if (instanteAtual % 2 !== 0) {
      console.log(`--- [Instante ${instanteAtual} - ÍMPAR] Fase de Chegada ---`);
      this.gerarTrafegoAleatorio();
    } else {
      console.log(`--- [Instante ${instanteAtual} - PAR] Fase de Escoamento ---`);
      this.processarTrancamentoDePistas();
    }

    this.torre.passarTempo();
    this.renderizador.atualizarInstante(this.torre.instante);
    
    const delayCalculado = this._tempoBaseFase / this._velocidade;
    await new Promise((resolve) => setTimeout(resolve, delayCalculado));
  }

  private gerarTrafegoAleatorio() {
    const operacoesParaGerar: Operacao[] = [];
    const qtdDecolagens = this.gerarNumeroAleatorio(0, 3);
    const qtdPousos = this.gerarNumeroAleatorio(0, 3);

    for (let i = 0; i < qtdDecolagens; i++) operacoesParaGerar.push(Operacao.DECOLAGEM);
    for (let i = 0; i < qtdPousos; i++) operacoesParaGerar.push(Operacao.POUSO);

    // Embaralhar (Fisher-Yates)
    for (let i = operacoesParaGerar.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [operacoesParaGerar[i], operacoesParaGerar[j]] = [operacoesParaGerar[j], operacoesParaGerar[i]];
    }

    for (const operacao of operacoesParaGerar) {
      const combustivel = operacao === Operacao.POUSO ? this.gerarNumeroAleatorio(1, 20) : 0;
      const aviao = this.torre.novoAviao(operacao, combustivel);
      const prateleira = this.torre.processarAviao(aviao);
      this.renderizador.adicionarAviao(aviao, prateleira);
    }
  }

  private processarTrancamentoDePistas() {
    const avioesRemovidos = this.torre.processarPistas();

    for (const aviao of avioesRemovidos) {
      this.renderizador.removerAviao(aviao);
    }

    for (const contextoPista of this.torre.pistas.values()) {
      for (const prateleira of contextoPista.prateleirasPouso) {
        prateleira.toArray().forEach(aviao => this.renderizador.atualizarCombustivel(aviao));
      }
    }

    this.renderizador.atualizarPainelEstatisticas(this.torre.estatisticas);
  }

  injetarAviaoManual(operacao: Operacao, combustivel: number, alocacaoEscolhida: string) {
    const aviao = this.torre.novoAviao(operacao, combustivel);
    let prateleiraDestino: Prateleira | undefined;

    if (alocacaoEscolhida === "AUTOMATICA") {
      prateleiraDestino = this.torre.processarAviao(aviao);
    } else {
      const [_, opPrat, idPrat] = alocacaoEscolhida.split('-');
      
      for (const cp of this.torre.pistas.values()) {
        const lista = opPrat === "DECOLAGEM" ? cp.prateleirasDecolagem : cp.prateleirasPouso;
        const correspondente = lista.find(p => p.id === parseInt(idPrat));
        
        if (correspondente) {
          prateleiraDestino = correspondente;
          prateleiraDestino.adicionar(aviao);
          
          this.torre.estatisticas.novoRegistro(
            this.torre.instante, aviao, "INICIOU" as any, aviao.operacao, cp.pista.id, prateleiraDestino.id
          );
          break;
        }
      }
    }

    if (prateleiraDestino) {
      this.renderizador.adicionarAviao(aviao, prateleiraDestino);
    }
  }
}