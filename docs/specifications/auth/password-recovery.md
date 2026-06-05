# Especificação — Recuperar Senha

## Nome

Recuperação de senha (solicitação de link de redefinição).

## Objetivo

Permitir que o usuário solicite a redefinição da senha informando o e-mail da
conta, a partir do link "Recuperar senha" da tela de login.

## Contexto

Fluxo mock-first (ADR-003): não há API real de autenticação. A solicitação é
processada por um provider mock; o envio real do e-mail/link será feito pelo
backend quando houver API.

## Regras de Negócio

- E-mail é obrigatório e deve ter formato válido.
- **Anti-enumeração:** para um e-mail de formato válido, o resultado é sempre de
  sucesso — o sistema não revela se existe uma conta associada.
- Erros de validação são amigáveis via `AsyncResult`, sem travar a tela.
- Não acessar API direto na tela; sem regra de negócio na presentation.

## Fluxo

1. Usuário acessa `/recuperar-senha` (link na tela de login).
2. Informa o e-mail e envia.
3. `PasswordRecoveryStore.recover()` → `RecoverPasswordUseCase.execute()` (valida)
   → `AuthRepositoryImpl` → `MockAuthProvider`.
4. Sucesso: tela de confirmação ("Verifique seu e-mail"), com opção de tentar
   outro e-mail e link para voltar ao login.
5. Erro de validação: `errorMessage` exibido no formulário.

## Entradas / Saídas

- Entrada: `PasswordRecoveryRequest` (`email: string`).
- Saída: `AsyncResult<PasswordRecoveryReceipt>` (`email: string`).

## Casos de Erro

| Caso            | Mensagem                                          | Code                  |
| --------------- | ------------------------------------------------- | --------------------- |
| E-mail vazio    | Informe o e-mail.                                 | `auth/empty-email`    |
| E-mail inválido | Informe um e-mail válido.                         | `auth/invalid-email`  |
| Falha inesperada| Não foi possível solicitar a recuperação...       | `auth/unexpected`     |

## Contratos / Mappers

Sem contrato de API real nesta fase. Quando existir, o JSON externo será
convertido para `PasswordRecoveryRequest`/`PasswordRecoveryReceipt` em
`modules/auth/data/mappers`, e o `MockAuthProvider` dará lugar a um
`ApiAuthProvider`.

## Mock Inicial

Latência simulada (~700 ms). Qualquer e-mail de formato válido retorna sucesso
(anti-enumeração).

## Integração Real

Substituir `MockAuthProvider.recoverPassword` pelo provider de API + mapper, sem
impacto em Repository/UseCase/Store/Presentation.

## Impactos

- Nova rota `/recuperar-senha`.
- Link "Recuperar senha" da tela de login passa a navegar para a rota.
- Validação de e-mail centralizada em `@/shared/extensions/email-ext`
  (`EmailExt`), reusada por login e recuperação.

## Rota / Tela

- `/recuperar-senha` — `src/modules/auth/presentation/pages/password-recovery-page.tsx`.

## Base de Conhecimento

Entrada "Recuperar senha": como solicitar (informar e-mail), comportamento de
confirmação genérica (anti-enumeração) e onde acessar (link na tela de login).
