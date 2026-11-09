// O comportamento. Nada de tabela aqui: isto e o que o diamante e, o que um
// ladrilhamento e, e o que o juiz diz sobre os dois.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  lado,
  mascara,
  casas,
  ordemDasCasas,
  ladrilhamentos,
  contarPorEnumeracao,
  paraCadaLadrilhamento,
  HORIZONTAL,
  VERTICAL,
  LIVRE,
} from '../src/diamante.js';
import {
  formula,
  contarPorPerfil,
  ladrilhamentoValido,
  previsaoDoCirculo,
  FRACAO_CONGELADA_NO_LIMITE,
} from '../src/juiz.js';

test('o diamante de ordem n tem 2n(n+1) casas', () => {
  for (let n = 1; n <= 8; n++) {
    const dentro = mascara(n);
    const quantas = dentro.reduce((s, x) => s + x, 0);
    assert.equal(quantas, casas(n));
    assert.equal(quantas, 2 * n * (n + 1));
  }
});

test('as linhas do diamante tem 2, 4, ..., 2n, 2n, ..., 4, 2 casas', () => {
  const n = 4;
  const l = lado(n);
  const dentro = mascara(n);
  const larguras = [];
  for (let j = 0; j < l; j++) {
    let w = 0;
    for (let i = 0; i < l; i++) w += dentro[j * l + i];
    larguras.push(w);
  }
  assert.deepEqual(larguras, [2, 4, 6, 8, 8, 6, 4, 2]);
});

test('cada linha do diamante e um bloco contiguo e centrado', () => {
  for (let n = 1; n <= 6; n++) {
    const l = lado(n);
    const dentro = mascara(n);
    for (let j = 0; j < l; j++) {
      const colunas = [];
      for (let i = 0; i < l; i++) if (dentro[j * l + i]) colunas.push(i);
      assert.ok(colunas.length > 0);
      for (let k = 1; k < colunas.length; k++) assert.equal(colunas[k], colunas[k - 1] + 1);
      assert.equal(colunas[0] + colunas[colunas.length - 1], l - 1); // centrado
    }
  }
});

test('a ordem das casas tem exatamente as casas de dentro, sem repetir', () => {
  for (let n = 1; n <= 6; n++) {
    const ordem = ordemDasCasas(n);
    assert.equal(ordem.length, casas(n));
    assert.equal(new Set(ordem).size, casas(n));
  }
});

test('a ordem 1 tem exatamente dois ladrilhamentos: deitado e em pe', () => {
  const todos = ladrilhamentos(1);
  assert.equal(todos.length, 2);
  const tipos = todos.map((o) => o.filter((x) => x !== LIVRE)[0]).sort();
  assert.deepEqual(tipos, [HORIZONTAL, VERTICAL]);
});

test('todo ladrilhamento enumerado passa pelo conferidor do juiz', () => {
  for (let n = 1; n <= 4; n++) {
    for (const o of ladrilhamentos(n)) {
      assert.equal(ladrilhamentoValido(n, o), true);
    }
  }
});

test('nenhum ladrilhamento sai repetido da enumeracao', () => {
  for (let n = 1; n <= 5; n++) {
    const todos = ladrilhamentos(n).map((o) => o.join(''));
    assert.equal(new Set(todos).size, todos.length);
  }
});

test('o conferidor recusa casa descoberta, casa de fora e domino meia-boca', () => {
  const n = 2;
  const bom = ladrilhamentos(n)[0];
  assert.equal(ladrilhamentoValido(n, bom), true);

  const descoberto = bom.slice();
  const primeira = descoberto.findIndex((x) => x !== LIVRE);
  descoberto[primeira] = LIVRE;
  assert.equal(ladrilhamentoValido(n, descoberto), false);

  const foraDoLosango = bom.slice();
  const l = lado(n);
  const dentro = mascara(n);
  const deFora = dentro.findIndex((x) => x === 0);
  foraDoLosango[deFora] = HORIZONTAL;
  assert.equal(ladrilhamentoValido(n, foraDoLosango), false);
  assert.ok(l > 0);

  const meiaBoca = bom.slice();
  meiaBoca[primeira] = meiaBoca[primeira] === HORIZONTAL ? VERTICAL : HORIZONTAL;
  assert.equal(ladrilhamentoValido(n, meiaBoca), false);
});

test('a ancora aponta sempre para a casa de cima-esquerda do proprio domino', () => {
  const n = 3;
  const l = lado(n);
  paraCadaLadrilhamento(n, (orientacao, ancora) => {
    for (let c = 0; c < l * l; c++) {
      if (orientacao[c] === LIVRE) continue;
      const a = ancora[c];
      assert.ok(a === c || a === c - 1 || a === c - l);
      assert.equal(orientacao[a], orientacao[c]);
      const par = orientacao[c] === HORIZONTAL ? a + 1 : a + l;
      assert.ok(c === a || c === par);
    }
  });
});

test('as tres contagens concordam de n=1 a n=5', () => {
  for (let n = 1; n <= 5; n++) {
    const enumeracao = BigInt(contarPorEnumeracao(n));
    assert.equal(enumeracao, contarPorPerfil(n));
    assert.equal(enumeracao, formula(n));
  }
});

test('a formula e 2 elevado ao n-esimo numero triangular', () => {
  assert.equal(formula(1), 2n);
  assert.equal(formula(2), 8n);
  assert.equal(formula(3), 64n);
  assert.equal(formula(4), 1024n);
  assert.equal(formula(10), 2n ** 55n);
});

test('a previsao do circulo congela as quatro pontas e deixa o meio livre', () => {
  const n = 6;
  const l = lado(n);
  const prevista = previsaoDoCirculo(n);
  assert.equal(prevista[0 * l + (n - 1)], 1); // ponta de cima
  assert.equal(prevista[(l - 1) * l + n], 1); // ponta de baixo
  assert.equal(prevista[n * l + 0], 1); // ponta da esquerda
  assert.equal(prevista[(n - 1) * l + (l - 1)], 1); // ponta da direita
  assert.equal(prevista[n * l + n], 0); // o meio
});

test('o circulo deixa 1 - pi/4 do losango congelado no limite', () => {
  assert.equal(FRACAO_CONGELADA_NO_LIMITE.toFixed(4), '0.2146');
  assert.ok(FRACAO_CONGELADA_NO_LIMITE > 0 && FRACAO_CONGELADA_NO_LIMITE < 1);
});

test('o perfil e a formula batem ate a ordem 9, onde a enumeracao nao chega', () => {
  for (let n = 6; n <= 9; n++) {
    assert.equal(contarPorPerfil(n), formula(n), 'n=' + n);
  }
});
