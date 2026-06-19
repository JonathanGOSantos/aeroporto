import type { Prateleira } from './core/Prateleira';
import { TorreDeControle } from './core/TorreDeControle';
import './style.scss';
import { Operacao } from './types/Operacao';
import { Renderizador } from './ui/Renderizador';

export class Simulador {
  private torre = new TorreDeControle();
  private renderizador = new Renderizador();

  private _velocidade: number = 1; // 1 = 1x, 2 = 2x, 4 = 4x
  private _pausado: boolean = true; // Começa pausado para debug/controle
  private _tempoBaseFase: number = 1000; // 2 segundos por fase em 1x
  private _executandoTick: boolean = false; // Evita concorrência de loops

  constructor() {
    this.mapearInterface();
    this.configurarModal();
  }

  private configurarModal() {
    const $modal = document.getElementById('modal-aviao')!;
    const $btnAbrir = document.getElementById('btn-abrir-modal')!;
    const $btnFechar = document.getElementById('btn-fechar-modal')!;
    const $selectOperacao = document.getElementById('form-operacao') as HTMLSelectElement;
    const $campoCombustivel = document.getElementById('campo-combustivel')!;
    const $selectAlocacao = document.getElementById('form-alocacao') as HTMLSelectElement;
    const $form = document.getElementById('form-novo-aviao') as HTMLFormElement;

    // 1. Abrir o modal e renderizar as opções de prateleiras dinamicamente
    $btnAbrir.addEventListener('click', () => {
      // Limpa as opções manuais anteriores (mantendo apenas a automática)
      $selectAlocacao.innerHTML = '<option value="AUTOMATICA">Automática (Algoritmo da Torre)</option>';
      
      // Popula o select com todas as prateleiras existentes no sistema para escolha manual
      for (const contextoPista of this.torre.pistas) {
        const todasDaPista = [...contextoPista.prateleirasDecolagem, ...contextoPista.prateleirasPouso];
        todasDaPista.forEach(prat => {
          const opTexto = prat.operacaoPermitida === Operacao.DECOLAGEM ? "Decolagem" : "Pouso";
          const option = document.createElement('option');
          option.value = `manual-${prat.operacaoPermitida}-${prat.id}`;
          option.textContent = `Pista ${contextoPista.pista.id} - Fila ${opTexto} ${prat.id}`;
          $selectAlocacao.appendChild(option);
        });
      }

      $modal.classList.add('ativo');
    });

    // 2. Fechar o modal
    $btnFechar.addEventListener('click', () => $modal.classList.remove('ativo'));
    window.addEventListener('click', (e) => { if (e.target === $modal) $modal.classList.remove('ativo'); });

    // 3. Mostrar campo de combustível apenas se a operação for POUSO
    $selectOperacao.addEventListener('change', () => {
      $campoCombustivel.style.display = $selectOperacao.value === Operacao.POUSO ? 'flex' : 'none';
    });

    // 4. Lógica de Submissão do Formulário
    $form.addEventListener('submit', (e) => {
      e.preventDefault();

      const operacao = $selectOperacao.value as Operacao;
      const inputCombustivel = (document.getElementById('form-combustivel') as HTMLInputElement).value;
      const combustivel = operacao === Operacao.POUSO ? parseInt(inputCombustivel) : 0;
      const alocacaoEscolhida = $selectAlocacao.value;

      // Cria a instância do avião pela Torre
      const aviao = this.torre.novoAviao(operacao, combustivel);
      let prateleiraDestino: Prateleira;

      if (alocacaoEscolhida === "AUTOMATICA") {
        // Usa o algoritmo inteligente que você já fez
        prateleiraDestino = this.torre.processarAviao(aviao);
      } else {
        // Alocação MANUAL forçada pelo usuário
        const [_, opPrat, idPrat] = alocacaoEscolhida.split('-');
        
        // Busca a instância correta da prateleira dentro da Torre para injetar o avião
        let achou = false;
        for (const cp of this.torre.pistas) {
          const lista = opPrat === "DECOLAGEM" ? cp.prateleirasDecolagem : cp.prateleirasPouso;
          const correspondente = lista.find(p => p.id === parseInt(idPrat));
          if (correspondente) {
            prateleiraDestino = correspondente;
            prateleiraDestino.adicionar(aviao);
            
            // Força o registro histórico na mão
            this.torre.estatisticas.novoRegistro(
              this.torre.instante, aviao, "INICIOU" as any, aviao.operacao, cp.pista.id, prateleiraDestino.id
            );
            achou = true;
            break;
          }
        }
      }

      // Renderiza o avião criado na tela e fecha o modal
      this.renderizador.adicionarAviao(aviao, prateleiraDestino!);
      $modal.classList.remove('ativo');
      $form.reset();
      $campoCombustivel.style.display = 'none'; // Reseta visual do combustível
    });
  }

  mapearInterface() {
    for (const contextoPista of this.torre.pistas) {
      for (const prateleira of contextoPista.prateleirasDecolagem) {
        this.renderizador.adicionarPrateleira(
          prateleira,
          document.getElementById(
            `fila-decolagem-${prateleira.id}`,
          )! as HTMLUListElement,
        );
      }
      for (const prateleira of contextoPista.prateleirasPouso) {
        this.renderizador.adicionarPrateleira(
          prateleira,
          document.getElementById(
            `fila-pouso-${prateleira.id}`,
          )! as HTMLUListElement,
        );
      }
    }
    const $btnPlayPause = document.getElementById('btn-play-pause');
    $btnPlayPause?.addEventListener('click', () => this.alternarPausa());

    document.querySelectorAll('.btn-velocidade').forEach($btn => {
      $btn.addEventListener('click', (e) => {
        const vel = parseInt((e.target as HTMLButtonElement).dataset.vel!);
        this.alterarVelocidade(vel);
      });
    });

    // MAPEANDO O NOVO BOTÃO DE AVANÇAR PASSO MANUAL
    const $btnAvancarPasso = document.getElementById('btn-avancar-passo');
    $btnAvancarPasso?.addEventListener('click', () => {
      // Regra de segurança: Só avança se o simulador estiver PAUSADO
      if (this._pausado && !this._executandoTick) {
        this._executandoTick = true;
        this.avancarFase().then(() => {
          this._executandoTick = false;
        });
      }
    });

    this.renderizador.atualizarControlesDeTempo(this._pausado, this._velocidade);
  }

  get velocidade() {
    return this._velocidade;
  }
  get pausado() {
    return this._pausado;
  }
  get iniciado() {
    return this.torre.instante != 1;
  }

  alterarVelocidade(novaVelocidade: number) {
    if ([1, 2, 4].includes(novaVelocidade)) {
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
      console.log(
        `--- [Instante ${instanteAtual} - ÍMPAR] Fase de Chegada de Aeronaves ---`,
      );

      const qtdDecolagens = this.gerarNumeroAleatorio(0, 3);
      const qtdPousos = this.gerarNumeroAleatorio(0, 3);

      const operacoesParaGerar: Operacao[] = [];
      for (let i = 0; i < qtdDecolagens; i++)
        operacoesParaGerar.push(Operacao.DECOLAGEM);
      for (let i = 0; i < qtdPousos; i++)
        operacoesParaGerar.push(Operacao.POUSO);

      for (let i = operacoesParaGerar.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [operacoesParaGerar[i], operacoesParaGerar[j]] = [
          operacoesParaGerar[j],
          operacoesParaGerar[i],
        ];
      }

      for (const operacao of operacoesParaGerar) {
        const combustivel =
          operacao === Operacao.POUSO ? this.gerarNumeroAleatorio(1, 20) : 0;
        const aviao = this.torre.novoAviao(operacao, combustivel);
        const prateleira = this.torre.processarAviao(aviao);
        this.renderizador.adicionarAviao(aviao, prateleira);
      }
    } else {
      console.log(
        `--- [Instante ${instanteAtual} - PAR] Fase de Escoamento das Pistas ---`,
      );

      const avioesRemovidos = this.torre.processarPistas();

      for (const aviao of avioesRemovidos) {
        this.renderizador.removerAviao(aviao);
      }

      for (const contextoPista of this.torre.pistas) {
        for (const prateleira of contextoPista.prateleirasPouso) {
          const avioesEsperando = prateleira.toArray();
          for (const aviao of avioesEsperando) {
            this.renderizador.atualizarCombustivel(aviao);
          }
        }
      }

      this.renderizador.atualizarPainelEstatisticas(this.torre.estatisticas);
    }

    this.torre.passarTempo();
    const delayCalculado = this._tempoBaseFase / this._velocidade;
    await new Promise((resolve) => setTimeout(resolve, delayCalculado));
  }
}


const simulador = new Simulador();
const estadoAnteriorBotoes: Record<number, boolean> = {};

function verificarBotoes() {
  const controles = navigator.getGamepads();
  const controleXBox = controles[0]; 

  if (controleXBox) {
    // Botão A -> Alterna entre Play e Pause
    const botaoAAtual = controleXBox.buttons[0].pressed;
    if (botaoAAtual && !estadoAnteriorBotoes[0]) {
      simulador.alternarPausa();
    }
    estadoAnteriorBotoes[0] = botaoAAtual;

    // 2. D-Pad Direita -> Aumenta a velocidade
    const dPadDireita = controleXBox.buttons[15]?.pressed;
    if (dPadDireita && !estadoAnteriorBotoes[15]) {
      if (simulador.velocidade === 1) simulador.alterarVelocidade(2);
      else if (simulador.velocidade === 2) simulador.alterarVelocidade(4);
    }
    estadoAnteriorBotoes[15] = dPadDireita;

    // 3. D-Pad Esquerda -> Diminui a velocidade
    const dPadEsquerda = controleXBox.buttons[14]?.pressed;
    if (dPadEsquerda && !estadoAnteriorBotoes[14]) {
      if (simulador.velocidade === 4) simulador.alterarVelocidade(2);
      else if (simulador.velocidade === 2) simulador.alterarVelocidade(1);
    }
    estadoAnteriorBotoes[14] = dPadEsquerda;
  }

  requestAnimationFrame(verificarBotoes);
}

window.addEventListener('gamepadconnected', (evento) => {
  console.log('Controle conectado!');
  verificarBotoes();
});