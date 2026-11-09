// O medidor: roda as tabelas e cospe os numeros que vao para o README.
//
//   node ferramentas/medidor.js            todas
//   node ferramentas/medidor.js circulo    so uma
//
// Nenhum numero do README e digitado a mao: sai daqui.

import {
  tabelaContagens,
  tabelaHistograma,
  tabelaExtremo,
  tabelaCirculo,
  tabelaLimiares,
  tabelaBlocos,
  mapa,
} from '../src/medidas.js';

const num = (x) => (typeof x === 'bigint' ? x.toLocaleString('pt-BR') : typeof x === 'number' ? x.toLocaleString('pt-BR') : String(x));
const dec = (x, c = 4) => x.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
const pct = (x) => dec(x * 100, 2) + '%';

function imprimir(titulo, colunas, linhas) {
  console.log('\n### ' + titulo);
  const larguras = colunas.map((c, i) => Math.max(c.length, ...linhas.map((l) => String(l[i]).length)));
  const linha = (cs) => '| ' + cs.map((c, i) => String(c).padStart(larguras[i])).join(' | ') + ' |';
  console.log(linha(colunas));
  console.log('|' + larguras.map((w) => '-'.repeat(w + 2)).join('|') + '|');
  for (const l of linhas) console.log(linha(l));
}

const tabelas = {
  contagens() {
    imprimir(
      'Tres contagens para a mesma pergunta',
      ['n', 'casas', 'enumeracao', 'perfil', 'formula 2^(n(n+1)/2)', 'batem'],
      tabelaContagens(6, 10).map((l) => [
        l.n, num(l.casas), l.enumeracao === null ? '-' : num(l.enumeracao),
        num(l.perfil), num(l.formula), l.batem ? 'sim' : 'NAO',
      ])
    );
  },

  histograma() {
    imprimir(
      'O histograma dos dominos deitados contra os binomiais',
      ['n', 'm = n(n+1)/2', 'ladrilhamentos', 'e C(m, j) em todo j', 'impares nao zero', 'soma dos binomiais'],
      tabelaHistograma(6).map((l) => [
        l.n, l.m, num(l.total), l.binomialBate ? 'sim' : 'NAO',
        l.imparesNaoZero, num(l.somaDosBinomiais),
      ])
    );
  },

  extremo() {
    imprimir(
      'A casa mais decidida do diamante',
      ['n', 'ladrilhamentos', 'maior fracao deitada', '1 - 2^(-n)', 'bate'],
      tabelaExtremo(6).map((l) => [
        l.n, num(l.total), dec(l.maior, 6), dec(l.previsto, 6), l.bate ? 'sim' : 'NAO',
      ])
    );
  },

  circulo() {
    imprimir(
      'O circulo artico como previsao, sem limiar nenhum',
      ['n', 'casas', 'o circulo congela', 'fracao', 'desvio fora', 'desvio dentro', 'razao'],
      tabelaCirculo(6).map((l) => [
        l.n, num(l.casas), num(l.previstasCongeladas), pct(l.fracaoPrevista),
        dec(l.desvioFora), dec(l.desvioDentro),
        Number.isFinite(l.razao) ? dec(l.razao, 2) + 'x' : 'infinita',
      ])
    );
  },

  limiares() {
    const { linhas, limiares, noLimite } = tabelaLimiares(6);
    imprimir(
      'Quanta casa fica quase congelada em cada limiar (no limite, ' + pct(noLimite) + ')',
      ['n', 'casas', ...limiares.map((l) => 'limiar ' + dec(l, 2))],
      linhas.map((l) => [
        l.n, num(l.casas),
        ...limiares.map((lim) => l.fracoes[lim].quantas + ' (' + pct(l.fracoes[lim].fracao) + ')'),
      ])
    );
  },

  blocos() {
    imprimir(
      'Os blocos 2x2 que podem ser girados no lugar',
      ['n', 'ladrilhamentos', 'media', 'minimo', 'e n', 'maximo', 'e n(n+1)/2'],
      tabelaBlocos(6).map((l) => [
        l.n, num(l.total), dec(l.media), l.minimo, l.minimoEhN ? 'sim' : 'NAO',
        l.maximo, l.maximoEhM ? 'sim' : 'NAO',
      ])
    );
  },

  mapa() {
    console.log('\n### O mapa da ordem 6: em que fracao dos ladrilhamentos cada casa esta deitada');
    console.log();
    for (const linha of mapa(6)) console.log(linha);
  },
};

const pedido = process.argv[2];
if (pedido && !tabelas[pedido]) {
  console.error('tabela desconhecida: ' + pedido);
  console.error('disponiveis: ' + Object.keys(tabelas).join(', '));
  process.exit(1);
}
for (const [nome, fn] of Object.entries(tabelas)) {
  if (!pedido || pedido === nome) fn();
}
console.log();
