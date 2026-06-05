// Scope: [M] module-customers
//
// Estado de assinatura do contrato (integração D4Sign — ver README.md →
// "Assinatura obrigatória"). Enquanto não estiver "assinado", não se liberam
// chaves/ferramentas (regra "Liberação de chaves").

export type ContractSignStatus =
  | "aguardando"
  | "parcial"
  | "assinado"
  | "cancelado"
  | "expirado";
