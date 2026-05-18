# Templates JSDoc por tipo de elemento

## Função simples

```ts
/**
 * Calcula o desconto aplicável com base no perfil do cliente
 *
 * @param customer - Dados do cliente, incluindo plano e histórico
 * @param amount - Valor bruto em centavos
 * @returns Valor do desconto em centavos (0 se não houver desconto)
 */
function calculateDiscount(customer: Customer, amount: number): number;
```

---

## Função assíncrona

````ts
/**
 * Busca o perfil completo do usuário, incluindo permissões e preferências
 *
 * @param userId - UUID v4 do usuário
 * @param options - Opções de busca
 * @param options.includeDeleted - Se true, retorna também usuários desativados
 * @returns Perfil completo do usuário
 *
 * @throws {NotFoundError} Quando o usuário não existe ou foi permanentemente removido
 * @throws {DatabaseError} Em caso de falha na conexão com o banco
 *
 * @example
 * ```ts
 * const profile = await fetchUserProfile('abc-123', { includeDeleted: false });
 * console.log(profile.permissions); // ['read', 'write']
 * ```
 */
async function fetchUserProfile(
    userId: string,
    options: FetchProfileOptions = {},
): Promise<UserProfile>;
````

---

## Classe completa

````ts
/**
 * Gerencia a fila de processamento de notificações com suporte a retry
 *
 * As notificações são processadas em ordem FIFO. Em caso de falha,
 * a notificação é recolocada na fila com backoff exponencial.
 *
 * @example
 * ```ts
 * const queue = new NotificationQueue({ maxRetries: 3 });
 * queue.push({ type: 'email', to: 'user@example.com' });
 * await queue.process();
 * ```
 */
class NotificationQueue {
    /**
     * Número máximo de tentativas antes de mover para a fila de erros
     */
    readonly maxRetries: number;

    /**
     * @param config - Configuração inicial da fila
     * @param config.maxRetries - Máximo de tentativas por notificação (padrão: 5)
     * @param config.backoffMs - Tempo base de espera entre tentativas em ms (padrão: 1000)
     */
    constructor(config: QueueConfig = {}) {}

    /**
     * Adiciona uma notificação ao final da fila
     *
     * @param notification - Notificação a ser enfileirada
     * @returns ID único da notificação na fila
     */
    push(notification: Notification): string {}

    /**
     * Processa todas as notificações pendentes
     *
     * @returns Resumo do processamento com contagens de sucesso e falha
     * @throws {QueueLockedError} Se outra instância já estiver processando
     */
    async process(): Promise<ProcessingResult> {}
}
````

---

## Interface e Type

```ts
/**
 * Configuração de paginação para queries de listagem
 *
 * Todas as queries de listagem aceitam este objeto para controlar
 * o tamanho e a posição da página retornada.
 */
interface PaginationOptions {
    /** Número da página, começando em 1 */
    page: number;

    /** Quantidade de itens por página (máximo: 100) */
    limit: number;

    /**
     * Cursor para paginação baseada em cursor.
     * Quando fornecido, `page` é ignorado.
     */
    cursor?: string;
}

/**
 * Resultado paginado genérico retornado por queries de listagem
 *
 * @template T - Tipo dos itens retornados
 */
type PaginatedResult<T> = {
    /** Lista de itens da página atual */
    data: T[];

    /** Total de itens disponíveis (todas as páginas) */
    total: number;

    /** Indica se há uma próxima página disponível */
    hasNextPage: boolean;

    /** Cursor para buscar a próxima página (undefined se não houver) */
    nextCursor?: string;
};
```

---

## Módulo/arquivo (comentário de topo)

```ts
/**
 * @module auth/token
 *
 * Utilitários de geração e validação de tokens JWT.
 *
 * Fluxo esperado:
 * 1. `generateToken` — cria token no login
 * 2. `validateToken` — verifica em cada requisição autenticada
 * 3. `refreshToken` — renova antes da expiração
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc7519} Especificação JWT
 */
```

---

## Hook React

````ts
/**
 * Gerencia o estado de autenticação do usuário atual
 *
 * Sincroniza automaticamente com mudanças no localStorage e eventos
 * de login/logout de outras abas do navegador.
 *
 * @returns Estado de autenticação e funções de controle de sessão
 *
 * @example
 * ```tsx
 * function Header() {
 *   const { user, logout, isLoading } = useAuth();
 *   if (isLoading) return <Spinner />;
 *   return user ? <UserMenu onLogout={logout} /> : <LoginButton />;
 * }
 * ```
 */
function useAuth(): AuthState;
````

---

## Middleware Express/Fastify

````ts
/**
 * Middleware de autenticação via JWT Bearer token
 *
 * Valida o token no header `Authorization`, decodifica o payload
 * e injeta `req.user` com os dados do usuário autenticado.
 *
 * @throws Responde com 401 se o token estiver ausente ou inválido
 * @throws Responde com 403 se o token estiver expirado
 *
 * @example
 * ```ts
 * router.get('/profile', authenticate, (req, res) => {
 *   res.json(req.user);
 * });
 * ```
 */
const authenticate: RequestHandler;
````

---

## Enum

```ts
/**
 * Status possíveis de um pedido ao longo do seu ciclo de vida
 *
 * A transição entre estados segue o fluxo:
 * PENDING → CONFIRMED → SHIPPED → DELIVERED
 * Qualquer estado pode ir para CANCELLED (exceto DELIVERED).
 */
enum OrderStatus {
    /** Pedido criado, aguardando confirmação de pagamento */
    PENDING = "pending",

    /** Pagamento confirmado, pedido em separação */
    CONFIRMED = "confirmed",

    /** Pedido despachado, aguardando entrega */
    SHIPPED = "shipped",

    /** Entrega confirmada pelo cliente ou transportadora */
    DELIVERED = "delivered",

    /** Pedido cancelado — ver `cancellationReason` para o motivo */
    CANCELLED = "cancelled",
}
```
