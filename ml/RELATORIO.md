# Relatório — aprendizado de máquina no Palco Conectado

Disciplina: Aprendizado de Máquina Aplicado a Dados Estruturados (UFG).

O Palco Conectado é um marketplace em que bandas e estabelecimentos negociam shows. Este relatório descreve as quatro funções de inteligência artificial do projeto: prever o cachê, estimar a chance de uma proposta ser aceita, agrupar talentos parecidos e recomendar pares banda–estabelecimento. Os algoritmos rodam sobre dados estruturados (números e categorias), não sobre texto livre.

## 1. De onde vêm os dados

O banco real, modelado em `prisma/schema.prisma`, guarda banda, músico, estabelecimento e proposta. Uma proposta tem data, valor (`amount`) e status (`pending`, `accepted`, `rejected`). Gênero, cidade, capacidade, integrantes, nota e faixa de preço também são colunas.

O seed de demonstração tem poucas propostas. Treinar em cima delas não sustentaria métricas de teste. O histórico usado no treino é **sintético**: 900 propostas e 180 talentos, gerados com as mesmas faixas de preço, cidades e gêneros do seed (`ml/generate_dataset.py`, semente 42). Cada proposta sintética tem um cachê observado e um desfecho aceito ou recusado. O segmento latente do talento (palco de bairro, casa noturna, sala íntima) existe só para avaliar o agrupamento. Ele não entra como coluna de treino.

Preços gravados como texto, por exemplo `R$ 600 - R$ 1.200`, viram o ponto médio numérico (900). Acentos são removidos antes de comparar cidades. Gêneros compostos, como `Rock/Indie` ou `Samba/Pagode`, caem em um rótulo canônico (`Rock`, `Samba`). A experiência de uma banda, que não tem esse campo no cadastro, é derivada do número de shows: menos de 15 é iniciante, menos de 40 é intermediário, o restante é profissional.

O mesmo extrator está em Python (`ml/domain.py`) e em TypeScript (`src/lib/ml/features.ts`). O script `npm run ml:check` confere se os dois produzem a mesma previsão.

## 2. Regressão — cachê sugerido

**Tarefa.** Prever um número contínuo: o valor do cachê.

**Algoritmo usado na aplicação.** Regressão linear, depois de padronizar as colunas com `StandardScaler` (média 0 e desvio 1). A previsão é a soma ponderada dos coeficientes mais o intercepto.

**Comparação.** Random Forest (200 árvores, profundidade máxima 8) foi treinado no mesmo recorte e ficou só no relatório. A interface não carrega a floresta, porque os coeficientes lineares cabem num JSON e rodam no servidor Next.js sem Python.

**Features.** Capacidade do local, integrantes, experiência, mesma cidade, fim de semana (sexta a domingo), nota, shows realizados, ponto médio do preço do talento, ponto médio do orçamento da casa, gênero em one-hot (Rock é a categoria de referência) e tipo do estabelecimento em one-hot (Bar é a referência).

**Protocolo.** Divisão 80/20, `random_state` 42. Métricas no conjunto de teste:

| Modelo | MAE | RMSE | R² |
| --- | ---: | ---: | ---: |
| Regressão linear | R$ 107 | R$ 136 | 0,95 |
| Random Forest | R$ 148 | R$ 188 | 0,91 |

A fórmula do cachê sintético é quase linear, com uma interação extra entre capacidade e alguns gêneros. Por isso a reta supera a floresta. A figura `ml/figures/regressao_previsto_vs_real.png` mostra previsto contra observado.

**Onde aparece.** No modal de proposta, o campo "Cachê sugerido" chama `POST /api/ml/suggest`. O código de inferência é `predictCache` em `src/lib/ml/predict.ts`.

## 3. Classificação — chance de aceite

**Tarefa.** Classificação binária supervisionada: a proposta termina aceita ou recusada. Pendentes ficam de fora do treino.

**Algoritmo usado na aplicação.** Regressão logística com `StandardScaler`. A saída é uma probabilidade entre 0 e 1, via sigmoide. Limiar de decisão no relatório: 0,5.

**Comparação.** Random Forest de classificação, mesmas 200 árvores. Também fica só nas métricas.

**Features.** Razão entre o valor ofertado e o cachê sugerido pela regressão (`amount_ratio`), distância dessa razão a 1,05 (`ratio_gap`), compatibilidade de gênero com o tipo da casa, capacidade, experiência, mesma cidade, dias de antecedência e nota. No treino, o cachê sugerido das linhas de treino vem de validação cruzada com 5 dobras, para a razão não usar a resposta da própria linha. No teste, usa-se o modelo linear já ajustado.

A compatibilidade de gênero é uma tabela fixa, documentada no artefato: bar combina com rock, pop, samba e sertanejo; restaurante com jazz, MPB e blues; pub com rock, samba, pop, sertanejo e forró; casa noturna com eletrônica, pop e rock; evento com sertanejo, pop, forró, samba e rock.

**Métricas no teste** (taxa de aceite no histórico: 61,6%):

| Modelo | Acurácia | Precisão | Recall | F1 |
| --- | ---: | ---: | ---: | ---: |
| Regressão logística | 0,66 | 0,70 | 0,77 | 0,73 |
| Random Forest | 0,68 | 0,70 | 0,84 | 0,76 |

Matriz da logística, em ordem recusada/aceita: 35 verdadeiros negativos, 36 falsos positivos, 25 falsos negativos, 84 verdadeiros positivos. A figura é `ml/figures/classificacao_matriz_confusao.png`.

**Onde aparece.** No mesmo modal, depois que data e valor estão preenchidos, a barra "Chance de aceite" usa `predictAcceptance`. Alta é probabilidade a partir de 0,66, média a partir de 0,40, e baixa abaixo disso.

## 4. Agrupamento — perfis do mesmo grupo

**Tarefa.** Aprendizado não supervisionado. Não há rótulo de grupo no treino.

**Algoritmo.** K-Means sobre talentos (bandas e músicos sintéticos), também com `StandardScaler`. O número de grupos k foi testado de 2 a 6. O escolhido é o de maior silhueta: **k = 6**, silhueta **0,45**. O índice de Rand ajustado contra o segmento latente, usado só na avaliação, foi 0,59. Figuras: `ml/figures/cluster_silhueta.png` e `ml/figures/cluster_pca.png`.

**Features.** Ponto médio do preço, integrantes (músico conta como 1), experiência, nota, gênero em one-hot completo e cidade em one-hot.

Cada centróide ganha um nome a partir do gênero mais comum e da faixa de preço média do grupo, por exemplo "Jazz · cachê médio". Na aplicação, um talento real é atribuído ao centróide mais próximo. A ficha lista outros perfis do catálogo que caíram no mesmo grupo, ordenados pela distância.

**Onde aparece.** Seção "Grupo de perfis" em `/banda/[id]` e `/musico/[id]`, via `GET /api/ml/similar`.

## 5. Recomendação — banda e estabelecimento

**Tarefa.** Sugerir, para uma banda, estabelecimentos com maior chance de aceitar uma proposta dela, e o inverso: para um estabelecimento, as bandas com maior chance de fechar.

Não há um quarto algoritmo de recomendação. O ranking reutiliza a regressão e a classificação e acrescenta o histórico de aceite. Isso é uma recomendação baseada em conteúdo e em histórico, adequada ao volume atual: ainda não existe matriz de interações grande o bastante para filtragem colaborativa.

**Oferta de referência.** A tela não pede data nem valor. Para cada par, o sistema assume a próxima sexta-feira com pelo menos 21 dias de antecedência e usa o cachê previsto pela regressão linear como valor ofertado e como cachê sugerido. A razão entre os dois fica em 1. A ordenação passa a refletir o encaixe do par: mesma cidade, gênero compatível, capacidade, experiência e nota.

**Histórico.** `ml/train.py` agrega as 900 propostas sintéticas por tipo de estabelecimento e gênero canônico e grava `recommendation-priors.json`. A taxa usa suavização de Laplace: `(aceitos + 1) / (total + 2)`. Propostas reais já decididas (`accepted` ou `rejected`) ajustam essa taxa quando o estabelecimento tem histórico próprio: metade prior sintético, metade taxa local suavizada. Enquanto o marketplace tiver poucas propostas reais, o prior sintético continua dominante, e o ajuste local aparece assim que houver desfechos.

**Score.** `0,7 × probabilidade da logística + 0,3 × taxa histórica`. Os três maiores scores vão para a ficha, com o percentual, o cachê sugerido e um motivo curto (mesma cidade, gênero compatível, histórico favorável ou mais restrito).

**Onde aparece.**

- Ficha da banda: "Estabelecimentos com maior chance de aceitar".
- Ficha do estabelecimento: "Bandas com maior chance de fechar".
- Rota: `GET /api/ml/recommendations?kind=band|establishment&id=`.

Músicos não entram nesta lista. O agrupamento da seção anterior continua cobrindo músicos e bandas parecidos.

## 6. Mapa de arquivos

| Peça | Caminho |
| --- | --- |
| Vocabulário e features | `ml/domain.py` e `src/lib/ml/features.ts` |
| Geração do histórico sintético | `ml/generate_dataset.py`, `ml/data/proposals.csv`, `ml/data/talents.csv` |
| Treino, métricas e figuras | `ml/train.py`, `ml/artifacts/metrics.json`, `ml/figures/` |
| Coeficientes da regressão | `src/lib/ml/artifacts/regression.json` |
| Coeficientes da logística | `src/lib/ml/artifacts/classification.json` |
| Centróides do K-Means | `src/lib/ml/artifacts/clustering.json` |
| Prior de aceite | `src/lib/ml/artifacts/recommendation-priors.json` |
| Inferência | `src/lib/ml/predict.ts` |
| Ranking dos pares | `src/lib/ml/recommend.ts` |
| Leitura do catálogo | `src/lib/ml/catalog.ts` |
| Conferência Python × TypeScript | `src/lib/ml/check.ts` |
| Cachê e chance no modal | `POST src/app/api/ml/suggest/route.ts`, `src/components/proposals/ProposalModal.tsx` |
| Perfis do mesmo grupo | `GET src/app/api/ml/similar/route.ts`, `src/components/ml/SimilarProfiles.tsx` |
| Recomendação de pares | `GET src/app/api/ml/recommendations/route.ts`, `src/components/ml/Recommendations.tsx` |
| Dependências de treino | `ml/requirements.txt` (numpy, pandas, scikit-learn, matplotlib) |

A aplicação em produção não sobe um serviço Python. O treino exporta JSON. O Next.js só multiplica coeficientes e compara distâncias aos centróides.

## 7. Como reproduzir

Na raiz do repositório, com o ambiente em `ml/.venv`:

```bash
ml/.venv/Scripts/python ml/generate_dataset.py
ml/.venv/Scripts/python ml/train.py
npm run ml:check
```

O primeiro comando recria os CSVs. O segundo regrava métricas, figuras e os JSON consumidos pelo site. O terceiro precisa imprimir que a inferência foi conferida. Se os números divergirem, a codificação em TypeScript deixou de acompanhar `ml/domain.py`.

## 8. Limitações

O histórico de treino é sintético e foi desenhado para que as relações existam: cachê quase linear nas features, aceite ligado à distância do valor justo e à compatibilidade de gênero, talentos concentrados em três perfis. As métricas medem o quanto os algoritmos recuperam essa estrutura, não um mercado real de shows.

Quando o Palco acumular propostas decididas, o mesmo extrator de features serve para trocar o CSV por linhas de `Proposal`. Até lá, a recomendação declara na interface que o ranking mistura o modelo com o histórico do tipo de casa, e o prior sintético continua sendo a base.
