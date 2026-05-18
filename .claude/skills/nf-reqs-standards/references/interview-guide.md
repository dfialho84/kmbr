# Guia de Entrevista — Requisitos Não Funcionais

Este guia orienta como conduzir a entrevista para derivar RNFs de alta qualidade.
Regras fundamentais: uma pergunta por vez, nunca pergunte o que os artefatos já respondem.

---

## Princípios da entrevista

1. **Uma pergunta por vez** — nunca faça duas perguntas em uma única mensagem
2. **Contextualize com os artefatos** — mencione o PRD, Story ou cenário que motivou a pergunta
3. **Aceite "N/A"** — se o usuário disser que não se aplica, avance sem insistir
4. **Derive antes de perguntar** — se o PRD define um SLA, use diretamente sem perguntar
5. **Calibre com referências** — se a resposta for vaga, ofereça exemplos concretos

---

## Banco de perguntas por categoria

### Performance

> Use quando: o PRD menciona "rapidamente", "sem delay", "em tempo real"; ou uma Story tem critério sobre tempo de resposta; ou um requisito funcional descreve uma operação crítica.

- "O PRD menciona que [operação] deve ser rápida. Qual o tempo máximo aceitável? (ex.: 1s, 2s, 5s)"
- "Em qual percentil você quer garantir esse tempo? (ex.: 95% das requisições, 99%?)"
- "Esse limite vale em condições normais de carga ou também em picos?"
- "Há alguma operação nessa feature especialmente crítica em termos de latência?"

---

### Escalabilidade

> Use quando: o PRD menciona "crescimento", "muitos usuários", "alta demanda"; ou um cenário BDD tem "Given N usuários simultâneos".

- "Quantos usuários simultâneos o sistema deve suportar nessa feature?"
- "Existe uma projeção de crescimento de volume para essa funcionalidade nos próximos meses?"
- "O sistema precisa escalar automaticamente ou a capacidade pode ser provisionada manualmente?"

---

### Disponibilidade

> Use quando: o PRD menciona "sempre disponível", "crítico para o negócio", "tolerância a falhas".

- "Qual o uptime mínimo esperado para essa feature? (99% = ~7h de downtime/mês; 99,9% = ~43min; 99,99% = ~4min)"
- "O sistema precisa continuar funcionando parcialmente em caso de falha de um componente?"
- "Há janelas de manutenção aceitáveis (ex.: madrugada)?"

---

### Segurança

> Use quando: a feature lida com autenticação, senha, dados pessoais, tokens ou permissões.

- "Após quantas tentativas falhas de [operação] o sistema deve bloquear temporariamente?"
- "Por quanto tempo deve durar o bloqueio? (ex.: 15 minutos, 1 hora)"
- "Os links ou tokens gerados por essa feature precisam expirar? Em quanto tempo?"
- "Quais eventos de segurança precisam ser registrados em log de auditoria?"
- "Os dados de [campo sensível] precisam ser criptografados em repouso, em trânsito, ou ambos?"

---

### Observabilidade

> Use quando: a feature tem fluxos críticos, tentativas de fraude, ou auditoria de compliance.

- "Quais eventos dessa feature precisam ser registrados em log? (ex.: tentativas, sucessos, falhas)"
- "Há necessidade de rastrear o tempo de execução de alguma operação específica?"
- "Por quanto tempo os logs desta feature precisam ser retidos?"
- "Existe necessidade de alertas automáticos em caso de anomalia? (ex.: taxa de erro acima de X%)"

---

### Usabilidade

> Use quando: a feature é voltada a usuários finais e tem impacto direto na experiência de uso.

- "Há um tempo máximo esperado para que um usuário complete essa tarefa?"
- "Existem requisitos de acessibilidade? (ex.: WCAG AA, suporte a leitores de tela)"
- "A feature precisa funcionar em dispositivos móveis com conexão lenta?"

---

## Como lidar com respostas vagas

Se o usuário responder de forma vaga, ofereça referências concretas para calibrar:

| Resposta vaga | Como calibrar |
|---|---|
| "rápido" | "Menos de 1 segundo? Menos de 2 segundos?" |
| "bem disponível" | "99% = ~7h downtime/mês; 99,9% = ~43min — qual se aproxima do esperado?" |
| "muitos usuários" | "Estamos falando de centenas, milhares ou dezenas de milhares simultâneos?" |
| "seguro" | "Qual o risco mais importante: vazamento de dados, acesso indevido ou fraude?" |

---

## Quando NÃO perguntar

- Se o PRD define um SLA explícito (ex.: "disponibilidade de 99,9%") → use diretamente
- Se um cenário BDD especifica carga (ex.: "Given 1000 concurrent users") → derive sem perguntar
- Se o usuário já respondeu em uma pergunta anterior → nunca repita a pergunta
- Se a feature é interna/admin com poucos usuários → não force RNFs de escalabilidade
