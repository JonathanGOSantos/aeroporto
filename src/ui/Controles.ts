import type { Simulador } from '../core/Simulador';
import { Operacao } from '../types/Operacao';

export class Controles {
  private simulador: Simulador;
  private estadoAnteriorBotoes: Record<number, boolean> = {};

  constructor(simulador: Simulador) {
    this.simulador = simulador;
  }

  inicializar() {
    this.mapearPrateleiras();
    this.mapearBotoesTempo();
    this.configurarModal();
    this.iniciarLeituraGamepad();
  }

  private mapearPrateleiras() {
    // Acedemos à Torre e ao Renderizador através do Simulador
    const torre = this.simulador.torre;
    const renderizador = this.simulador.renderizador;

    for (const contextoPista of torre.pistas.values()) {
      for (const prateleira of contextoPista.prateleirasDecolagem) {
        renderizador.adicionarPrateleira(
          prateleira,
          document.getElementById(`fila-decolagem-${prateleira.id}`)! as HTMLUListElement
        );
      }
      for (const prateleira of contextoPista.prateleirasPouso) {
        renderizador.adicionarPrateleira(
          prateleira,
          document.getElementById(`fila-pouso-${prateleira.id}`)! as HTMLUListElement
        );
      }
    }
  }

  private mapearBotoesTempo() {
    const $btnPlayPause = document.getElementById('btn-play-pause');
    $btnPlayPause?.addEventListener('click', () => this.simulador.alternarPausa());

    const $btnAvancarPasso = document.getElementById('btn-avancar-passo');
    $btnAvancarPasso?.addEventListener('click', () => this.simulador.forcarAvancoManual());

    document.querySelectorAll('.btn-velocidade').forEach($btn => {
      $btn.addEventListener('click', (e) => {
        const vel = parseInt((e.target as HTMLButtonElement).dataset.vel!);
        this.simulador.alterarVelocidade(vel);
      });
    });

    // Atualização visual inicial
    this.simulador.renderizador.atualizarControlesDeTempo(this.simulador.pausado, this.simulador.velocidade);
  }

  private configurarModal() {
    const $modal = document.getElementById('modal-aviao')!;
    const $btnAbrir = document.getElementById('btn-abrir-modal')!;
    const $btnFechar = document.getElementById('btn-fechar-modal')!;
    const $selectOperacao = document.getElementById('form-operacao') as HTMLSelectElement;
    const $campoCombustivel = document.getElementById('campo-combustivel')!;
    const $selectAlocacao = document.getElementById('form-alocacao') as HTMLSelectElement;
    const $form = document.getElementById('form-novo-aviao') as HTMLFormElement;

    $btnAbrir.addEventListener('click', () => {
      $selectAlocacao.innerHTML = '<option value="AUTOMATICA">Automática (Algoritmo da Torre)</option>';
      
      for (const contextoPista of this.simulador.torre.pistas.values()) {
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

    $btnFechar.addEventListener('click', () => $modal.classList.remove('ativo'));
    window.addEventListener('click', (e) => { if (e.target === $modal) $modal.classList.remove('ativo'); });

    $selectOperacao.addEventListener('change', () => {
      $campoCombustivel.style.display = $selectOperacao.value === Operacao.POUSO ? 'flex' : 'none';
    });

    $form.addEventListener('submit', (e) => {
      e.preventDefault();
      const operacao = $selectOperacao.value as Operacao;
      const combustivel = operacao === Operacao.POUSO ? parseInt((document.getElementById('form-combustivel') as HTMLInputElement).value) : 0;
      const alocacaoEscolhida = $selectAlocacao.value;

      // Passa os dados brutos para o Simulador processar a lógica de negócio
      this.simulador.injetarAviaoManual(operacao, combustivel, alocacaoEscolhida);

      $modal.classList.remove('ativo');
      $form.reset();
      $campoCombustivel.style.display = 'none';
    });
  }

  private iniciarLeituraGamepad() {
    window.addEventListener("gamepadconnected", (evento) => {
      console.log(`Controle conectado: ${evento.gamepad.id}`);
      this.verificarBotoesGamepad();
    });
  }

  private verificarBotoesGamepad = () => {
    const controles = navigator.getGamepads();
    const controleXBox = controles[0]; 

    if (controleXBox) {
      const botaoAAtual = controleXBox.buttons[0].pressed;
      if (botaoAAtual && !this.estadoAnteriorBotoes[0]) {
        if (this.simulador.pausado) {
          this.simulador.forcarAvancoManual();
        } else {
          this.simulador.alternarPausa();
        }
      }
      this.estadoAnteriorBotoes[0] = botaoAAtual;
    }

    requestAnimationFrame(this.verificarBotoesGamepad);
  }
}