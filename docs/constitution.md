# constitution.md

## Purpose

Este documento define as regras tecnicas nao-negociaveis que governam todas as implementacoes incluindo principios de Clean Code e SOLID como obrigacoes de design. Toda ambiguidade deve ser resolvida explicitamente — nunca assumida.

---

## Must Do

- Toda lógica de negócio deve residir exclusivamente na camada Domain — controllers, repositories e adapters não podem conter regras de negócio.
- Route Handlers (`app/api/**/route.ts`), Server Actions e componentes React são adapters de transporte — toda lógica de negócio deve ser delegada ao Domain via Port.
- Toda entrada externa deve ser validada no adapter HTTP inbound antes de chegar ao Domain — o Domain jamais recebe dados não validados.
- Erros devem ser propagados com estrutura padronizada contendo: código, mensagem, requestId e timestamp — nunca silenciados.
- Toda mudança de código deve ter rastreabilidade explícita a um artefato SDD (`requirements.md`, `scenarios.feature` ou `tasks.md`).
- Os princípios SOLID (SRP, OCP, LSP, ISP, DIP) devem ser aplicados sempre que pertinentes ao contexto da implementação — nenhum princípio deve ser ignorado sem justificativa explícita.
- Testes são escritos **antes** do código de produção (TDD red→green).
- Toda task deve ter rastreabilidade a um requisito funcional, story ou cenário BDD em `docs/`.

---

## Ask Before Proceeding

- Se um requisito, critério de aceitação ou comportamento esperado estiver incompleto ou ambíguo, pare e solicite clareza — não comece a implementar com suposições.
- Se houver múltiplas abordagens técnicas válidas para um problema (ex: estratégia de cache, sincronismo vs. assincronismo, escolha de pattern), descreva as opções e aguarde decisão explícita antes de prosseguir.
- Se uma mudança impactar a API pública, o esquema do banco de dados ou qualquer contrato compartilhado entre módulos, registre o impacto e obtenha aprovação explícita antes de implementar.
- Se uma implementação parecer conflitar com uma regra desta constituição, interrompa, documente o conflito e aguarde resolução — nunca assuma uma exceção sem autorização explícita.

---

## Never Do

- Nunca colocar lógica de negócio fora da camada Domain — Route Handlers, Server Actions, componentes React e repositories concretos não podem conter regras de negócio.
- Nunca silenciar erros (swallow): capturar uma exceção e não propagá-la, não logá-la ou retornar uma resposta genérica sem contexto é proibido.
- Nunca importar tipos ou módulos de Next.js, React, Drizzle ou next-auth dentro de entidades Domain ou casos de uso — o Domain depende apenas de tipos próprios e das Ports.
- Nunca assumir um requisito não especificado para desbloquear a implementação — a ausência de clareza é um bloqueio, não uma permissão implícita.
- Nunca usar tag `latest` em imagens Docker — sempre fixar versão estável.
- Nunca iniciar implementação enquanto qualquer artefato SDD (`prd.md`, `stories.md`, `scenarios.feature`, `requirements.md`, `nf-requirements.md`, `design.md`, `test-strategy.md`, `tasks.md`) estiver incompleto.

---

## Enforcement

- Todo plano de implementação deve declarar explicitamente como cada task está alinhada com as regras desta constituição antes de a implementação começar.
- Qualquer implementação que viole uma regra desta constituição é inválida e deve ser corrigida antes do merge — sem exceções não documentadas.
- Se houver qualquer ponto de clareza faltando (requisito aberto, decisão pendente, conflito com a constituição), a implementação é bloqueada até resolução explícita.
