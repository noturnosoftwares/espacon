// Scope: [M] module-customers
//
// Rota da listagem de Clientes (/clientes). App Router fino: delega à página do
// módulo (que monta o shell autenticado e a grade).

import { CustomersPage } from "@/modules/customers/presentation/pages/customers-page";

export default function Clientes() {
  return <CustomersPage />;
}
