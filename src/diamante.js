// O diamante asteca: o losango de casas quadradas que se obtem empilhando
// linhas de 2, 4, 6, ..., 2n, 2n, ..., 6, 4, 2 casas, centradas.
//
// A ordem n tem 2n(n+1) casas e exatamente 2^(n(n+1)/2) maneiras de cobri-lo
// com dominos. A formula e de 1992 (Elkies, Kuperberg, Larsen e Propp) e e o
// primeiro juiz daqui: a enumeracao tem de chegar nela sozinha.
//
// O que o repositorio persegue nao e a contagem, que ja tem formula. E o
// CIRCULO ARTICO: num ladrilhamento sorteado, as quatro pontas do losango ficam
// congeladas num padrao de tijolo, e a regiao que ainda varia tende a um circulo
// inscrito. A pergunta e onde esse circulo esta de verdade em ordem pequena, e
// quanto ele erra como previsao.

/** O lado da grade quadrada que contem o diamante de ordem n. */
export function lado(n) {
  return 2 * n;
}

/**
 * A mascara do diamante: um Uint8Array de lado^2, com 1 nas casas de dentro.
 *
 * A linha j tem alcance a = min(j+1, 2n-j), e vai da coluna n-a ate n+a-1.
 */
export function mascara(n) {
  const l = lado(n);
  const dentro = new Uint8Array(l * l);
  for (let j = 0; j < l; j++) {
    const alcance = Math.min(j + 1, l - j);
    for (let i = n - alcance; i < n + alcance; i++) dentro[j * l + i] = 1;
  }
  return dentro;
}

/** Quantas casas tem o diamante de ordem n: 2n(n+1). */
export function casas(n) {
  return 2 * n * (n + 1);
}

/** A ordem das casas em que a busca as preenche: linha por linha, da esquerda. */
export function ordemDasCasas(n) {
  const l = lado(n);
  const dentro = mascara(n);
  const ordem = [];
  for (let c = 0; c < l * l; c++) if (dentro[c]) ordem.push(c);
  return ordem;
}

export const LIVRE = 0;
export const HORIZONTAL = 1;
export const VERTICAL = 2;

/**
 * Percorre TODOS os ladrilhamentos por domino do diamante de ordem n.
 *
 * Chama `visita(orientacao, ancora, l)` em cada um:
 *
 *   orientacao[c]  deitado (HORIZONTAL) ou em pe (VERTICAL)
 *   ancora[c]      a casa de cima-esquerda do domino que cobre c
 *
 * A ancora existe porque a orientacao sozinha nao diz onde um domino comeca:
 * quatro casas deitadas em fila podem ser dois dominos de dois jeitos de ler, e
 * quem quiser saber se um bloco 2x2 e giravel precisa saber onde cada um comeca.
 *
 * Os dois vetores sao REUSADOS entre as visitas, de proposito: sao milhoes de
 * ladrilhamentos e copiar cada um custaria mais que a busca. Quem visita pode
 * ler, e nao pode guardar. Para guardar, `orientacao.slice()`.
 *
 * Devolve o total de ladrilhamentos.
 *
 * A busca sempre preenche a PRIMEIRA casa livre. Com isso cada ladrilhamento
 * aparece uma vez so: a escolha em cada nivel e sobre uma casa fixa, e nao sobre
 * "qual domino por agora".
 */
export function paraCadaLadrilhamento(n, visita) {
  const l = lado(n);
  const dentro = mascara(n);
  const ordem = ordemDasCasas(n);
  const ocupado = new Uint8Array(l * l);
  const orientacao = new Int8Array(l * l);
  const ancora = new Int32Array(l * l).fill(-1);
  let total = 0;

  function busca(k) {
    while (k < ordem.length && ocupado[ordem[k]]) k++;
    if (k === ordem.length) {
      total++;
      if (visita) visita(orientacao, ancora, l);
      return;
    }
    const c = ordem[k];
    const i = c % l;

    if (i + 1 < l && dentro[c + 1] && !ocupado[c + 1]) {
      ocupado[c] = 1;
      ocupado[c + 1] = 1;
      orientacao[c] = HORIZONTAL;
      orientacao[c + 1] = HORIZONTAL;
      ancora[c] = c;
      ancora[c + 1] = c;
      busca(k + 1);
      ocupado[c] = 0;
      ocupado[c + 1] = 0;
      orientacao[c] = LIVRE;
      orientacao[c + 1] = LIVRE;
      ancora[c] = -1;
      ancora[c + 1] = -1;
    }

    if (c + l < l * l && dentro[c + l] && !ocupado[c + l]) {
      ocupado[c] = 1;
      ocupado[c + l] = 1;
      orientacao[c] = VERTICAL;
      orientacao[c + l] = VERTICAL;
      ancora[c] = c;
      ancora[c + l] = c;
      busca(k + 1);
      ocupado[c] = 0;
      ocupado[c + l] = 0;
      orientacao[c] = LIVRE;
      orientacao[c + l] = LIVRE;
      ancora[c] = -1;
      ancora[c + l] = -1;
    }
  }

  busca(0);
  return total;
}

/** Todos os ladrilhamentos como copias independentes. So para ordem pequena. */
export function ladrilhamentos(n) {
  const todos = [];
  paraCadaLadrilhamento(n, (orientacao) => todos.push(orientacao.slice()));
  return todos;
}

/**
 * Conta os ladrilhamentos pela enumeracao, sem guardar nenhum.
 *
 * Em ordem 6 sao 2.097.152 ladrilhamentos; a partir da 7 a enumeracao deixa de
 * ser caminho e quem conta e o perfil, no juiz.
 */
export function contarPorEnumeracao(n) {
  return paraCadaLadrilhamento(n, null);
}
