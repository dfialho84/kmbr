---
name: jsdoc-standards
description: >
    Use esta skill para QUALQUER tarefa de documentação em TypeScript ou JavaScript:
    escrever JSDoc em funções, classes, interfaces, tipos, métodos, módulos ou arquivos.
    Invoque sempre que o usuário pedir para documentar, comentar, adicionar JSDoc, 
    explicar código via comentários, ou revisar documentação existente em TS/JS.
    Também use ao criar novos arquivos TS/JS que precisam de documentação desde o início.
---

# Padrões JSDoc para TypeScript/JavaScript

## Princípios fundamentais

1. **Documente a intenção, não a implementação** — explique _por que_ e _o que_, não _como_
2. **Evite redundância** — não repita o que o nome da função já diz claramente
3. **Seja específico** — termos vagos como "processa dados" não ajudam ninguém
4. **TypeScript primeiro** — aproveite os tipos existentes; não repita tipos já declarados no código

---

## O que documentar (obrigatório)

| Elemento                                                      | Documentar? |
| ------------------------------------------------------------- | ----------- |
| Funções e métodos exportados/públicos                         | ✅ Sempre   |
| Classes exportadas                                            | ✅ Sempre   |
| Interfaces e tipos públicos complexos                         | ✅ Sempre   |
| Constantes exportadas não-óbvias                              | ✅ Sempre   |
| Funções internas complexas (>10 linhas ou lógica não trivial) | ✅ Sim      |
| Parâmetros com comportamento não-óbvio                        | ✅ Sempre   |
| Getters/setters triviais                                      | ❌ Não      |
| Funções com nome auto-explicativo e lógica simples            | ❌ Não      |
| Tipos primitivos re-exportados                                | ❌ Não      |

---

## Tags essenciais e quando usar

### `@param`

Use para cada parâmetro não-óbvio. Em TypeScript, omita o tipo se já está na assinatura.

```ts
// ✅ Correto — tipo omitido pois já está na assinatura TS
/**
 * @param userId - ID único do usuário no banco de dados
 * @param options - Configurações opcionais de busca
 */
async function findUser(userId: string, options?: FindOptions): Promise<User>;

// ❌ Evitar — tipo redundante com a assinatura TypeScript
/**
 * @param {string} userId - ID único do usuário
 */
```

### `@returns`

Descreva o que é retornado, especialmente em casos não óbvios. Omita se o retorno é `void` ou trivialmente óbvio.

```ts
/**
 * @returns O token JWT assinado, válido por 24 horas
 */
function generateToken(payload: JwtPayload): string;
```

### `@throws`

Documente todas as exceções que o chamador precisa tratar.

```ts
/**
 * @throws {NotFoundError} Quando o usuário não existe
 * @throws {ValidationError} Quando o email tem formato inválido
 */
```

### `@example`

Obrigatório para funções públicas complexas ou com comportamento não-intuitivo. Use blocos de código TypeScript válidos.

````ts
/**
 * @example
 * ```ts
 * const result = await paginate(query, { page: 1, limit: 20 });
 * console.log(result.data); // [{ id: 1, ... }, ...]
 * ```
 */
````

### `@template` (Generics)

Documente parâmetros de tipo quando o nome não é auto-explicativo.

```ts
/**
 * @template T - Tipo dos itens da lista
 * @template K - Chave do objeto usada para agrupamento
 */
function groupBy<T, K extends keyof T>(items: T[], key: K): Map<T[K], T[]>;
```

### `@deprecated`

Sempre inclua a alternativa e, se possível, a versão em que será removido.

```ts
/**
 * @deprecated Use `findUserById` em vez desta função. Será removido na v3.0.
 */
```

### `@see`

Referências a funções relacionadas, documentação externa ou issues relevantes.

```ts
/**
 * @see {@link https://docs.exemplo.com/auth} Documentação de autenticação
 * @see {@link validateToken} Para validar o token gerado
 */
```

---

## Templates por tipo de elemento

Para templates detalhados de cada tipo, consulte: `references/templates.md`

Tipos cobertos nos templates:

- Função simples
- Função assíncrona
- Classe completa (construtor, métodos, propriedades)
- Interface e Type
- Módulo/arquivo (comentário de topo)
- Hook React
- Middleware Express/Fastify
- Enum

---

## Regras específicas para TypeScript

1. **Não repita tipos** que já estão na assinatura — o TypeScript já os documenta
2. **Documente narrowing** quando o tipo de retorno depende do input de forma não-óbvia
3. **Explique `as unknown as T`** e outros casts forçados — sempre justifique
4. **Generics com nomes curtos** (`T`, `K`, `V`) precisam de `@template`; nomes descritivos (`TUser`, `TResponse`) geralmente não precisam

---

## O que evitar

```ts
// ❌ Redundante — repete o nome da função
/**
 * Obtém o usuário.
 * @param id - O id
 * @returns O usuário
 */
function getUser(id: string): User;

// ✅ Correto — acrescenta contexto real
/**
 * Busca um usuário pelo ID no banco de dados principal.
 * Retorna null se o usuário não existir (não lança exceção).
 *
 * @param id - UUID v4 do usuário
 * @returns O usuário encontrado, ou null se não existir
 */
function getUser(id: string): User | null;

// ❌ Comentário de implementação (não JSDoc)
/**
 * Faz um loop no array e filtra os itens
 */

// ✅ Documenta o contrato
/**
 * Filtra transações pelo status, excluindo cancelamentos parciais.
 * A ordem original é preservada.
 */
```

---

## Formato e estilo

- **Primeira linha**: resumo em uma frase, sem ponto final
- **Linha em branco**: separação entre descrição e tags
- **Tempo verbal**: use infinitivo ("Busca", "Valida", "Retorna") — não "Esta função busca..."
- **Idioma**: português para descrições de negócio; inglês para termos técnicos consolidados (`token`, `payload`, `middleware`)
- **Comprimento**: descrição principal em até 2 linhas; mais que isso, divida em funções menores
