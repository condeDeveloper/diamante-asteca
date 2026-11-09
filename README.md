# O diamante asteca e o círculo ártico

Todos os ladrilhamentos por dominó do diamante asteca, varridos um a um até a
ordem 6 — **2.097.152** deles — e contados até a ordem 13 por um segundo método
que não gera nenhum. Node puro, sem dependência nenhuma.

O diamante asteca de ordem `n` é o losango que se obtém empilhando linhas de
2, 4, …, 2n, 2n, …, 4, 2 casas, centradas. Ele tem `2n(n+1)` casas e exatamente
`2^(n(n+1)/2)` maneiras de ser coberto por dominós — a fórmula é de 1992, de
Elkies, Kuperberg, Larsen e Propp.

A contagem já tem fórmula, então não é ela que este repositório persegue. É o
**círculo ártico**: num ladrilhamento sorteado, as quatro pontas do losango
aparecem congeladas num padrão de tijolo, e a região que ainda varia tende a um
círculo inscrito. A pergunta é onde esse círculo está de verdade em ordem
pequena, e o que exatamente quer dizer "congelado".

## Os quatro achados

1. **Nenhuma casa do diamante é forçada.** Em toda ordem varrida — e na ordem 6
   são 2.097.152 ladrilhamentos conferidos um por um — não existe uma única casa
   cuja orientação seja a mesma em todos eles. Nem as pontas. O congelamento do
   círculo ártico é **probabilidade, não certeza**, e a casa mais decidida do
   diamante fica em exatamente **1 − 2^(−n)**: 98,4375% na ordem 6.
2. **O histograma dos dominós deitados é binomial, e com isso a varredura
   reencontra a fórmula sozinha.** O número de dominós deitados é sempre **par**,
   e a quantidade de ladrilhamentos com `2j` deles é exatamente `C(m, j)`, com
   `m = n(n+1)/2`. Somar os binomiais dá `2^m` — que é a fórmula fechada, chegada
   pelo caminho mais longo possível.
3. **O mesmo `n(n+1)/2` aparece três vezes, por três caminhos que não se falam:**
   é o expoente da fórmula, é o `m` dos binomiais do histograma, e é o **máximo
   de blocos 2×2 giráveis** que um ladrilhamento pode ter — cujo mínimo, por sua
   vez, é `n` cravado.
4. **O círculo separa 5,34 para 1 na ordem 6.** Fora dele a casa foge do
   meio-a-meio em média 0,3594; dentro, 0,0673. E a área que ele prevê congelada
   já está a dois pontos do limite: 19,05% das casas passam de 90% decididas,
   contra os **21,46%** (`1 − π/4`) que o teorema promete no infinito.

## Três contagens para a mesma pergunta

Nenhuma delas compartilha código com as outras:

- **a enumeração** (`src/diamante.js`) preenche sempre a primeira casa livre e
  tenta deitado e em pé. Cada ladrilhamento sai uma vez só, porque a escolha em
  cada nível é sobre uma casa fixa;
- **o perfil** (`src/juiz.js`) varre casa a casa carregando quais casas da linha
  de baixo já estão presas por um dominó em pé. Não gera ladrilhamento nenhum, e
  por isso chega à ordem 13;
- **a fórmula** `2^(n(n+1)/2)`, que não olha o tabuleiro.

| n | casas | enumeração | perfil | fórmula | batem |
|---|---|---|---|---|---|
| 1 | 4 | 2 | 2 | 2 | sim |
| 2 | 12 | 8 | 8 | 8 | sim |
| 3 | 24 | 64 | 64 | 64 | sim |
| 4 | 40 | 1.024 | 1.024 | 1.024 | sim |
| 5 | 60 | 32.768 | 32.768 | 32.768 | sim |
| 6 | 84 | 2.097.152 | 2.097.152 | 2.097.152 | sim |
| 7 | 112 | — | 268.435.456 | 268.435.456 | sim |
| 8 | 144 | — | 68.719.476.736 | 68.719.476.736 | sim |
| 9 | 180 | — | 35.184.372.088.832 | 35.184.372.088.832 | sim |
| 10 | 220 | — | 36.028.797.018.963.968 | 36.028.797.018.963.968 | sim |
| 13 | 364 | — | 2.475.880.078.570.760.549.798.248.448 | idem | sim |

A ordem 13 está num teste pesado e leva um minuto. A ordem 14 leva seis, e ficou
de fora: a tabela diz o que foi medido.

## O mapa da ordem 6

Em que fração dos 2.097.152 ladrilhamentos cada casa está coberta por um dominó
**deitado**:

```
     .     .     .     .     .  98.4  98.4     .     .     .     .     .
     .     .     .     .  89.1  90.6  90.6  89.1     .     .     .     .
     .     .     .  65.6  73.4  65.6  65.6  73.4  65.6     .     .     .
     .     .  34.4  50.0  50.0  51.6  51.6  50.0  50.0  34.4     .     .
     .  10.9  26.6  50.0  50.0  53.1  53.1  50.0  50.0  26.6  10.9     .
   1.6   9.4  34.4  48.4  46.9  50.0  50.0  46.9  48.4  34.4   9.4   1.6
   1.6   9.4  34.4  48.4  46.9  50.0  50.0  46.9  48.4  34.4   9.4   1.6
     .  10.9  26.6  50.0  50.0  53.1  53.1  50.0  50.0  26.6  10.9     .
     .     .  34.4  50.0  50.0  51.6  51.6  50.0  50.0  34.4     .     .
     .     .     .  65.6  73.4  65.6  65.6  73.4  65.6     .     .     .
     .     .     .     .  89.1  90.6  90.6  89.1     .     .     .     .
     .     .     .     .     .  98.4  98.4     .     .     .     .     .
```

O círculo está ali, desenhado por doze linhas de números: 98,4 nas pontas de
cima e de baixo, 1,6 nas das laterais (ou seja, 98,4% **em pé**), e um miolo de
50,0 cravados. Mas 98,4 não é 100 — e é isso que a tabela seguinte mede.

## As medidas

Tudo abaixo sai de `node ferramentas/medidor.js`. Nenhum número foi digitado à
mão.

### A casa mais decidida do diamante

| n | ladrilhamentos | maior fração deitada | 1 − 2^(−n) | bate |
|---|---|---|---|---|
| 1 | 2 | 0,500000 | 0,500000 | sim |
| 2 | 8 | 0,750000 | 0,750000 | sim |
| 3 | 64 | 0,875000 | 0,875000 | sim |
| 4 | 1.024 | 0,937500 | 0,937500 | sim |
| 5 | 32.768 | 0,968750 | 0,968750 | sim |
| 6 | 2.097.152 | 0,984375 | 0,984375 | sim |

Seis ordens, igualdade exata em todas. A ponta tende a congelar, e nunca chega.

### Quanta casa fica quase congelada em cada limiar

| n | casas | limiar 1,00 | limiar 0,95 | limiar 0,90 | limiar 0,75 |
|---|---|---|---|---|---|
| 2 | 12 | 0 (0,00%) | 0 (0,00%) | 0 (0,00%) | 8 (66,67%) |
| 3 | 24 | 0 (0,00%) | 0 (0,00%) | 0 (0,00%) | 8 (33,33%) |
| 4 | 40 | 0 (0,00%) | 0 (0,00%) | 8 (20,00%) | 16 (40,00%) |
| 5 | 60 | 0 (0,00%) | 8 (13,33%) | 8 (13,33%) | 24 (40,00%) |
| 6 | 84 | 0 (0,00%) | 8 (9,52%) | 16 (19,05%) | 24 (28,57%) |

A coluna do limiar 1 é a que importa: **zero em toda ordem**. E as outras pulam,
porque um corte fixo corta mal num losango de doze linhas.

### O círculo ártico como previsão, sem limiar nenhum

| n | casas | o círculo congela | fração | desvio fora | desvio dentro | razão |
|---|---|---|---|---|---|---|
| 2 | 12 | 8 | 66,67% | 0,2500 | 0,0000 | infinita |
| 3 | 24 | 8 | 33,33% | 0,3750 | 0,0625 | 6,00x |
| 4 | 40 | 16 | 40,00% | 0,3125 | 0,0833 | 3,75x |
| 5 | 60 | 16 | 26,67% | 0,3906 | 0,0966 | 4,04x |
| 6 | 84 | 32 | 38,10% | 0,3594 | 0,0673 | 5,34x |

**Desvio** é o quanto a casa foge do meio-a-meio: `|p − 1/2|`, com `p` a fração
de ladrilhamentos em que ela está deitada. Sem corte e sem limiar, e é esta
coluna que dá o sinal limpo — fora do círculo a casa é de três a seis vezes mais
decidida que dentro, em toda ordem.

### O histograma dos dominós deitados contra os binomiais

| n | m = n(n+1)/2 | ladrilhamentos | é C(m, j) em todo j | ímpares não zero | soma dos binomiais |
|---|---|---|---|---|---|
| 1 | 1 | 2 | sim | 0 | 2 |
| 2 | 3 | 8 | sim | 0 | 8 |
| 3 | 6 | 64 | sim | 0 | 64 |
| 4 | 10 | 1.024 | sim | 0 | 1.024 |
| 5 | 15 | 32.768 | sim | 0 | 32.768 |
| 6 | 21 | 2.097.152 | sim | 0 | 2.097.152 |

A coluna "ímpares não zero" conta quantos ladrilhamentos têm um número ímpar de
dominós deitados. É zero em toda ordem.

### Os blocos 2×2 que podem ser girados no lugar

| n | ladrilhamentos | média | mínimo | é n | máximo | é n(n+1)/2 |
|---|---|---|---|---|---|---|
| 1 | 2 | 1,0000 | 1 | sim | 1 | sim |
| 2 | 8 | 2,2500 | 2 | sim | 3 | sim |
| 3 | 64 | 4,0000 | 3 | sim | 6 | sim |
| 4 | 1.024 | 6,2656 | 4 | sim | 10 | sim |
| 5 | 32.768 | 9,0625 | 5 | sim | 15 | sim |
| 6 | 2.097.152 | 12,3945 | 6 | sim | 21 | sim |

Nenhum ladrilhamento fica sem saída: o mínimo é `n`, e nunca zero. E o máximo
bate no mesmo `n(n+1)/2` do expoente da fórmula e do `m` dos binomiais.

## O que as medidas me corrigiram

- **Eu tinha certeza de que as quatro pontas eram forçadas.** A linha de cima do
  diamante tem duas casas, e eu li "cabe um dominó deitado" como "só cabe um
  dominó deitado". Cabem também dois em pé, descendo para a linha de baixo. O
  resultado é que **nenhuma casa do diamante é unânime em ordem nenhuma**, e a
  frase "a ponta congela" virou "a ponta chega a 1 − 2^(−n) e para aí".
- **A primeira versão dos blocos giráveis contou errado.** Ela olhava só a
  orientação das quatro casas do bloco. Mas quatro casas deitadas em fila são
  dois dominós, e dois dominós deitados que começam fora do bloco não formam
  bloco girável nenhum. Tive de fazer a enumeração carregar, junto com a
  orientação, a **âncora** de cada dominó — a casa onde ele começa.
- **Esperava que a fração "quase congelada" subisse direitinho até 21,46%.** Ela
  pula: 0%, 0%, 20%, 13,33%, 19,05%. Um limiar fixo corta mal num diamante de
  doze linhas. Só quando troquei o corte por uma medida sem corte — o desvio
  médio do meio-a-meio — é que o sinal apareceu limpo.
- **Achei que o histograma seria só uma curva em sino qualquer.** Ele é
  binomial exato, e some nos ímpares. Foi a enumeração da ordem 5 que entregou
  `1, 15, 105, 455, 1365, 3003, 5005, 6435, …` — a linha 15 do triângulo de
  Pascal, com zeros entre os termos.

## Rodar

```bash
node --test testes/*.test.js         # os 29 testes (o pesado leva ~1 min)
node ferramentas/medidor.js          # todas as tabelas
node ferramentas/medidor.js mapa     # só o mapa da ordem 6
```

São **29 testes**: 14 de comportamento, 12 prendendo os números das tabelas e 3
nas contagens grandes. Sem `npm install`: não há dependência nenhuma. Node 20 ou
mais novo.

## Licença

MIT.
