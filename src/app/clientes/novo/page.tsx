// Scope: [M] module-customers
//
// Rota de cadastro de Cliente (/clientes/novo). App Router fino: delega à página
// de formulário do módulo em modo "create".

import { CustomerFormPage } from "@/modules/customers/presentation/pages/customer-form-page";

export default function NovoCliente() {
  return <CustomerFormPage mode="create" />;
}
