# PRD — Bootstrap

## Visão Geral

Permitir que a aplicação funcione como PWA (Progressive Web App) com suporte a instalação como app nativo e atualização automática de conteúdo sem intervenção do usuário. Quando novas versões estão disponíveis, o sistema atualiza o app automaticamente em segundo plano, garantindo que o usuário sempre tenha a versão mais recente.

---

## Problema

Hoje, a aplicação kmbr é uma web app tradicional. Quando o usuário tenta acessá-la via navegador mobile, não tem como instalá-la como app nativo e não recebe atualizações automáticas de versão. Se uma nova versão está disponível, o usuário precisa fazer refresh manual ou limpar o cache. Isso resulta em versões desalinhadas entre usuários, bugs não corrigidos ao longo do tempo, e experiência degradada quando offline ou com conexão lenta.

---

## Usuário-Alvo

Motoristas e taxistas acessando o app via navegador mobile (Android e iOS). Todos os usuários sem pré-requisitos especiais.

---

## Objetivos

1. Permitir que o usuário instale o app como PWA no seu dispositivo.
2. Implementar atualização automática de versão em background sem intervenção do usuário.
3. Exibir notificação de atualização disponível com opção "Atualizar agora" ou "Depois".
4. Garantir funcionamento offline de pelo menos 95% das funcionalidades principais.
5. Implementar cache estratégico de assets estáticos para reduzir tempo de inicialização.

---

## Critérios de Sucesso

| Critério                                             | Medida                                          |
| ---------------------------------------------------- | ----------------------------------------------- |
| App é instalável como PWA                            | Disponível em standalone mode em Android/iOS    |
| Atualização automática funciona em background        | Versão mais recente carregada na próxima sessão |
| Banner de atualização é exibido quando há novo build | "Atualizar agora" ou "Depois" disponíveis       |
| App funciona offline                                 | 95%+ das funcionalidades críticas sem rede      |
| Cache de assets reduz tempo de inicialização         | < 3 segundos para inicialização completa        |

---

## Fora do Escopo

- Sincronização de dados entre dispositivos
- Persistência local de dados de negócio (ex: histórico de corridas)
- Plugins ou extensões do navegador
- Telemetria de uso ou analytics avançado
- Suporte a navegadores legados (IE 11, Android 4)
- Push notifications nativas

---

## Fluxo Principal

```mermaid
flowchart TD
    A([Usuário acessa<br/>a aplicação]) --> B[Browser detecta<br/>PWA support]
    B --> C{PWA já<br/>instalado?}
    C -->|Não| D[Banner oferece<br/>instalação]
    D --> E[Usuário clica<br/>Instalar]
    E --> F[App instalado<br/>em standalone]
    C -->|Sim| G[Service Worker<br/>monitora versão]
    F --> G
    G --> H{Nova versão<br/>disponível?}
    H -->|Sim| I[Service Worker<br/>baixa novo build]
    I --> J[Banner notifica<br/>atualização]
    J --> K{Usuário<br/>clica?}
    K -->|Atualizar agora| L[App atualiza<br/>imediatamente]
    K -->|Depois| M[Banner reaparece<br/>na próxima sessão]
    L --> N([App em versão<br/>mais recente])
    M --> N
    H -->|Não| O([App usa<br/>versão atual])
```

---

## Fluxos Alternativos

### FA1: Usuário clica "Depois"

```mermaid
flowchart LR
    A([Usuário vê<br/>banner de atualização]) --> B[Clica Depois]
    B --> C[Banner desaparece<br/>da sessão atual]
    C --> D[Na próxima sessão<br/>ou reload]
    D --> E([Banner reaparece<br/>se atualização<br/>ainda disponível])
```

---

### FA2: Navegador sem suporte PWA

```mermaid
flowchart LR
    A([Usuário acessa<br/>a aplicação]) --> B[Browser não detecta<br/>PWA support]
    B --> C[Banner de instalação<br/>não é exibido]
    C --> D([App funciona como<br/>web app tradicional])
```

---

### FA3: Erro ao baixar atualização

```mermaid
flowchart LR
    A([Service Worker<br/>detecta nova versão]) --> B[Tenta baixar<br/>novo build]
    B --> C{Download<br/>bem-sucedido?}
    C -->|Não| D[Erro de rede ou<br/>servidor indisponível]
    D --> E[Mantém versão<br/>anterior ativa]
    E --> F[Tenta novamente<br/>na próxima sessão]
    C -->|Sim| G([Novo build<br/>ativado])
    F --> G
```

---

## Dependências

- **Serwist**: biblioteca de Service Worker para gerenciar cache e background updates (já presente na stack em `docs/stack.md`)
- **Next.js 16 App Router**: roteamento e estrutura de componentes em `src/app/`
- **Web APIs padrão**: Service Workers (nativa do navegador), Cache API, IndexedDB (para persistência offline)
- **Manifest do PWA**: arquivo `public/manifest.json` (deve ser criado no escopo desta feature)

---

## Riscos

| Risco                                                                         | Mitigação                                                                           |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Navegador do usuário não suporta PWA                                          | Implementar fallback para web app tradicional; banner de instalação não aparece     |
| Erro ao baixar atualização de versão (rede instável ou servidor indisponível) | Manter versão anterior ativa; tentar novamente na próxima sessão do usuário         |
| Cache obsoleto permite usuário continuar com versão desatualizada             | Validar versão em cada inicialização; versioning no manifest e invalidação de cache |
| Tamanho de cache cresce indefinidamente afetando storage do dispositivo       | Definir limite de tamanho de cache; limpeza automática de assets antigos            |
| Usuário ignora banner "Atualizar agora" e continua com versão antiga          | Banner reaparece a cada nova sessão até que o usuário clique "Atualizar agora"      |
