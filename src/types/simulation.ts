export interface SimuladorConfig {
  probabilidadePouso: number;     // 0.0 a 1.0
  probabilidadeDecolagem: number; // 0.0 a 1.0
  combustivelMaximo: number;      // Padrão: 20
  intervaloTickMs: number;        // Velocidade da simulação
}

export interface MetricasSimulacao {
  totalPousos: number;
  totalDecolagens: number;
  tempoEsperaTotalPouso: number;
  tempoEsperaTotalDecolagem: number;
  totalQuedas: number;
  totalPousosSemCombustivel: number;
}