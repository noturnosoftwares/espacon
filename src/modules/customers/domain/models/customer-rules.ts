// Scope: [M] module-customers
//
// Regras de negócio puras do cliente (sem I/O). Mantêm a lógica do domínio
// testável e fora da presentation. Ver README.md → "Regra automática do dia de
// pagamento" e "Liberação de chaves".

import type { ContractSignStatus } from "../enums/contract-sign-status";
import type { CustomerInput } from "./customer";

/** Mapa de erros por campo do formulário (chave → mensagem). Vazio = válido. */
export type CustomerFieldErrors = Record<string, string>;

/** Mantém apenas dígitos (CPF/CNPJ informados com máscara). */
function digits(value: string): string {
  return value.replace(/\D/g, "");
}

export const CustomerRules = {
  /**
   * Dia de pagamento automático a partir da data do contrato (ISO). O usuário
   * NÃO define manualmente:
   *   01–05 → 05 | 06–10 → 10 | 11–15 → 15 | 16–31 → 20.
   */
  paymentDay(contractDateIso: string): number {
    const day = Number(contractDateIso.split("-")[2]);
    if (!day || day <= 5) return 5;
    if (day <= 10) return 10;
    if (day <= 15) return 15;
    return 20;
  },

  /**
   * Liberação de chaves/ferramentas só após contrato assinado (D4Sign). Enquanto
   * não assinado: não gerar chaves, não liberar ferramentas.
   */
  canReleaseKeys(signStatus: ContractSignStatus): boolean {
    return signStatus === "assinado";
  },

  /**
   * Validação de campos do cadastro/edição (pura, sem I/O). Cobre os campos
   * obrigatórios da Aba Principal + contrato (plano/contrato obrigatórios). A
   * checagem de duplicidade de documento depende do dataset e fica no provider.
   */
  validateInput(input: CustomerInput): CustomerFieldErrors {
    const errors: CustomerFieldErrors = {};
    const required = (key: string, value: string | undefined, label: string) => {
      if (!value || !value.trim()) errors[key] = `${label} é obrigatório.`;
    };

    required("legalName", input.legalName, "Razão social / nome");

    const doc = digits(input.document);
    if (!doc) {
      errors.document = "Documento é obrigatório.";
    } else if (input.personType === "pf" && doc.length !== 11) {
      errors.document = "CPF deve ter 11 dígitos.";
    } else if (input.personType === "pj" && doc.length !== 14) {
      errors.document = "CNPJ deve ter 14 dígitos.";
    }

    required("zip", input.address.zip, "CEP");
    required("street", input.address.street, "Logradouro");
    required("number", input.address.number, "Número");
    required("city", input.address.city, "Cidade");
    if (!input.address.uf || input.address.uf.trim().length !== 2) {
      errors.uf = "UF inválida.";
    }

    const hasNamedContact = input.contacts.some((c) => c.name.trim());
    if (!hasNamedContact) errors.contacts = "Informe ao menos um contato.";

    required("plan", input.contract.plan, "Plano");
    required("contractDate", input.contract.contractDate, "Data do contrato");
    if (input.contract.computersContracted < 1) {
      errors.computersContracted = "Mínimo de 1 computador.";
    }

    return errors;
  },
} as const;
