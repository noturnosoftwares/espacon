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
