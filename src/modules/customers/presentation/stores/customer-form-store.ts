// Scope: [M] module-customers
//
// Store do formulário de Cadastro/Edição de Cliente (CRUD — escrita). Estende
// BaseStore. Mantém um rascunho (`CustomerInput`) imutável, os erros por campo
// (regra pura `CustomerRules.validateInput`) e o estado de submit. Faz o de-para
// do cliente carregado → rascunho no modo edição. Instância POR TELA.

import { BaseStore, type BaseState } from "@/shared/stores/base-store";
import { toISODate } from "@/shared/helpers/format";
import { lookupCep } from "@/shared/helpers/cep";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type {
  Address,
  Contact,
  ContractSummary,
  Customer,
  CustomerInput,
  Representation,
} from "../../domain/models/customer";
import {
  CustomerRules,
  type CustomerFieldErrors,
} from "../../domain/models/customer-rules";
import type { CreateCustomerUseCase } from "../../data/application/create-customer-usecase";
import type { UpdateCustomerUseCase } from "../../data/application/update-customer-usecase";
import type { GetCustomerUseCase } from "../../data/application/get-customer-usecase";

export type CustomerFormMode = "create" | "edit";

type CustomerFormState = BaseState & {
  mode: CustomerFormMode;
  draft: CustomerInput;
  errors: CustomerFieldErrors;
  submitting: boolean;
  notFound: boolean;
  cepLoading: boolean;
};

function emptyContact(id: string): Contact {
  return { id, name: "", phone: "", mobile: "", email: "" };
}

function emptyDraft(): CustomerInput {
  return {
    personType: "pj",
    legalName: "",
    tradeName: "",
    document: "",
    stateRegistration: "",
    address: {
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      uf: "",
      zip: "",
    },
    contacts: [emptyContact("new-1")],
    paymentMethod: "boleto",
    status: "ativo",
    financialStatus: "em-dia",
    contract: {
      plan: "Advanced",
      modality: "Mensal",
      computersContracted: 1,
      computersInstalled: 0,
      monthlyValue: 0,
      signStatus: "aguardando",
      contractDate: toISODate(new Date()),
    },
    representation: { owner: "matriz" },
  };
}

/** De-para do cliente carregado → campos editáveis do formulário. */
function customerToInput(c: Customer): CustomerInput {
  return {
    personType: c.personType,
    legalName: c.legalName,
    tradeName: c.tradeName ?? "",
    document: c.document,
    stateRegistration: c.stateRegistration ?? "",
    address: { ...c.address },
    contacts: c.contacts.length
      ? c.contacts.map((ct) => ({ ...ct }))
      : [emptyContact("new-1")],
    paymentMethod: c.paymentMethod,
    status: c.status,
    financialStatus: c.financialStatus,
    contract: { ...c.contract },
    representation: { ...c.representation },
    franchiseId: c.franchiseId,
    representativeId: c.representativeId,
  };
}

export class CustomerFormStore extends BaseStore<CustomerFormState> {
  private contactSeq = 1;
  /** Id do cliente em edição (definido em `initEdit`). */
  private editId = "";

  constructor(
    private readonly createCustomer: CreateCustomerUseCase,
    private readonly updateCustomer: UpdateCustomerUseCase,
    private readonly getCustomer: GetCustomerUseCase,
  ) {
    super({
      ...BaseStore.baseState(),
      mode: "create",
      draft: emptyDraft(),
      errors: {},
      submitting: false,
      notFound: false,
      cepLoading: false,
    });
  }

  private get draft(): CustomerInput {
    return this.getSnapshot().draft;
  }

  /** Inicializa em modo criação (rascunho vazio). */
  initCreate(): void {
    this.setState({
      mode: "create",
      draft: emptyDraft(),
      errors: {},
      isInitialized: true,
      notFound: false,
      errorMessage: null,
      successMessage: null,
    });
  }

  /** Carrega o cliente e inicializa em modo edição. */
  async initEdit(id: string): Promise<void> {
    this.editId = id;
    this.setState({ mode: "edit", loading: true, errorMessage: null, notFound: false });
    const result = await this.getCustomer.execute(id);

    if (!result.success) {
      this.setState({ loading: false, isInitialized: true, errorMessage: result.error.message });
      return;
    }
    if (!result.data) {
      this.setState({ loading: false, isInitialized: true, notFound: true });
      return;
    }
    this.setState({
      draft: customerToInput(result.data),
      errors: {},
      loading: false,
      isInitialized: true,
    });
  }

  // ----- Mutadores do rascunho (imutáveis) -----

  private clearErrors(keys: string[]): void {
    const current = this.getSnapshot().errors;
    if (!keys.some((k) => k in current)) return;
    const next = { ...current };
    for (const k of keys) delete next[k];
    this.setState({ errors: next });
  }

  patch(partial: Partial<CustomerInput>): void {
    this.setState({ draft: { ...this.draft, ...partial } });
    this.clearErrors(Object.keys(partial));
  }

  setPersonType(personType: CustomerInput["personType"]): void {
    this.patch({ personType });
    this.clearErrors(["document"]);
  }

  patchAddress(partial: Partial<Address>): void {
    this.setState({ draft: { ...this.draft, address: { ...this.draft.address, ...partial } } });
    this.clearErrors(Object.keys(partial));
  }

  patchContract(partial: Partial<ContractSummary>): void {
    this.setState({
      draft: { ...this.draft, contract: { ...this.draft.contract, ...partial } },
    });
    this.clearErrors(Object.keys(partial));
  }

  patchRepresentation(partial: Partial<Representation>): void {
    this.setState({
      draft: {
        ...this.draft,
        representation: { ...this.draft.representation, ...partial },
      },
    });
  }

  addContact(): void {
    this.contactSeq += 1;
    const next = [...this.draft.contacts, emptyContact(`new-${this.contactSeq}`)];
    this.setState({ draft: { ...this.draft, contacts: next } });
  }

  removeContact(id: string): void {
    const remaining = this.draft.contacts.filter((c) => c.id !== id);
    this.setState({
      draft: {
        ...this.draft,
        contacts: remaining.length ? remaining : [emptyContact("new-1")],
      },
    });
  }

  patchContact(id: string, partial: Partial<Contact>): void {
    const contacts = this.draft.contacts.map((c) =>
      c.id === id ? { ...c, ...partial } : c,
    );
    this.setState({ draft: { ...this.draft, contacts } });
    this.clearErrors(["contacts"]);
  }

  /** Consulta o CEP e preenche o endereço (mantém o que o usuário já digitou). */
  async applyCep(): Promise<void> {
    const zip = this.draft.address.zip;
    if (zip.replace(/\D/g, "").length !== 8) return;
    this.setState({ cepLoading: true });
    const found = await lookupCep(zip);
    this.setState({ cepLoading: false });
    if (!found) return;
    this.patchAddress({
      street: found.street || this.draft.address.street,
      district: found.district || this.draft.address.district,
      city: found.city || this.draft.address.city,
      uf: found.uf || this.draft.address.uf,
    });
  }

  // ----- Submit -----

  /** Valida e persiste. Devolve o cliente salvo (para navegação) ou null. */
  async submit(user: AuthenticatedUser): Promise<Customer | null> {
    const errors = CustomerRules.validateInput(this.draft);
    if (Object.keys(errors).length > 0) {
      this.setState({ errors, errorMessage: "Verifique os campos destacados." });
      return null;
    }

    this.setState({ submitting: true, errorMessage: null, successMessage: null, errors: {} });
    const mode = this.getSnapshot().mode;
    const result =
      mode === "create"
        ? await this.createCustomer.execute(user, this.draft)
        : await this.updateCustomer.execute(user, this.editId, this.draft);

    if (!result.success) {
      const fieldErrors: CustomerFieldErrors =
        result.error.code === "customers/duplicate-document"
          ? { document: result.error.message }
          : {};
      this.setState({
        submitting: false,
        errorMessage: result.error.message,
        errors: { ...this.getSnapshot().errors, ...fieldErrors },
      });
      return null;
    }

    this.setState({
      submitting: false,
      successMessage:
        mode === "create" ? "Cliente cadastrado." : "Alterações salvas.",
    });
    return result.data;
  }
}
