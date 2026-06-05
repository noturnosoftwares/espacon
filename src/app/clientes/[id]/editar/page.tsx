// Scope: [M] module-customers
//
// Rota de edição de Cliente (/clientes/[id]/editar). App Router fino: resolve o
// param e delega à página de formulário do módulo em modo "edit". `params` é
// assíncrono no App Router atual.

import { CustomerFormPage } from "@/modules/customers/presentation/pages/customer-form-page";

export default async function EditarCliente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerFormPage mode="edit" id={id} />;
}
