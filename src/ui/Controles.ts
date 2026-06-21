import type { Simulador } from '../core/Simulador';

export class Controles {
  private simulador: Simulador;

  constructor(simulador: Simulador) {
    this.simulador = simulador;
  }

  inicializar() {
    this.mapearPrateleiras();
    this.mapearBotoesTempo();
  }

  private mapearPrateleiras() {
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
    const $btnPlayPause = document.getElementById('btn-play-pause')!;
    $btnPlayPause.addEventListener('click', () => this.simulador.alternarPausa());

    const $btnAvancarPasso = document.getElementById('btn-avancar-passo')!;
    $btnAvancarPasso!.addEventListener('click', () => this.simulador.forcarAvancoManual());

    document.querySelectorAll('.btn-velocidade').forEach($btn => {
      $btn.addEventListener('click', (e) => {
        const vel = parseInt((e.target as HTMLButtonElement).dataset.vel!);
        this.simulador.alterarVelocidade(vel);
      });
    });

    this.simulador.renderizador.atualizarControlesDeTempo(this.simulador.pausado, this.simulador.velocidade);
  }
}