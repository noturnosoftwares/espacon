# Especificação — Usuários, Perfis e Permissões

> Produto: **EspaçoN** · herda regras do template `../template`.
> Status: **Implementado v1 — mock-first** (frontend lidera o contrato).
> Decisão relacionada: **ADR-006** (acesso multiempresa) e **ADR-008** (núcleo de
> autorização em `shared/access`).

---

## Nome

Cadastro e manutenção de **Usuários**, **Perfis de Usuário** e **Permissões de
acesso** (por recurso × ação).

---

## Objetivo

Cadastrar e manter usuários, atribuir permissões granulares por **recurso/ação** e
carregar dados de acesso (operador de caixa, remoto, restrição de horário/IP) que
os módulos do ERP consomem. A permissão é **transversal**: o mesmo catálogo
alimenta o menu lateral, os guards de rota e a liberação de qualquer botão/tela.

---

## Contexto

EspaçoN é multiempresa (matriz + franquias). O acesso é sempre **individual por
usuário**; o perfil é apenas um **modelo** para acelerar o cadastro, **nunca**
fonte de autorização.

---

## Princípios inegociáveis (implementados)

1. **Perfil não concede acesso.** Selecionar perfil apenas **copia/redefine** ações
   no usuário (`applyProfileToUser`). A autorização lê sempre `user.permissions`.
2. **Acesso é por (recurso, ação).** Cada recurso tem 9 flags
   (`abrir, buscar, novo, modificar, apagar, imprimir, relatório, gráfico, remoto`).
3. **Catálogo ≠ menu lateral.** O catálogo é a lista mestra de **todos** os recursos
   do ERP (telas, botões, features). Nem todo recurso é item de menu.
4. **Frontend lidera o contrato.** O mock é a fonte da verdade; a camada `data`
   isola a conversão futura (mapper). Models em inglês.
5. **Frontend modela e exibe; backend será a autoridade de segurança** (horário/IP).

---

## Regras de Negócio

### Usuário
- **Vínculo com funcionário (opcional):** `employeeId` pode ser nulo.
- **Operador de caixa:** `isOperator`; se operador → `type` = `unlimited | limited`;
  se `limited` → exige `operatorCode`. **Não é portão do checker** — é dado
  consumido pelos módulos financeiros (`limited` trava no código; `unlimited`
  escolhe/filtra qualquer operador). O `operatorCode` referencia um operador
  cadastrado, então a UI usa **campo de busca/`LookupField`** (DS §9.2), **nunca**
  digitação livre. A tela de cadastro/seleção de operadores de caixa **ainda será
  implementada** (template ADR-003); o campo já nasce no formato certo e, até lá,
  acionar a busca informa que está por vir.
- **`remote`:** habilita features que atravessam empresas (cross-company);
  avaliado só quando a operação for remota.

### Restrições opcionais
- **Horário (`accessTimeRestriction`):** quando presente, a ação só passa dentro da
  janela (avaliada no login e a cada ação). Suporta janela que cruza a meia-noite.
- **IP público (`ipRestriction`):** quando presente, o IP deve estar na lista. O
  frontend reflete/edita; a aplicação real é do backend.

### Permissão (recurso)
- `code`, `label` (descrição), `key` (descrição normalizada — UPPER sem acento) e as
  9 ações. A correspondência é pela `key` (`normalizePermissionKey` defende o match).

### Regra do "remoto" (dois portões — cross-company)
Para a ação `A` no recurso `R`:
1. **Base:** `user.permissions[R].actions[A] === true`, senão nega.
2. **Se contexto remoto:** exige `user.remote === true` **e** `R.actions.remote`.
3. **Se houver restrição de horário/IP:** validar.

### Perfil
Modelo com `permissions`. A busca/seleção de perfil **reusa a própria listagem
`/perfis`** aberta em **modo seleção** (template ADR-003 — não há tela/diálogo de
busca duplicado). Ao selecioná-lo no usuário, **redefine** todas as ações (com
confirmação — sobrescreve). Depois o usuário edita livremente. **Nunca** é
consultado na autorização.

---

## Como o resto do sistema consome (declarativo)

```txt
Sidebar item     → useAccess().can('CADASTRO DE CLIENTE', PermissionAction.Open)
Botão liberar    → v-can="{ key: 'DESBLOQUEAR CLIENTE', action: PermissionAction.Create }"
Guard de rota    → checkAccess(subject, { permissionKey, action: Open })
```

Glue de presentation em `shared/access`: composable `useAccess()` e diretiva
`v-can` (esconde/desabilita).

> **Seam atual:** a sessão (`AuthUser`) ainda carrega `permissions: string[]` com
> `'*'` (admin = tudo). `useAccess()`/`v-can` honram o coringa e ficam prontos para
> consumir `Permission[]` quando o contrato de login for enriquecido (ver ADR-008,
> "Quando revisar"). O `Permission[]` rico já é plenamente usado no CRUD/matriz.

---

## Fluxo

### Autorização (runtime — síncrono e puro)
```txt
Componente/Guard/Sidebar → checkAccess(subject, request) → { allowed } | { allowed:false, reason }
```

### CRUD (assíncrono)
```txt
Page → Store (BaseCrudStore) → UseCase → Repository → Provider (Mock) → AsyncResult<T>
```

---

## Casos de Erro

`DenyReason`: `NO_PERMISSION`, `REMOTE_NOT_ALLOWED_FOR_USER`,
`REMOTE_NOT_ALLOWED_FOR_RESOURCE`, `OUTSIDE_ALLOWED_TIME`, `IP_NOT_ALLOWED`.
CRUD: validação, conflito, não encontrado, rede — sempre via `AsyncResult`/`AppError`.

---

## Models Envolvidos

- **`shared/access`:** `PermissionAction`, `Permission`, `AccessTimeRestriction`,
  `IpRestriction`, `AccessRequest`, `AuthorizationResult`, `DenyReason`,
  `UserRole`, `AccessScope`, `checkAccess`, `countByAction`.
- **`modules/users/domain`:** `User`, `UserProfile`, `PermissionCatalogEntry`,
  `CashOperator`, `CashOperatorType`.

## UseCases

`GetUsers`, `GetUserById`, `SaveUser`, `DeleteUser`, `GetUserProfiles`,
`GetUserProfileById`, `SaveUserProfile`, `DeleteUserProfile`,
`GetPermissionCatalog`, `applyProfileToUser` (puro). `checkAccess` é função pura no
kernel (não é UseCase).

## Repositories / Providers

`UsersRepository`, `UserProfilesRepository`, `PermissionCatalogRepository`.
Providers `Mock*` agora; `Rest*` sob medida depois.

---

## Telas (rotas)

- `/usuarios` — lista (grid com busca/ordenação/**scroll infinito** (lote de 30 —
  template ADR-002)/loading/erro). **Filtro de Situação** (Todas/Ativos/Inativos →
  `UserFilters.active`): **filtra o cache localmente** ao mudar (sem requisição —
  regra de filtros §9.1) e vai ao backend **como parâmetro** na próxima busca; o
  termo dispara a busca por Enter (§9.1). Sem resultados: termo destacado em
  vermelho (`#FF2626`) + botão
  **"Limpar filtros"** (limpa termo **e** situação e recarrega). O botão "Limpar"
  na barra aparece sempre que houver qualquer filtro ativo; o contexto (termo +
  situação) é restaurado ao voltar de um registro.
- `/usuarios/novo` e `/usuarios/:id` — formulário (dados + funcionário, Caixa,
  Remoto, Horário, IP, **busca de Perfil**, **matriz de permissões**). O Perfil é
  **dado de referência do backend**, então usa **campo de busca/`LookupField`**
  (DS §9.2), **nunca** listbox/select. Acionar o campo **abre a listagem `/perfis`
  em modo seleção** (`?mode=select&req=<id>`) pelo **canal de seleção
  compartilhado** (`shared/selection`); a listagem devolve o registro e o form o
  consome ao ser reativado — sem tela de busca duplicada (template ADR-003). Ao
  aplicar um perfil (com confirmação), suas ações **preenchem/sobrescrevem toda a
  matriz** do usuário (`applyProfileToUser`). **Cancelar** com alterações
  **confirma antes**; ao confirmar, em edição restaura o registro e permanece no
  detalhe, em registro novo volta à lista (template ADR-001). Falha de save
  (validação/API) dispara **toast** além do informativo no topo.
- `/perfis`, `/perfis/novo`, `/perfis/:id` — perfis (descrição + **a mesma
  matriz**). Mesmos padrões da tela de usuários: `PageContainer`, grid de leitura
  com **scroll infinito** (template ADR-002), estado vazio com termo destacado +
  "Limpar pesquisa", e formulário com `StickyActionBar`, **cancelar com
  confirmação/restauração** (template ADR-001), excluir no cabeçalho e toast.
  A listagem `/perfis` opera em **dois modos** (template ADR-003): em **gestão**,
  clique/Enter na linha abrem detalhes; em **seleção** (`?mode=select`), confirmam
  e devolvem o perfil. A coluna **Ver detalhes** existe **apenas no modo seleção**
  (lá o clique na linha confirma, então é o único caminho para abrir o registro);
  em gestão ela é omitida (seria redundante com o clique na linha). É um botão **só
  de ícone** (olho, em accent, com *hint*) — o texto ocupava espaço demais. **Novo perfil**
  aparece nos dois modos. **Reentrada de modo:** ao abrir **Ver detalhes** ou
  **Novo perfil** dentro do modo seleção, a query `mode/req` é levada adiante e
  devolvida no retorno — a listagem **reentra em modo seleção** e o registro
  editado/incluído fica selecionável. O retorno à tela solicitante usa o
  `returnTo` da requisição (não `router.back()`), robusto a esses detours.

A **matriz** mostra recursos (catálogo) × 9 ações, com toggles individual/por
sessão/por coluna e **9 contadores ao vivo**. Tem um **filtro local de recurso**
(busca por descrição/código — DS §9.1: filtra o cache, sem requisição) para achar
um recurso específico; os toggles de coluna/sessão passam a agir sobre os recursos
**visíveis** (filtrados) e os contadores seguem refletindo o **total**. O widget é
compartilhado por **Usuário** e **Perfil**, então o filtro vale nas duas telas.

---

## Mock Inicial

- `MockPermissionCatalogProvider`: recursos por sessão (menu e não-menu, ex.:
  "Desbloquear Cliente", "Contrato").
- `MockUserProfilesProvider`: "Administrativo", "Caixa", "Atendimento".
- `MockUsersProvider`: cenários — operador limitado/ilimitado/não-operador, remoto
  on/off, horário on/off, IP on/off, vínculo de funcionário on/off. Estado mutável
  em memória (criar/editar/excluir persistem na sessão). Tudo em `AsyncResult`.

---

## Integração Real (sob medida, por módulo, depois)

Backend de cada módulo casará com estes models; a conversão vive em
`data/providers`/mappers. Definir no backend: padronização da `descrição` e
formatos finais de horário/IP.

---

## Impactos

`shared/access` (novo), `shared/selection` (novo — canal de seleção, template
ADR-003), `shared/extensions` (`normalizePermissionKey`), `modules/users/*`,
`router` (rotas + query `mode=select`/`req`), `modules/home` (sidebar expande
sub-itens e flags `available`), `modules/auth` (`UserRole`/`AccessScope` movidos
para o kernel, re-exportados). **ADR-006**, **ADR-008**, **template ADR-003**.

---

## Base de Conhecimento

Verbete adicionado em `docs/specifications/ajuda/README.md`.

---

## Pendências (evolução futura, não bloqueiam)

- Enriquecer a sessão (`AuthUser`) com `Permission[]` (muda contrato de login — ADR).
- Horário rico (múltiplas janelas / dia da semana); IP CIDR/IPv6.
- `supportedActions` por recurso para refinar a UI da matriz (já suportado no model).
