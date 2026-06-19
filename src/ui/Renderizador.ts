import type { Estatisticas } from '../analytics/Estatisticas';
import type { Aviao } from '../core/Aviao';
import { Prateleira } from '../core/Prateleira';
import { Operacao } from '../types/Operacao';

export class Renderizador {
  private _prateleiras: Map<Prateleira, HTMLUListElement>;

  constructor() {
    this._prateleiras = new Map();
  }

  adicionarPrateleira(prateleira: Prateleira, $element: HTMLUListElement) {
    this._prateleiras.set(prateleira, $element);
  }

  adicionarAviao(aviao: Aviao, prateleira: Prateleira) {
    if (!this._prateleiras.has(prateleira)) return;
    const $prateleira = this._prateleiras.get(prateleira)!;

    const $listItem = document.createElement('li') as HTMLLIElement;
    $listItem.classList.add('app__prateleiras__fila__item');
    $listItem.id = `aviao-${aviao.id}`;

    const $icon = document.createElement('img') as HTMLImageElement;
    $icon.src =
      aviao.operacao == Operacao.DECOLAGEM
        ? '/icons/Decolar.svg'
        : '/icons/Aterrissar.svg';

    const $infoContainer = document.createElement('div');
    $infoContainer.classList.add('item-info');

    const $id = document.createElement('span') as HTMLSpanElement;
    $id.textContent = `#${aviao.id}`;

    const $combustivel = document.createElement('span') as HTMLSpanElement;
    $combustivel.classList.add('combustivel');
    $combustivel.id = `combustivel-aviao-${aviao.id}`;
    if (aviao.operacao === Operacao.POUSO) {
      $combustivel.textContent = `${aviao.combustivel}L`;
      if (aviao.combustivel === 0) {
        $combustivel.classList.add('alerta');
      }
    } else {
      $combustivel.textContent = `--`;
    }

    $infoContainer.appendChild($id);
    $infoContainer.appendChild($combustivel);

    $listItem.appendChild($icon);
    $listItem.appendChild($infoContainer);

    $prateleira.appendChild($listItem);
  }

  removerAviao(aviao: Aviao) {
    const $aviao = document.getElementById(
      `aviao-${aviao.id}`,
    ) as HTMLLIElement;

    if ($aviao) {
      $aviao.classList.add('saindo');

      setTimeout(() => {
        $aviao.remove();
      }, 400);
    }
  }

  atualizarCombustivel(aviao: Aviao) {
    if (aviao.operacao === Operacao.POUSO) {
      const $combustivel = document.getElementById(
        `combustivel-aviao-${aviao.id}`,
      );

      if ($combustivel) {
        $combustivel.textContent = `${aviao.combustivel}L`;

        if (aviao.combustivel <= 1) {
          $combustivel.classList.add('alerta');
        }
      }
    }
  }

  atualizarPainelEstatisticas(estatisticas: Estatisticas) {
        // Busca os elementos do bloco "Geral"
        const $mediaPousoGeral = document.querySelector('[data-media-pouso="geral"]');
        const $mediaDecolagemGeral = document.querySelector('[data-media-decolagem="geral"]');
        const $emergenciaGeral = document.querySelector('[data-avioes-emergencia="geral"]');

        // Atualiza os valores na tela
        if ($mediaPousoGeral) {
            $mediaPousoGeral.textContent = estatisticas.tempoMedioDePouso.toFixed(2);
        }
        
        if ($mediaDecolagemGeral) {
            $mediaDecolagemGeral.textContent = estatisticas.tempoMedioDeDecolagem.toFixed(2);
        }
        
        if ($emergenciaGeral) {
            $emergenciaGeral.textContent = estatisticas.avioesSemCombustivel.toString();
        }
    }

    atualizarControlesDeTempo(pausado: boolean, velocidade: number) {
        const $btnPlayPause = document.getElementById('btn-play-pause');
        if ($btnPlayPause) {
            $btnPlayPause.textContent = pausado ? "▶ Play" : "⏸ Pause";
        }

        // 1. Remove a classe 'ativo' de todos os botões de velocidade
        document.querySelectorAll('.btn-velocidade').forEach($btn => {
            $btn.classList.remove('ativo');
        });
        
        // 2. Adiciona a classe 'ativo' apenas no botão correspondente
        const $btnAtivo = document.getElementById(`btn-vel-${velocidade}`);
        if ($btnAtivo) {
            $btnAtivo.classList.add('ativo');
        }
    }
}
