// O juiz. Tres maneiras de responder a mesma pergunta, nenhuma compartilhando
// codigo com a enumeracao de `diamante.js`:
//
//   1. a formula fechada 2^(n(n+1)/2), que nao olha o tabuleiro;
//   2. uma contagem por PERFIL, que varre coluna a coluna carregando quais
//      casas da proxima linha ja estao presas por um domino em pe — codigo
//      inteiramente diferente da busca, e que alcanca ordens onde a enumeracao
//      nao chega;
//   3. um conferidor de ladrilhamento, que recebe o vetor de orientacoes e
//      remonta os dominos do zero para ver se cobrem tudo, sem sobrepor e sem
//      sair do losango.
//
// Tambem mora aqui a PREVISAO do circulo artico, que e a coisa a ser julgada
// pelas medidas, e nao o contrario.

import { lado, mascara, casas, HORIZONTAL, VERTICAL, LIVRE } from './diamante.js';

/** A formula de Elkies, Kuperberg, Larsen e Propp: 2^(n(n+1)/2). */
export function formula(n) {
  return 2n ** BigInt((n * (n + 1)) / 2);
}

/**
 * Conta os ladrilhamentos varrendo casa a casa com um perfil de bits.
 *
 * O estado e: quais casas da linha de baixo ja foram presas por um domino em pe
 * comecado na linha de cima. Dentro da linha, a recursao anda da esquerda para a
 * direita e decide por casa: ja presa, deitada (consome a vizinha da direita) ou
 * em pe (prende a de baixo).
 *
 * Nao compartilha nem a ordem das casas com a busca de `diamante.js`.
 */
export function contarPorPerfil(n) {
  const l = lado(n);
  const dentro = mascara(n);

  let atual = new Map([[0, 1n]]);

  for (let j = 0; j < l; j++) {
    const proximo = new Map();

    const anda = (i, presas, emPe, quantidade) => {
      if (i === l) {
        proximo.set(emPe, (proximo.get(emPe) ?? 0n) + quantidade);
        return;
      }
      const c = j * l + i;
      const bit = 1 << i;

      if (!dentro[c]) {
        // casa de fora: ninguem pode ter prendido ela
        if (!(presas & bit)) anda(i + 1, presas, emPe, quantidade);
        return;
      }
      if (presas & bit) {
        anda(i + 1, presas, emPe, quantidade);
        return;
      }
      // em pe: prende a casa de baixo
      if (j + 1 < l && dentro[c + l]) anda(i + 1, presas, emPe | bit, quantidade);
      // deitada: consome a casa da direita, que nao pode estar presa
      if (i + 1 < l && dentro[c + 1] && !(presas & (bit << 1))) {
        anda(i + 2, presas, emPe, quantidade);
      }
    };

    for (const [presas, quantidade] of atual) anda(0, presas, 0, quantidade);
    atual = proximo;
  }

  return atual.get(0) ?? 0n;
}

/**
 * Confere um ladrilhamento do zero: remonta os dominos a partir do vetor de
 * orientacoes e exige que cada casa de dentro seja coberta exatamente uma vez,
 * que nenhuma casa de fora seja tocada, e que todo domino caiba no losango.
 */
export function ladrilhamentoValido(n, orientacao) {
  const l = lado(n);
  const dentro = mascara(n);
  const coberto = new Uint8Array(l * l);
  let dominos = 0;

  for (let c = 0; c < l * l; c++) {
    if (!dentro[c] && orientacao[c] !== LIVRE) return false;
    if (dentro[c] && orientacao[c] === LIVRE) return false;
  }

  for (let j = 0; j < l; j++) {
    for (let i = 0; i < l; i++) {
      const c = j * l + i;
      if (!dentro[c] || coberto[c]) continue;
      if (orientacao[c] === HORIZONTAL) {
        if (i + 1 >= l || !dentro[c + 1] || orientacao[c + 1] !== HORIZONTAL || coberto[c + 1]) return false;
        coberto[c] = 1;
        coberto[c + 1] = 1;
      } else if (orientacao[c] === VERTICAL) {
        if (j + 1 >= l || !dentro[c + l] || orientacao[c + l] !== VERTICAL || coberto[c + l]) return false;
        coberto[c] = 1;
        coberto[c + l] = 1;
      } else {
        return false;
      }
      dominos++;
    }
  }

  for (let c = 0; c < l * l; c++) if (dentro[c] !== coberto[c]) return false;
  return dominos === casas(n) / 2;
}

/**
 * A previsao do circulo artico.
 *
 * Com o diamante encolhido para |x| + |y| <= 1, o teorema diz que a regiao que
 * continua variando tende ao disco x^2 + y^2 <= 1/2, e que tudo fora dele
 * congela. Esta funcao devolve, para cada casa, se o CIRCULO a da por congelada.
 *
 * O centro da casa (i, j) fica em ((i - n + 0,5)/n, (j - n + 0,5)/n).
 */
export function previsaoDoCirculo(n) {
  const l = lado(n);
  const dentro = mascara(n);
  const prevista = new Uint8Array(l * l);
  for (let j = 0; j < l; j++) {
    for (let i = 0; i < l; i++) {
      const c = j * l + i;
      if (!dentro[c]) continue;
      const x = (i - n + 0.5) / n;
      const y = (j - n + 0.5) / n;
      prevista[c] = x * x + y * y > 0.5 ? 1 : 0;
    }
  }
  return prevista;
}

/**
 * A fracao de area que o circulo artico deixa congelada no limite: o losango
 * tem area 2 e o disco inscrito tem area pi/2, entao sobra 1 - pi/4.
 */
export const FRACAO_CONGELADA_NO_LIMITE = 1 - Math.PI / 4;
