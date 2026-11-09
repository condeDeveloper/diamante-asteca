// As contagens grandes, separadas porque passam de meio minuto.
//
// A enumeracao para na ordem 6, em 2.097.152 ladrilhamentos. O perfil continua
// sozinho ate a ordem 13, onde sao 9.007.199.254.740.992 x 4.096 ladrilhamentos
// — um numero de 28 digitos, contado sem gerar nenhum deles.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { formula, contarPorPerfil } from '../src/juiz.js';

const DEZ_MINUTOS = 600_000;

test('ordem 11: o perfil bate com a formula, 20 digitos', { timeout: DEZ_MINUTOS }, () => {
  const p = contarPorPerfil(11);
  assert.equal(p, formula(11));
  assert.equal(p, 2n ** 66n);
  assert.equal(p.toString().length, 20);
});

test('ordem 12: o perfil bate com a formula, 24 digitos', { timeout: DEZ_MINUTOS }, () => {
  const p = contarPorPerfil(12);
  assert.equal(p, formula(12));
  assert.equal(p, 2n ** 78n);
  assert.equal(p.toString().length, 24);
});

test('ordem 13: 2^91 ladrilhamentos, contados sem gerar nenhum', { timeout: DEZ_MINUTOS }, () => {
  const p = contarPorPerfil(13);
  assert.equal(p, formula(13));
  assert.equal(p, 2n ** 91n);
  assert.equal(p, 2_475_880_078_570_760_549_798_248_448n);
  assert.equal(p.toString().length, 28);
});
