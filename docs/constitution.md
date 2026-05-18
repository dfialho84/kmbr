# constitution.md

## Purpose

Este documento define as regras tecnicas nao-negociaveis que governam todas as implementacoes incluindo principios de Clean Code e SOLID como obrigacoes de design. Toda ambiguidade deve ser resolvida explicitamente — nunca assumida.

---

## Must Do

1. Toda lógica de negócio deve residir exclusivamente na camada Domain — controllers, repositories e adapters não podem conter regras de negócio.
2. Drizzle deve ser usado apenas em adapters de persistência (repositories concretos) — nunca importado em entidades Domain ou casos de uso.
3. Route Handlers (`app/api/**/route.ts`), Server Actions e componentes React são adapters de transporte — toda lógica de negócio deve ser delegada ao Domain via Port.
4. Toda entrada externa deve ser validada no adapter HTTP inbound antes de chegar ao Domain — o Domain jamais recebe dados não validados.
5. Erros devem ser propagados com estrutura padronizada contendo: código, mensagem, requestId e timestamp — nunca silenciados.
6. Operações que alteram estado devem gerar log estruturado (JSON) obrigatório via stack de observabilidade (OpenTelemetry/Loki).
7. Toda mudança de código deve ter rastreabilidade explícita a um artefato SDD (`requirements.md`, `scenarios.feature` ou `tasks.md`).
8. Os princípios SOLID (SRP, OCP, LSP, ISP, DIP) devem ser aplicados sempre que pertinentes ao contexto da implementação — nenhum princípio deve ser ignorado sem justificativa explícita.
9. Testes são escritos **antes** do código de produção (TDD red→green).
10. Toda task deve ter rastreabilidade a um requisito funcional, story ou cenário BDD em `docs/`.

---

## Ask Before Proceeding

11. Se um requisito, critério de aceitação ou comportamento esperado estiver incompleto ou ambíguo, pare e solicite clareza — não comece a implementar com suposições.
12. Se houver múltiplas abordagens técnicas válidas para um problema (ex: estratégia de cache, sincronismo vs. assincronismo, escolha de pattern), descreva as opções e aguarde decisão explícita antes de prosseguir.
13. Se uma mudança impactar a API pública, o esquema do banco de dados ou qualquer contrato compartilhado entre módulos, registre o impacto e obtenha aprovação explícita antes de implementar.
14. Se uma implementação parecer conflitar com uma regra desta constituição, interrompa, documente o conflito e aguarde resolução — nunca assuma uma exceção sem autorização explícita.

---

## Never Do

15. Nunca importar Drizzle (ou qualquer ORM/cliente de banco) em entidades Domain ou em casos de uso — persistência é responsabilidade exclusiva de adapters de repositório.
16. Nunca colocar lógica de negócio fora da camada Domain — Route Handlers, Server Actions, componentes React e repositories concretos não podem conter regras de negócio.
17. Nunca silenciar erros (swallow): capturar uma exceção e não propagá-la, não logá-la ou retornar uma resposta genérica sem contexto é proibido.
18. Nunca importar tipos ou módulos de Next.js, React, Drizzle ou next-auth dentro de entidades Domain ou casos de uso — o Domain depende apenas de tipos próprios e das Ports.
19. Nunca assumir um requisito não especificado para desbloquear a implementação — a ausência de clareza é um bloqueio, não uma permissão implícita.
20. Nunca usar tag `latest` em imagens Docker — sempre fixar versão estável.
21. Nunca iniciar implementação enquanto qualquer artefato SDD (`prd.md`, `stories.md`, `scenarios.feature`, `requirements.md`, `nf-requirements.md`, `design.md`, `test-strategy.md`, `tasks.md`) estiver incompleto.

---

## Enforcement

22. Todo plano de implementação deve declarar explicitamente como cada task está alinhada com as regras desta constituição antes de a implementação começar.
23. Qualquer implementação que viole uma regra desta constituição é inválida e deve ser corrigida antes do merge — sem exceções não documentadas.
24. Se houver qualquer ponto de clareza faltando (requisito aberto, decisão pendente, conflito com a constituição), a implementação é bloqueada até resolução explícita.
