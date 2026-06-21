import { Simulador } from './core/Simulador';
import './style.scss';
import { Controles } from './ui/Controles';

const simulador = new Simulador();
const controles = new Controles(simulador);
controles.inicializar();

console.log("Simulador de Aeroporto Inicializado com Sucesso!");

const $btnExportar = document.getElementById("btn-exportar")!;
$btnExportar.addEventListener("click", () => simulador.torre.estatisticas.exportar());
  
