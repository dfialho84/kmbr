# Guia de Entrevista — Constitution

Este guia orienta como conduzir a entrevista para construir uma constitution.md de alta qualidade.
Regras fundamentais: uma pergunta por vez, nunca pergunte o que o projeto já deixa claro.

---

## Princípios da entrevista

1. **Uma pergunta por vez** — nunca faça duas perguntas em uma única mensagem
2. **Derive antes de perguntar** — se o CLAUDE.md define a arquitetura como hexagonal, use essa informação; não pergunte
3. **Contextualize com o que já foi dito** — mencione o dado do projeto que motivou a pergunta
4. **Aceite "N/A"** — se o usuário disser que não se aplica, avance sem insistir
5. **Calibre com exemplos** — se a resposta for vaga, ofereça exemplos concretos de regras similares

---

## Banco de perguntas por seção

### Must Do (Obrigações)

> Use quando: o usuário não mencionou regras sobre um aspecto coberto pelo checklist.

**Sobre separação de camadas:**
- "Onde deve residir a lógica de negócio — em qual camada da arquitetura?"
- "Controllers/rotas podem chamar o banco de dados diretamente? Qual é a camada intermediária obrigatória?"
- "Repositórios podem conter validações de negócio?"

**Sobre propagação de erros:**
- "Como os erros devem ser propagados? Existe um formato padronizado (código, mensagem, metadados)?"
- "Quais metadados um erro deve carregar? (ex: requestId, timestamp, código de erro)"

**Sobre validação:**
- "Onde a validação de entradas externas deve acontecer — no controller, no serviço, ou em outra camada?"
- "Toda entrada do usuário deve ser validada antes de chegar ao domínio? Há exceções?"

**Sobre logging:**
- "Quais operações devem ser obrigatoriamente registradas em log?"
- "O logging deve ser estruturado (JSON) ou texto livre?"

**Sobre rastreabilidade:**
- "Toda mudança de código deve ser associada a algum artefato (requisito, BDD, task)? Como?"

---

### Ask Before Proceeding (Perguntar Antes de Prosseguir)

> Use quando: o usuário não definiu gates de aprovação para situações de ambiguidade ou risco.

**Sobre requisitos:**
- "Se um requisito estiver incompleto ou ambíguo, o desenvolvedor deve continuar com uma suposição ou parar e pedir clareza?"
- "Qual é o critério para considerar um requisito 'suficientemente claro' para implementar?"

**Sobre decisões arquiteturais:**
- "Se houver múltiplas abordagens técnicas válidas (ex: sync vs async, cache vs query direta), o desenvolvedor deve escolher autonomamente ou precisar justificar e validar antes?"

**Sobre mudanças de contrato:**
- "Se uma mudança impactar a API pública, o modelo de dados ou um contrato compartilhado, qual é o processo de aprovação?"

**Sobre conflitos com a constituição:**
- "Se uma implementação parecer conflitar com uma regra da constituição, o que deve acontecer?"

---

### Never Do (Proibições)

> Use quando: o usuário não listou proibições sobre um anti-pattern que o checklist exige cobrir.

**Sobre acesso direto a dados:**
- "Controllers ou UI podem acessar o banco de dados diretamente? Qual camada é a única autorizada?"
- "Adapters externos (HTTP, fila, email) podem conter lógica de negócio?"

**Sobre erros:**
- "É permitido capturar um erro e não fazer nada com ele (swallow)? Ou responder com uma mensagem genérica sem contexto?"

**Sobre acoplamento:**
- "O domínio pode importar diretamente um framework (Express, Next.js, Prisma, etc.)? Ou deve ficar isolado?"

**Sobre suposições:**
- "Um desenvolvedor pode assumir um requisito não especificado para desbloquear a implementação?"

---

### Enforcement (Execução)

> Use quando: o usuário não definiu consequências ou gates de validação.

**Sobre planos de implementação:**
- "Antes de começar a implementar, o desenvolvedor deve descrever como o plano está alinhado com a constituição?"

**Sobre violações:**
- "Se uma implementação violar uma regra da constituição, o que acontece? Ela pode ser mergeada com uma exceção documentada, ou é sempre bloqueada?"

**Sobre clareza faltando:**
- "Se houver uma pergunta sem resposta (requisito em aberto, decisão pendente), a implementação pode começar mesmo assim?"

---

## Como lidar com respostas vagas

Se o usuário responder de forma imprecisa, ofereça exemplos para calibrar:

| Resposta vaga | Como calibrar |
|---|---|
| "seguir boas práticas" | "Poderia dar um exemplo concreto? Ex: 'Toda lógica de negócio deve estar no serviço, nunca no controller'" |
| "não misturar coisas" | "O que seria 'misturar'? Ex: controller chamando repositório diretamente, ou serviço importando ORM?" |
| "erros tratados corretamente" | "Tratado como? Ex: propagados com código + requestId, ou apenas logados?" |
| "validar os dados" | "Validar onde? No controller antes do serviço, ou no domínio, ou em ambos?" |

---

## Quando NÃO perguntar

- Se o CLAUDE.md já define a arquitetura (ex: hexagonal) → derive as regras de camadas sem perguntar
- Se o stack já está definido → não pergunte sobre acoplamento de frameworks óbvios
- Se o usuário já respondeu em uma seção anterior → nunca repita a pergunta
- Se a regra é universal e não precisa de calibração (ex: "nunca swallow errors") → inclua sem perguntar
