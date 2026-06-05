// Scope: [M] module-customers
//
// Rota de detalhe do Cliente (/clientes/[id]). App Router fino: resolve o param
// e delega à página do módulo. `params` é assíncrono no App Router atual.

import { CustomerDetailPage } from "@/modules/customers/presentation/pages/customer-detail-page";

export default async function ClienteDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CustomerDetailPage id={id} />;
}
