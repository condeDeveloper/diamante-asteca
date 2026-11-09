// As tabelas do README. Todo numero daqui sai de um metodo; nenhum e digitado.

import { casas, contarPorEnumeracao, lado, mascara } from './diamante.js';
import { formula, contarPorPerfil, FRACAO_CONGELADA_NO_LIMITE } from './juiz.js';
import {
  estatisticas,
  regiaoCongelada,
  compararComOCirculo,
  blocosGiraveis,
  extremo,
} from './varredura.js';

/** C(m, k) exato, em BigInt. */
export function binomial(m, k) {
  if (k < 0 || k > m) return 0n;
  let r = 1n;
  for (let i = 0; i < k; i++) r = (r * BigInt(m - i)) / BigInt(i + 1);
  return r;
}

/** Tabela 1 — tres contagens para a mesma pergunta. */
export function tabelaContagens(ateEnumeracao = 6, atePerfil = 10) {
  const linhas = [];
  for (let n = 1; n <= atePerfil; n++) {
    const enumeracao = n <= ateEnumeracao ? BigInt(contarPorEnumeracao(n)) : null;
    const perfil = contarPorPerfil(n);
    const fechada = formula(n);
    linhas.push({
      n,
      casas: casas(n),
      enumeracao,
      perfil,
      formula: fechada,
      batem: (enumeracao === null || enumeracao === perfil) && perfil === fechada,
    });
  }
  return linhas;
}

/**
 * Tabela 2 — o histograma dos dominos deitados contra os binomiais.
 *
 * O numero de dominos deitados e sempre PAR, e a quantidade de ladrilhamentos
 * com 2j deles e exatamente C(m, j), com m = n(n+1)/2. Somar os binomiais da
 * 2^m, que e a formula fechada: a varredura reencontra a formula sozinha, pelo
 * caminho mais longo.
 */
export function tabelaHistograma(ate = 6) {
  const linhas = [];
  for (let n = 1; n <= ate; n++) {
    const e = estatisticas(n);
    const m = (n * (n + 1)) / 2;
    let binomialBate = true;
    let imparesNaoZero = 0;
    let soma = 0n;
    for (let k = 0; k <= e.dominos; k++) {
      const quantos = e.histograma[k];
      soma += BigInt(quantos);
      if (k % 2 === 1) {
        if (quantos !== 0) imparesNaoZero++;
      } else if (BigInt(quantos) !== binomial(m, k / 2)) {
        binomialBate = false;
      }
    }
    linhas.push({
      n,
      m,
      total: e.total,
      soma,
      binomialBate,
      imparesNaoZero,
      somaDosBinomiais: 2n ** BigInt(m),
    });
  }
  return linhas;
}

/** Tabela 3 — a casa mais decidida do diamante contra 1 - 2^(-n). */
export function tabelaExtremo(ate = 6) {
  const linhas = [];
  for (let n = 1; n <= ate; n++) linhas.push(extremo(n));
  return linhas;
}

/** Tabela 4 — o circulo artico como previsao, sem limiar nenhum. */
export function tabelaCirculo(ate = 6) {
  const linhas = [];
  for (let n = 2; n <= ate; n++) {
    const c = compararComOCirculo(n, 1);
    linhas.push({
      n,
      casas: c.casas,
      previstasCongeladas: c.previstasCongeladas,
      fracaoPrevista: c.fracaoPrevista,
      desvioFora: c.desvioForaDoCirculo,
      desvioDentro: c.desvioDentroDoCirculo,
      razao: c.razaoDosDesvios,
    });
  }
  return linhas;
}

/**
 * Tabela 5 — quanta casa fica "quase congelada" em cada limiar.
 *
 * O limiar 1, que exige unanimidade, devolve ZERO casas em toda ordem varrida:
 * nem as pontas sao forcadas. O congelamento do circulo artico e probabilidade,
 * nao certeza, e e por isso que esta tabela existe.
 */
export function tabelaLimiares(ate = 6, limiares = [1, 0.95, 0.9, 0.75]) {
  const linhas = [];
  for (let n = 2; n <= ate; n++) {
    const linha = { n, casas: casas(n), fracoes: {} };
    for (const limiar of limiares) {
      const r = regiaoCongelada(n, limiar);
      linha.fracoes[limiar] = { quantas: r.quantas, fracao: r.fracao };
    }
    linhas.push(linha);
  }
  return { linhas, limiares, noLimite: FRACAO_CONGELADA_NO_LIMITE };
}

/**
 * Tabela 6 — os blocos 2x2 que podem ser girados no lugar.
 *
 * O minimo e n e o maximo e n(n+1)/2, cravados em toda ordem varrida — e esse
 * n(n+1)/2 e o mesmo expoente da formula fechada e o mesmo m dos binomiais do
 * histograma. O numero aparece tres vezes, por tres caminhos que nao se falam.
 */
export function tabelaBlocos(ate = 6) {
  const linhas = [];
  for (let n = 1; n <= ate; n++) {
    const b = blocosGiraveis(n);
    const m = (n * (n + 1)) / 2;
    linhas.push({
      n,
      total: b.total,
      media: b.media,
      minimo: b.minimo,
      maximo: b.maximo,
      m,
      minimoEhN: b.minimo === n,
      maximoEhM: b.maximo === m,
    });
  }
  return linhas;
}

/**
 * O mapa de probabilidade: para cada casa, em que fracao dos ladrilhamentos ela
 * esta deitada. Devolve uma linha de texto por linha do diamante.
 */
export function mapa(n) {
  const l = lado(n);
  const dentro = mascara(n);
  const { total, deitadas } = estatisticas(n);
  const linhas = [];
  for (let j = 0; j < l; j++) {
    let linha = '';
    for (let i = 0; i < l; i++) {
      const c = j * l + i;
      linha += dentro[c] ? ((deitadas[c] / total) * 100).toFixed(1).padStart(6) : '     .';
    }
    linhas.push(linha);
  }
  return linhas;
}
