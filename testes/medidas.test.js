// Os numeros do README, presos. Se o codigo mudar e um numero mudar, isto
// quebra antes de o README virar mentira.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  binomial,
  tabelaContagens,
  tabelaHistograma,
  tabelaExtremo,
  tabelaCirculo,
  tabelaLimiares,
  tabelaBlocos,
  mapa,
} from '../src/medidas.js';

const MINUTO = 120_000;

test('as tres contagens batem ate a ordem 10, e a ordem 6 tem 2.097.152', { timeout: MINUTO }, () => {
  const linhas = tabelaContagens(6, 10);
  for (const l of linhas) assert.equal(l.batem, true, 'n=' + l.n);
  const seis = linhas[5];
  assert.equal(seis.casas, 84);
  assert.equal(seis.enumeracao, 2_097_152n);
  assert.equal(seis.perfil, 2_097_152n);
  assert.equal(linhas[9].formula, 36_028_797_018_963_968n);
});

test('o histograma dos deitados e binomial, e soma 2^(n(n+1)/2)', { timeout: MINUTO }, () => {
  for (const l of tabelaHistograma(6)) {
    assert.equal(l.binomialBate, true, 'n=' + l.n);
    assert.equal(l.imparesNaoZero, 0, 'n=' + l.n);
    assert.equal(l.soma, BigInt(l.total));
    assert.equal(l.soma, l.somaDosBinomiais);
  }
});

test('a soma dos binomiais E a formula fechada: a varredura reencontra o teorema', { timeout: MINUTO }, () => {
  const l = tabelaHistograma(6)[5];
  assert.equal(l.n, 6);
  assert.equal(l.m, 21);
  assert.equal(l.somaDosBinomiais, 2_097_152n);
  assert.equal(binomial(21, 0), 1n);
  assert.equal(binomial(21, 10), 352_716n);
  assert.equal(binomial(21, 21), 1n);
});

test('o numero de dominos deitados e sempre PAR', { timeout: MINUTO }, () => {
  for (const l of tabelaHistograma(6)) assert.equal(l.imparesNaoZero, 0, 'n=' + l.n);
});

test('a casa mais decidida fica em 1 - 2^(-n), exato, em toda ordem', { timeout: MINUTO }, () => {
  const linhas = tabelaExtremo(6);
  for (const l of linhas) assert.equal(l.bate, true, 'n=' + l.n);
  assert.equal(linhas[5].maior, 0.984375);
  assert.equal(linhas[5].maior, 63 / 64);
  assert.equal(linhas[5].pontaNorte, linhas[5].maior);
});

test('NENHUMA casa e unanime: o limiar 1 devolve zero em toda ordem', { timeout: MINUTO }, () => {
  const { linhas } = tabelaLimiares(6);
  for (const l of linhas) {
    assert.equal(l.fracoes[1].quantas, 0, 'n=' + l.n);
    assert.equal(l.fracoes[1].fracao, 0, 'n=' + l.n);
  }
});

test('na ordem 6, 16 das 84 casas passam de 90% decididas: 19,05% contra 21,46%', { timeout: MINUTO }, () => {
  const { linhas, noLimite } = tabelaLimiares(6);
  const seis = linhas[linhas.length - 1];
  assert.equal(seis.n, 6);
  assert.equal(seis.casas, 84);
  assert.equal(seis.fracoes[0.9].quantas, 16);
  assert.equal((seis.fracoes[0.9].fracao * 100).toFixed(2), '19.05');
  assert.equal(seis.fracoes[0.95].quantas, 8);
  assert.equal((noLimite * 100).toFixed(2), '21.46');
});

test('fora do circulo a casa foge 5,34 vezes mais do meio-a-meio, na ordem 6', { timeout: MINUTO }, () => {
  const linhas = tabelaCirculo(6);
  const seis = linhas[linhas.length - 1];
  assert.equal(seis.n, 6);
  assert.equal(seis.casas, 84);
  assert.equal(seis.previstasCongeladas, 32);
  assert.equal(seis.desvioFora.toFixed(4), '0.3594');
  assert.equal(seis.desvioDentro.toFixed(4), '0.0673');
  assert.equal(seis.razao.toFixed(2), '5.34');
});

test('o circulo separa: em toda ordem o desvio de fora e maior que o de dentro', { timeout: MINUTO }, () => {
  for (const l of tabelaCirculo(6)) {
    assert.ok(l.desvioFora > l.desvioDentro, 'n=' + l.n);
  }
});

test('os blocos giraveis vao de n a n(n+1)/2, cravados', { timeout: MINUTO }, () => {
  const linhas = tabelaBlocos(6);
  for (const l of linhas) {
    assert.equal(l.minimoEhN, true, 'n=' + l.n);
    assert.equal(l.maximoEhM, true, 'n=' + l.n);
  }
  const seis = linhas[5];
  assert.equal(seis.minimo, 6);
  assert.equal(seis.maximo, 21);
  assert.equal(seis.media.toFixed(4), '12.3945');
});

test('o maximo de blocos giraveis e o MESMO n(n+1)/2 do expoente da formula', { timeout: MINUTO }, () => {
  for (const l of tabelaBlocos(6)) {
    assert.equal(l.maximo, l.m);
    assert.equal(l.m, (l.n * (l.n + 1)) / 2);
  }
  assert.equal(tabelaBlocos(6)[5].m, 21);
  assert.equal(2 ** 21, 2_097_152);
});

test('o mapa da ordem 6 e simetrico em cima-baixo e esquerda-direita', { timeout: MINUTO }, () => {
  const linhas = mapa(6);
  assert.equal(linhas.length, 12);
  for (let j = 0; j < 12; j++) {
    assert.equal(linhas[j], linhas[11 - j], 'linha ' + j);
  }
  assert.ok(linhas[0].includes('98.4'));
  assert.ok(linhas[5].includes('1.6'));
  assert.ok(linhas[5].includes('50.0'));
});
