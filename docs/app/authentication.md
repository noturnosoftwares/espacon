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

## Status: implementado (mock)

A tela inicial institucional integrada ao login está implementada na rota `/`
(ver especificação em `docs/specifications/auth`). O dashboard ainda não existe:
após o login, redireciona para `/dashboard` (placeholder temporário).

Recursos da tela de login — todos implementados (mock):

| Recurso                       | Status        | Detalhe                                            |
| ----------------------------- | ------------- | -------------------------------------------------- |
| E-mail / senha                | ✅ mock       | credencial fixa abaixo                             |
| Mostrar/ocultar senha         | ✅            | `PasswordField`                                    |
| Botão de entrar               | ✅            | estados de loading/erro                            |
| **Manter acesso**             | ✅ mock local | persiste sessão (ver Sessão; ADR-005)              |
| **Recuperar senha**           | ✅ mock       | rota `/recuperar-senha` (ver Recuperar senha)      |

### Credencial mockada

| E-mail                 | Senha     |
| ---------------------- | --------- |
| `admin@noturno.com.br` | `noturno` |

Qualquer outra combinação retorna erro de autenticação via `AsyncResult`
("E-mail ou senha inválidos."), exibido no formulário.

### Fluxo implementado

```txt
LoginPage → AuthStore → LoginUseCase → AuthRepositoryImpl → MockAuthProvider → AsyncResult
```

* `AuthStore` estende apenas `BaseStore` (login não é CRUD); instância por tela.
* Composição via factory explícita `makeLoginUseCase()` (sem DI global).
* Sessão definitiva deferida (ver ADR-003).

### Arquivos

* Módulo: `src/modules/auth/`
* Página: `src/modules/auth/presentation/pages/login-page.tsx` (rota `src/app/page.tsx`)
* Placeholder do dashboard: `src/app/dashboard/page.tsx`
