// A varredura: todos os ladrilhamentos do diamante, um por um, acumulando o que
// cada casa faz na colecao inteira.
//
// E daqui que sai o circulo artico medido. Ele costuma ser descrito como um
// fenomeno de ladrilhamento SORTEADO; aqui nao se sorteia nada — a estatistica
// e sobre o conjunto completo, que e a mesma coisa e nao depende de gerador.

import { lado, mascara, casas, paraCadaLadrilhamento, HORIZONTAL, VERTICAL } from './diamante.js';
import { previsaoDoCirculo } from './juiz.js';

/**
 * Para cada casa, em quantos ladrilhamentos ela e coberta por domino deitado.
 *
 * Devolve tambem o histograma de quantos dominos deitados cada ladrilhamento
 * tem. Como girar o losango em 90 graus troca deitado por em pe e leva o
 * diamante nele mesmo, esse histograma TEM de ser simetrico — e e o segundo
 * jeito de ver que a enumeracao nao perdeu nem repetiu ladrilhamento.
 */
export function estatisticas(n) {
  const l = lado(n);
  const dentro = mascara(n);
  const deitadas = new Float64Array(l * l);
  const dominos = casas(n) / 2;
  const histograma = new Float64Array(dominos + 1);
  let total = 0;

  paraCadaLadrilhamento(n, (orientacao) => {
    total++;
    let deitados = 0;
    for (let c = 0; c < l * l; c++) {
      if (!dentro[c]) continue;
      if (orientacao[c] === HORIZONTAL) {
        deitadas[c]++;
        deitados++;
      }
    }
    histograma[deitados / 2]++;
  });

  return { n, total, deitadas, histograma: Array.from(histograma), dominos };
}

/**
 * A regiao congelada MEDIDA: as casas que, na colecao inteira, estao sempre
 * deitadas ou sempre em pe.
 *
 * `limiar` afrouxa a exigencia: 1 pede unanimidade, 0,99 aceita uma casa que
 * varia em menos de 1% dos ladrilhamentos. As duas leituras entram na tabela,
 * porque a diferenca entre elas e a propria espessura da borda.
 */
export function regiaoCongelada(n, limiar = 1) {
  const l = lado(n);
  const dentro = mascara(n);
  const { total, deitadas } = estatisticas(n);
  const congelada = new Uint8Array(l * l);
  let quantas = 0;
  let deDentro = 0;

  for (let c = 0; c < l * l; c++) {
    if (!dentro[c]) continue;
    deDentro++;
    const p = deitadas[c] / total;
    if (p >= limiar || p <= 1 - limiar) {
      congelada[c] = 1;
      quantas++;
    }
  }

  return { n, total, congelada, quantas, casas: deDentro, fracao: quantas / deDentro };
}

/**
 * O circulo como PREVISAO, medido contra a varredura.
 *
 * Quatro numeros: acertos nas congeladas, acertos nas livres, e os dois tipos
 * de erro. O circulo e um teorema sobre o limite, e em ordem pequena ele erra —
 * saber de que lado ele erra e a pergunta que a tabela responde.
 */
export function compararComOCirculo(n, limiar = 1) {
  const l = lado(n);
  const dentro = mascara(n);
  const { congelada, total, casas: deDentro } = regiaoCongelada(n, limiar);
  const prevista = previsaoDoCirculo(n);

  let acertoCongelada = 0;
  let acertoLivre = 0;
  let previuCongeladaEstaLivre = 0;
  let previuLivreEstaCongelada = 0;

  for (let c = 0; c < l * l; c++) {
    if (!dentro[c]) continue;
    if (prevista[c] && congelada[c]) acertoCongelada++;
    else if (!prevista[c] && !congelada[c]) acertoLivre++;
    else if (prevista[c] && !congelada[c]) previuCongeladaEstaLivre++;
    else previuLivreEstaCongelada++;
  }

  // A leitura sem limiar: de quanto a casa foge do meio-a-meio, dentro e fora
  // do circulo. Nao depende de escolher um corte, e e ela que melhora com n.
  const { deitadas } = estatisticas(n);
  let somaFora = 0;
  let somaDentro = 0;
  let nFora = 0;
  let nDentro = 0;
  for (let c = 0; c < l * l; c++) {
    if (!dentro[c]) continue;
    const desvio = Math.abs(deitadas[c] / total - 0.5);
    if (prevista[c]) {
      somaFora += desvio;
      nFora++;
    } else {
      somaDentro += desvio;
      nDentro++;
    }
  }

  const acertos = acertoCongelada + acertoLivre;
  return {
    desvioForaDoCirculo: nFora ? somaFora / nFora : 0,
    desvioDentroDoCirculo: nDentro ? somaDentro / nDentro : 0,
    razaoDosDesvios: nDentro && somaDentro ? (somaFora / nFora) / (somaDentro / nDentro) : Infinity,
    n,
    total,
    casas: deDentro,
    acertoCongelada,
    acertoLivre,
    previuCongeladaEstaLivre,
    previuLivreEstaCongelada,
    acertos,
    taxa: acertos / deDentro,
    previstasCongeladas: acertoCongelada + previuCongeladaEstaLivre,
    fracaoPrevista: (acertoCongelada + previuCongeladaEstaLivre) / deDentro,
  };
}

/**
 * As casas que nunca mudam de orientacao: quantas sao, e quais.
 *
 * Em todo diamante as quatro casas das pontas sao forcadas — a linha de cima
 * tem duas casas e cabe um domino so. A pergunta e quanto esse nucleo forcado
 * cresce com a ordem.
 */
export function casasForcadas(n) {
  const l = lado(n);
  const dentro = mascara(n);
  const { total, deitadas } = estatisticas(n);
  const lista = [];
  for (let c = 0; c < l * l; c++) {
    if (!dentro[c]) continue;
    const d = deitadas[c];
    if (d === 0 || d === total) {
      lista.push({ i: c % l, j: Math.floor(c / l), sempre: d === total ? 'deitada' : 'em pe' });
    }
  }
  return { n, total, quantas: lista.length, casas: lista };
}

/**
 * Quantos blocos 2x2 de um ladrilhamento guardam DOIS dominos paralelos
 * inteiros — os lugares onde o ladrilhamento pode ser girado no lugar, sem
 * mexer em mais nada.
 *
 * E a medida de quanta corda o ladrilhamento ainda tem. Um ladrilhamento todo
 * congelado nao teria nenhum bloco desses; a media sobre a colecao inteira diz
 * quanta liberdade sobra em cada ordem.
 *
 * A ancora e indispensavel aqui: quatro casas deitadas em fila sao dois dominos,
 * e sem saber onde cada um comeca da para contar bloco que nao existe.
 */
export function blocosGiraveis(n) {
  const l = lado(n);
  const dentro = mascara(n);
  let soma = 0;
  let minimo = Infinity;
  let maximo = 0;
  let total = 0;

  paraCadaLadrilhamento(n, (orientacao, ancora) => {
    total++;
    let blocos = 0;
    for (let j = 0; j + 1 < l; j++) {
      for (let i = 0; i + 1 < l; i++) {
        const a = j * l + i;
        const b = a + 1;
        const c = a + l;
        const d = c + 1;
        if (!dentro[a] || !dentro[b] || !dentro[c] || !dentro[d]) continue;
        const deitados =
          ancora[a] === a && ancora[b] === a && ancora[c] === c && ancora[d] === c &&
          orientacao[a] === HORIZONTAL;
        const emPe =
          ancora[a] === a && ancora[c] === a && ancora[b] === b && ancora[d] === b &&
          orientacao[a] === VERTICAL;
        if (deitados || emPe) blocos++;
      }
    }
    soma += blocos;
    if (blocos < minimo) minimo = blocos;
    if (blocos > maximo) maximo = blocos;
  });

  return { n, total, media: soma / total, minimo, maximo };
}

/**
 * A casa mais decidida do diamante, que e sempre uma das quatro pontas.
 *
 * A ponta de cima e coberta por domino deitado em 1 - 2^(-n) dos
 * ladrilhamentos. Nao e aproximacao: e igualdade, e ela aparece sozinha na
 * varredura, em toda ordem conferida.
 */
export function extremo(n) {
  const l = lado(n);
  const dentro = mascara(n);
  const { total, deitadas } = estatisticas(n);
  let maior = 0;
  for (let c = 0; c < l * l; c++) {
    if (!dentro[c]) continue;
    const p = deitadas[c] / total;
    if (p > maior) maior = p;
  }
  return {
    n,
    total,
    pontaNorte: deitadas[n - 1] / total,
    maior,
    previsto: 1 - 2 ** -n,
    bate: Math.abs(maior - (1 - 2 ** -n)) < 1e-12,
  };
}
