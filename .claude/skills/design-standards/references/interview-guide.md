# Guia de Entrevista — Criação de Design Técnico

## Princípios da entrevista

1. **Uma pergunta por vez.** Nunca faça duas perguntas na mesma mensagem.

2. **Derive antes de perguntar.** Os artefatos existentes são a fonte primária:
   - `requirements.md` → comportamentos obrigatórios (o quê)
   - `nf-requirements.md` → restrições técnicas (como se comportar)
   - `scenarios.feature` → fluxos de execução e contratos de API (esqueleto dos fluxos e respostas de erro)
   - `stories.md` → critérios de aceitação e validações de entrada
   - `prd.md` → dependências externas, riscos e fora de escopo
   - `doc/constitution.md` → restrições arquiteturais globais não negociáveis

3. **Perguntas abertas, não de confirmação.** Prefira "Como você imagina a integração com o serviço de SMS?" a "Você vai usar Twilio?".

4. **Use o contexto acumulado.** Se os NFRs já definem "5 tentativas, bloqueio de 30 minutos", não pergunte sobre rate limiting.

5. **Aprofunde quando vago.** Se a resposta foi "algo padrão" ou "o usual", peça uma escolha específica.

---

## Quando aceitar vs. aprofundar

**Aceite** quando:
- Todos os itens do checklist da seção estão cobertos pelos artefatos ou pela resposta
- As informações são específicas e verificáveis
- O rascunho gerado não tem lacunas evidentes

**Aprofunde** quando:
- A resposta é vaga ("algo que funcione", "o padrão", "depende")
- Há um trade-off real não endereçado
- A decisão contradiz um requisito já levantado
- Falta ao menos um item obrigatório do checklist da seção

---

## Banco de perguntas por seção

### 1. Visão Geral Técnica

Use quando o rascunho não está claro sobre a abordagem técnica escolhida.

- "Qual é a abordagem técnica central aqui? (ex: OTP numérico, link mágico, pergunta de segurança)"
- "Há alguma restrição da `doc/constitution.md` que impacta diretamente essa feature?"
- "Esta feature se encaixa em algum padrão já estabelecido no projeto, ou é algo novo?"

---

### 2. Arquitetura de Componentes

Use quando a responsabilidade de um componente é ambígua ou quando um serviço externo novo é necessário.

- "Este componente precisa ser novo ou já existe algo no projeto que pode ser estendido?"
- "Qual é a responsabilidade única desse componente? Em uma frase."
- "Há serviços externos envolvidos (email, SMS, push)? Já existe um provider escolhido ou está em aberto?"
- "Esse serviço externo deve ser isolado em um adapter ou já existe uma abstração no projeto?"

---

### 3. Modelo de Dados

Use quando campos, tipos ou relações não são deriváveis dos artefatos.

- "Essa entidade precisa de soft delete ou pode ser deletada fisicamente após o uso?"
- "Quais campos de auditoria são obrigatórios aqui? (created_at, updated_at, created_by, etc.)"
- "O código OTP deve ser armazenado no banco ou em Redis? (impacta NFR-6 — retenção de logs por 1 ano)"
- "Essa entidade é nova ou é uma extensão de uma já existente no projeto?"
- "O `DeliveryDriver` já tem os campos de contato necessários (email, telefone) ou precisam ser adicionados?"

---

### 4. API / Contratos

Use quando convenções de API não estão declaradas nos artefatos.

- "Os endpoints de recuperação de senha são públicos ou exigem algum tipo de autenticação prévia?"
- "Qual é o formato padrão de erro do projeto? (ex: `{ error: string, code: string }`)"
- "A API é versionada? Qual prefixo usar? (ex: `/api/v1/`)"
- "O endpoint de reset exige um token intermediário (emitido após validar o OTP) ou basta reenviar o OTP?"
- "A resposta neutra (NFR-3) deve ser idêntica em texto, status HTTP e tempo de resposta, ou apenas em texto?"

---

### 5. Fluxo de Execução

Use apenas quando há comportamento interno não coberto pelos cenários BDD.

- "O que deve acontecer se o serviço de email ou SMS estiver indisponível no momento do envio? (falha silenciosa ou erro para o usuário?)"
- "Esse passo pode ser assíncrono (fila) ou deve ser síncrono para respeitar o SLA de 30s (NFR-1)?"
- "Há algum passo de compensação necessário se o fluxo falhar após gravar o código no banco?"

---

### 6. Decisões Técnicas

Use para cada trade-off real não resolvido pelos artefatos.

- "OTP numérico ou link mágico? O fato de suportar SMS influencia essa escolha?"
- "O código OTP vai no banco relacional ou no Redis? (impacta NFR-6 — retenção de 1 ano)"
- "Os contadores de rate limiting ficam no banco ou no Redis? Qual é a tolerância a falha do Redis aqui?"
- "O envio de notificação é síncrono (dentro do request) ou assíncrono (fila)? Como garantir o SLA de 30s (NFR-1)?"
- "Qual biblioteca de bcrypt usar? Já está no projeto ou é nova dependência?"

---

### 7. Checklist de Implementação

Não faça perguntas para esta seção — ela é gerada a partir de tudo que foi construído.
Se algo parecer faltando no checklist, revise as seções anteriores, não o checklist isoladamente.

---

## Erros comuns a evitar

| Erro | Correto |
|------|---------|
| Perguntar o que já está no PRD | Derivar do PRD e mostrar no rascunho |
| Perguntar o que os NFRs já definem (ex: 5 tentativas, TTL de 5 min) | Aplicar diretamente no rascunho |
| Perguntar o que a `doc/constitution.md` já define | Aplicar e mencionar no rascunho |
| Ignorar os cenários BDD ao escrever o Fluxo de Execução | Usar cada Scenario como esqueleto de um fluxo |
| Ignorar as User Stories ao escrever validações de API | Derivar validações dos critérios de aceitação |
| Descrever código no design (nomes de funções, queries SQL) | Descrever componentes e responsabilidades |
| Misturar "o que" (requisito) com "como" (design) | O design responde só o "como" |
| Criar componentes sem rastrear ao requisito | Cada componente deve endereçar ao menos um REQ |
| Listar decisões óbvias nas Decisões Técnicas | Apenas trade-offs reais |
