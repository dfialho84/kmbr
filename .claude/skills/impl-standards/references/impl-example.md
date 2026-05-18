# Exemplo de Ciclo de Implementação — Recuperação de Senha

> Exemplo anotado de como o `impl-agent` executa duas tasks consecutivas,
> mostrando o ciclo completo de cada uma incluindo o relatório apresentado
> ao usuário.

---

## Sessão iniciada

```
[impl-agent] Implementando feature: Recuperação de Senha
Artefatos carregados: tasks.md, test-strategy.md, design.md, constitution.md, CLAUDE.md

Próxima task: T-01 — Criar entidade `VerificationCode`
Tasks concluídas: 0/37 (37 pendentes)

Iniciando implementação.
```

---

## T-01: Criar entidade `VerificationCode`

### A. Leitura da task

```
Rastreabilidade: REQ-1 · REQ-9 · REQ-10 · NFR-2
Depende de: —
Concluída quando: entidade definida no ORM com todos os campos e FK para delivery_drivers
```

Testes rastreados no `test-strategy.md`: nenhum UT/IT listado diretamente para
esta task — é uma task de modelo. A verificação será o critério de conclusão
(entidade e migration funcionando) + typecheck.

### B. Planejamento

- Arquivo a criar: `src/infrastructure/database/entities/verification-code.entity.ts`
- Conforme `CLAUDE.md`: entidades Prisma ficam em `prisma/schema.prisma`; entidades
  de domínio em `src/domain/`; este é um modelo de dados → `prisma/schema.prisma`
- Verificar constitution.md: modelo de dados não contém lógica de negócio ✅

### C. Implementação

Edita `prisma/schema.prisma` adicionando:

```prisma
model VerificationCode {
  id         String    @id @default(uuid())
  driverId   String
  code       String
  channel    Channel
  expiresAt  DateTime
  usedAt     DateTime?
  createdAt  DateTime  @default(now())

  driver DeliveryDriver @relation(fields: [driverId], references: [id])
}

enum Channel {
  email
  sms
}
```

### D. Verificação estática

```bash
npx prisma validate
npx tsc --noEmit
```

Resultado: ✅ sem erros

### E. Testes rastreados

Task de modelo — sem UT/IT diretos. Executa smoke test da migration:

```bash
npx prisma migrate dev --name add_verification_codes
```

Resultado: ✅ migration criada e aplicada sem erros

### F. Critério de conclusão

"Entidade definida no ORM com todos os campos e FK para `delivery_drivers`"

Verificação: `prisma studio` confirma tabela com estrutura correta ✅

### G. Marca task

Edita `tasks.md`: `- [ ] T-01` → `- [x] T-01`

### H. Relatório apresentado ao usuário

```
✅ T-01 concluída — Criar entidade `VerificationCode`

O que foi feito:
- prisma/schema.prisma: adicionado model VerificationCode com 7 campos e FK para DeliveryDriver
- prisma/migrations/..._add_verification_codes.sql: migration gerada e aplicada

Testes executados:
- Migration smoke test: ✅ aplicada sem erros
- TypeScript typecheck: ✅ sem erros

Rastreabilidade coberta: REQ-1 · REQ-9 · REQ-10 · NFR-2

Tasks concluídas: 1/37
Próxima: T-02 — Criar migration da tabela `verification_codes`

Deseja prosseguir?
```

> **Nota:** O usuário aprova. O agente avança para T-02.

---

## T-03: Implementar `PasswordRecoveryDomain.generateCode()`

> *T-02 foi concluída entre T-01 e T-03 — omitida neste exemplo para focar
> em uma task de domínio com testes unitários.*

### A. Leitura da task

```
Rastreabilidade: REQ-1 · NFR-2 · DT-1
Depende de: —
Concluída quando: gera 6 dígitos numéricos; expires_at = now() + 5min
```

Testes rastreados no `test-strategy.md`:

```
UT-1: PasswordRecoveryDomain.generateCode()
- Casos: 6 dígitos numéricos, expires_at correto, aleatoriedade em 100 execuções
- Mocks: Clock mockado para controlar now()
```

### B. Planejamento

- Arquivo a criar: `src/domain/password-recovery/generate-code.ts`
- Arquivo de teste: `src/domain/password-recovery/generate-code.spec.ts`
- Constitution.md verificada: domínio puro, sem imports de infraestrutura ✅

### C. Implementação

Cria `src/domain/password-recovery/generate-code.ts`:

```typescript
export interface GenerateCodeResult {
  code: string;
  expiresAt: Date;
}

export function generateCode(now: Date = new Date()): GenerateCodeResult {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);
  return { code, expiresAt };
}
```

Cria `src/domain/password-recovery/generate-code.spec.ts` cobrindo UT-1:

```typescript
describe('generateCode (UT-1)', () => {
  it('gera string de exatamente 6 dígitos numéricos', () => { ... });
  it('expires_at é now() + 5 minutos', () => { ... }); // clock mockado
  it('100 execuções sem colisão consecutiva', () => { ... });
});
```

### D. Verificação estática

```bash
npm run typecheck
```
✅ sem erros

### E. Testes rastreados

```bash
npm test -- --testPathPattern="generate-code.spec"
```

Resultado:
```
PASS src/domain/password-recovery/generate-code.spec.ts
  generateCode (UT-1)
    ✓ gera string de exatamente 6 dígitos numéricos (2ms)
    ✓ expires_at é now() + 5 minutos (1ms)
    ✓ 100 execuções sem colisão consecutiva (8ms)

Tests: 3 passed, 3 total
```

### F. Critério de conclusão

"Gera códigos de exatamente 6 dígitos numéricos e `expires_at` é sempre `now() + 5min`"
✅ confirmado pelos 3 casos do UT-1

### G. Marca task

`- [ ] T-03` → `- [x] T-03`

### H. Relatório apresentado ao usuário

```
✅ T-03 concluída — Implementar `PasswordRecoveryDomain.generateCode()`

O que foi feito:
- src/domain/password-recovery/generate-code.ts: função pura que gera OTP de 6 dígitos com expires_at = now() + 5min
- src/domain/password-recovery/generate-code.spec.ts: 3 casos de teste cobrindo UT-1

Testes executados:
- UT-1 (generateCode): ✅ 3 casos passaram

Rastreabilidade coberta: REQ-1 · NFR-2

Tasks concluídas: 3/37
Próxima: T-04 — Implementar `VerificationCodeRepository.save()`

Deseja prosseguir?
```

---

## Exemplo de relatório com ⚠️ (ajuste por constitution.md)

```
✅ T-09 concluída — Implementar POST /api/v1/password-recovery/request

O que foi feito:
- src/interface/http/password-recovery.controller.ts: endpoint POST /request com validação e delegação ao service
- src/application/password-recovery.service.ts: orquestração do fluxo de solicitação

Testes executados:
- GH-1 (Scenario "Recuperação de senha com email e código válido"): ✅ passou
- GH-2 (Scenario "Solicitação com dado de formato inválido"): ✅ passou
- GH-3 (Scenario "Solicitação com dado não cadastrado"): ✅ passou

⚠️  Atenção: a lógica de verificação do rate limit foi mantida no service (camada
    application), não no controller, conforme regra 2 da constitution.md
    ("lógica de negócio fora do domínio de transporte").

Rastreabilidade coberta: REQ-1 · REQ-5 · REQ-6 · NFR-3

Tasks concluídas: 9/37
Próxima: T-10 — Cobrir Scenario "Recuperação de senha com email e código válido" (E2E)

Deseja prosseguir?
```

---

## Exemplo de relatório de bloqueio 🔴

```
🔴 T-15 bloqueada — Implementar `PasswordService.hash()`

Tentativas de correção: 3
Erro persistente:
  PT-2 falha: tempo de hash medido = 45ms (threshold: ≥ 100ms)
  bcrypt cost factor 10 não é suficiente neste hardware de CI

O que foi tentado:
- Cost factor 10: 45ms (abaixo do threshold)
- Cost factor 12: 87ms (abaixo do threshold)
- Cost factor 13: 210ms (acima, mas PT-2 falha porque o teste verifica ≥ 100ms E ≤ 500ms)

O cost factor ideal depende do hardware de produção vs. CI.
Necessito de orientação: qual cost factor usar, ou devo tornar o threshold configurável por ambiente?
```
