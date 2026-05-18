## Architecture

App Router conventions live under `src/app/`. Routes are folders; `layout.tsx` wraps children, `page.tsx` renders the leaf. Components default to Server Components — add `"use client"` only when browser APIs or React hooks are needed.

### Arquitetura Hexagonal

```
Domain         → lógica de negócio pura; sem dependência de frameworks, transporte ou persistência
Ports          → interfaces inbound (casos de uso) e outbound (repositórios, serviços externos)
Adapters       → implementações concretas das Ports (HTTP handlers, Drizzle repositories, email, etc.)
```

Regras críticas (ver `docs/constitution.md` para a lista completa):

- Lógica de negócio **só** no Domain.
- Drizzle **nunca** é importado em entidades Domain ou casos de uso.
- Route Handlers (`app/api/**/route.ts`), Server Actions e componentes React são adapters de transporte — sem lógica de negócio.
- Domain depende **apenas** de tipos próprios e das Ports — nunca de tipos Next.js, Drizzle ou React.
- Toda entrada externa é validada no adapter HTTP inbound antes de chegar ao Domain.
