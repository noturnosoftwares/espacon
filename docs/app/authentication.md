# Autenticação

## Objetivo

Definir o padrão de acesso ao HelpDesk.

## Login

O login será realizado por:

* E-mail
* Senha

## Recursos obrigatórios

A tela de login deve possuir:

* Campo de e-mail
* Campo de senha
* Botão para visualizar/ocultar senha
* Opção "Manter acesso"
* Opção "Recuperar senha"
* Botão de entrar

## Regras

* Não implementar backend no frontend.
* Login deve iniciar mockado.
* A integração real será feita posteriormente via API REST.
* O estado de login deve ser controlado por store/application/repository/provider.
* Não acessar API diretamente na tela.
* Erros devem usar AsyncResult.

## Status: tela de login implementada (Fase 2 — mock-first)

A tela inicial institucional integrada ao login está na rota `/`
(ver especificação em `docs/specifications/auth/login.md`). Após o login,
redireciona para `/dashboard` — a tela principal (home) (ver
`docs/specifications/home`), hoje em placeholder até sua spec.

Recursos da tela de login (mock-first):

| Recurso                       | Status        | Detalhe                                            |
| ----------------------------- | ------------- | -------------------------------------------------- |
| E-mail / senha                | ✅ mock       | credencial fixa abaixo                             |
| Mostrar/ocultar senha         | ✅            | toggle no campo de senha                           |
| Botão de entrar               | ✅            | estados de loading/erro                            |
| **Lembrar e-mail**            | ✅ mock local | pré-preenche o próximo acesso (nunca a senha)      |
| **Manter acesso**             | ✅ mock local | persiste sessão (ver Sessão; ADR-005)              |
| **Recuperar senha**           | 🔗 link       | navega para `/recuperar-senha` (spec própria)      |
| Vitrine institucional         | ✅ mock       | mapa/contadores/institucional agregados (ADR-007)  |

### Credencial mockada

| E-mail                 | Senha     |
| ---------------------- | --------- |
| `admin@noturno.com.br` | `noturno` |

Qualquer outra combinação retorna erro de autenticação via `AsyncResult`
("E-mail ou senha inválidos."), exibido no formulário.

### Fluxo previsto

```txt
LoginPage → AuthStore → LoginUseCase → AuthRepositoryImpl → MockAuthProvider → AsyncResult
```

* `AuthStore` estende apenas `BaseStore` (login não é CRUD); instância por tela.
* Composição via factory explícita `makeLoginUseCase()` (sem DI global).
* Sessão definitiva (token via API) deferida (ver ADR-003); persistência local
  provisória (ver ADR-005).

## Recuperar senha (mock)

Link "Recuperar senha" → rota `/recuperar-senha`. O usuário informa o e-mail e
recebe uma confirmação genérica ("Verifique seu e-mail"). Por segurança
(anti-enumeração), o sistema não revela se o e-mail tem conta. Fluxo:

```txt
PasswordRecoveryPage → PasswordRecoveryStore → RecoverPasswordUseCase
  → AuthRepositoryImpl → MockAuthProvider → AsyncResult
```

Especificação: `docs/specifications/auth/password-recovery.md`.

## Sessão — "Manter acesso" e e-mail lembrado (mock local)

A opção "Manter acesso" passa a ter efeito: ao logar, a sessão é salva localmente
(em `localStorage` se marcada; `sessionStorage` se não) e o e-mail é lembrado
para pré-preencher o próximo acesso. Ao abrir o login com sessão salva, o usuário
é redirecionado ao dashboard; o logout (no menu de perfil da home) limpa a sessão.

> ⚠️ Persistência local **provisória**, não autenticação segura. Será substituída
> por token/cookie quando a API real existir (ver ADR-005).

Especificação: `docs/specifications/auth/session.md`.

### Arquivos (previstos — Vue)

* Módulo: `src/modules/auth/`
* Login: `src/modules/auth/presentation/pages/login-page.vue` (rota `/` em `src/router`)
* Recuperar senha: `src/modules/auth/presentation/pages/password-recovery-page.vue`
  (rota `/recuperar-senha` em `src/router`)
* Sessão: `domain/repositories/session-repository.ts` +
  `data/repositories/session-repository-impl.ts`
* Storage compartilhado: `src/shared/storage/key-value-store.ts`
* Validação de e-mail: `src/shared/extensions/email-ext.ts`
* Logout: menu de perfil da home (`src/modules/home/presentation/widgets/profile-menu.vue`)
