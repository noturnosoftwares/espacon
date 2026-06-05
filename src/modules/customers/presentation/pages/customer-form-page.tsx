// Scope: [M] module-customers
//
// Formulário de Cadastro/Edição de Cliente (CRUD — escrita). Cobre a Aba
// Principal (dados básicos, endereço com consulta de CEP, contatos múltiplos,
// forma de pagamento, situação) + contrato (plano obrigatório) e representação,
// suficientes para criar um Customer válido. Reaproveita o AuthenticatedShell
// (menu + navbar + guard) e o card de seção do detalhe. A escrita é gated por
// `clients.edit` (também no UseCase).

"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/shared/stores/base-store";
import { BaseCard } from "@/shared/widgets/base-card";
import { PermissionExt } from "@/shared/extensions/permission-ext";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import {
  ChevronRightIcon,
  CreditCardIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  ShieldIcon,
  UserIcon,
  WalletIcon,
  XIcon,
} from "@/shared/design-system/icons";
import { AuthenticatedShell } from "@/modules/home/presentation/widgets/authenticated-shell";
import {
  makeCreateCustomerUseCase,
  makeGetCustomerUseCase,
  makeUpdateCustomerUseCase,
} from "../../data/customer-factory";
import { CustomerRules } from "../../domain/models/customer-rules";
import { CustomerFormStore, type CustomerFormMode } from "../stores/customer-form-store";
import { Section } from "../widgets/customer-detail-ui";
import {
  OWNER_LABEL,
  PAYMENT_METHOD_LABEL,
  PERSON_TYPE_LABEL,
  SIGN_LABEL,
  STATUS_LABEL,
} from "../customer-labels";

export function CustomerFormPage({
  mode,
  id,
}: {
  mode: CustomerFormMode;
  id?: string;
}) {
  return (
    <AuthenticatedShell>
      {({ user }) => <FormContent mode={mode} id={id} user={user} />}
    </AuthenticatedShell>
  );
}

function FormContent({
  mode,
  id,
  user,
}: {
  mode: CustomerFormMode;
  id?: string;
  user: AuthenticatedUser;
}) {
  const router = useRouter();
  const [store] = useState(
    () =>
      new CustomerFormStore(
        makeCreateCustomerUseCase(),
        makeUpdateCustomerUseCase(),
        makeGetCustomerUseCase(),
      ),
  );
  const state = useStore(store, (s) => s);
  const canEdit = PermissionExt.has(user.permissions, "clients.edit");

  useEffect(() => {
    if (mode === "edit" && id) void store.initEdit(id);
    else store.initCreate();
  }, [store, mode, id]);

  if (!canEdit) {
    return (
      <Guard>
        <p className="text-sm text-noturno-grey-light">
          Você não tem permissão para {mode === "edit" ? "editar" : "cadastrar"}{" "}
          clientes.
        </p>
        <BackLink />
      </Guard>
    );
  }

  if (state.loading || !state.isInitialized) return <FormSkeleton />;

  if (state.notFound) {
    return (
      <Guard>
        <p className="text-sm text-noturno-grey-light">Cliente não encontrado.</p>
        <BackLink />
      </Guard>
    );
  }

  const { draft, errors } = state;
  const isPj = draft.personType === "pj";
  const title = mode === "edit" ? "Editar cliente" : "Novo cliente";

  const submit = async () => {
    const saved = await store.submit(user);
    if (saved) router.push(`/clientes/${saved.id}`);
  };

  return (
    <div className="flex w-full flex-col gap-6 animate-fade-in">
      {/* Breadcrumb. */}
      <nav className="flex items-center gap-1.5 text-sm text-noturno-grey-light">
        <Link href="/clientes" className="transition-colors hover:text-white">
          Clientes
        </Link>
        <ChevronRightIcon size={14} />
        <span className="text-noturno-grey-light-clean">{title}</span>
      </nav>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
        <p className="text-sm text-noturno-grey-light">
          {mode === "edit"
            ? "Atualize os dados cadastrais do cliente."
            : "Cadastro completo do cliente — núcleo comercial, contratual e financeiro."}
        </p>
      </header>

      {state.errorMessage && (
        <div className="rounded-xl border border-noturno-red/30 bg-noturno-red/[0.08] px-4 py-3 text-sm text-noturno-red">
          {state.errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Dados básicos. */}
        <Section title="Dados básicos" icon={UserIcon} className="lg:col-span-2">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Tipo de pessoa</FieldLabel>
            <div className="flex gap-2">
              {(["pj", "pf"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => store.setPersonType(t)}
                  className={
                    "h-10 rounded-xl border px-4 text-sm font-medium transition-colors " +
                    (draft.personType === t
                      ? "border-noturno-orange/60 bg-noturno-orange/10 text-noturno-orange"
                      : "border-white/10 text-noturno-grey-light hover:border-white/20 hover:text-white")
                  }
                >
                  {PERSON_TYPE_LABEL[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label={isPj ? "Razão Social" : "Nome completo"}
              value={draft.legalName}
              onChange={(v) => store.patch({ legalName: v })}
              error={errors.legalName}
              required
            />
            <TextField
              label={isPj ? "Nome fantasia" : "Apelido"}
              value={draft.tradeName ?? ""}
              onChange={(v) => store.patch({ tradeName: v })}
            />
            <TextField
              label={isPj ? "CNPJ" : "CPF"}
              value={draft.document}
              onChange={(v) => store.patch({ document: v })}
              error={errors.document}
              placeholder={isPj ? "00.000.000/0000-00" : "000.000.000-00"}
              required
            />
            <TextField
              label={isPj ? "Inscrição Estadual" : "RG"}
              value={draft.stateRegistration ?? ""}
              onChange={(v) => store.patch({ stateRegistration: v })}
            />
          </div>
        </Section>

        {/* Endereço. */}
        <Section title="Endereço" icon={MapPinIcon}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="CEP"
              value={draft.address.zip}
              onChange={(v) => store.patchAddress({ zip: v })}
              onBlur={() => void store.applyCep()}
              error={errors.zip}
              placeholder="00000-000"
              rightHint={state.cepLoading ? "Buscando..." : undefined}
              required
            />
            <div className="hidden sm:block" />
            <div className="sm:col-span-2">
              <TextField
                label="Logradouro"
                value={draft.address.street}
                onChange={(v) => store.patchAddress({ street: v })}
                error={errors.street}
                required
              />
            </div>
            <TextField
              label="Número"
              value={draft.address.number}
              onChange={(v) => store.patchAddress({ number: v })}
              error={errors.number}
              required
            />
            <TextField
              label="Complemento"
              value={draft.address.complement ?? ""}
              onChange={(v) => store.patchAddress({ complement: v })}
            />
            <TextField
              label="Bairro"
              value={draft.address.district}
              onChange={(v) => store.patchAddress({ district: v })}
            />
            <div className="grid grid-cols-[1fr_88px] gap-3">
              <TextField
                label="Cidade"
                value={draft.address.city}
                onChange={(v) => store.patchAddress({ city: v })}
                error={errors.city}
                required
              />
              <TextField
                label="UF"
                value={draft.address.uf}
                onChange={(v) => store.patchAddress({ uf: v.toUpperCase().slice(0, 2) })}
                error={errors.uf}
                required
              />
            </div>
          </div>
        </Section>

        {/* Contatos. */}
        <Section
          title="Contatos"
          icon={PhoneIcon}
          action={
            <button
              type="button"
              onClick={() => store.addContact()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-noturno-orange transition-colors hover:text-noturno-orange-dark"
            >
              <PlusIcon size={14} />
              Adicionar
            </button>
          }
        >
          {errors.contacts && <FieldError>{errors.contacts}</FieldError>}
          <div className="flex flex-col gap-3">
            {draft.contacts.map((c, i) => (
              <div
                key={c.id}
                className="flex flex-col gap-3 rounded-xl bg-white/[0.03] p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-noturno-grey-light/70">
                    Contato {i + 1}
                  </span>
                  {draft.contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => store.removeContact(c.id)}
                      aria-label="Remover contato"
                      className="text-noturno-grey-light transition-colors hover:text-noturno-red"
                    >
                      <XIcon size={15} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField
                    label="Nome"
                    value={c.name}
                    onChange={(v) => store.patchContact(c.id, { name: v })}
                  />
                  <TextField
                    label="Celular"
                    value={c.mobile ?? ""}
                    onChange={(v) => store.patchContact(c.id, { mobile: v })}
                  />
                  <TextField
                    label="Telefone"
                    value={c.phone ?? ""}
                    onChange={(v) => store.patchContact(c.id, { phone: v })}
                  />
                  <TextField
                    label="E-mail"
                    type="email"
                    value={c.email ?? ""}
                    onChange={(v) => store.patchContact(c.id, { email: v })}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Forma de pagamento e situação. */}
        <Section title="Pagamento e situação" icon={CreditCardIcon}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Forma de pagamento"
              value={draft.paymentMethod}
              onChange={(v) =>
                store.patch({ paymentMethod: v as typeof draft.paymentMethod })
              }
              options={Object.entries(PAYMENT_METHOD_LABEL)}
            />
            <SelectField
              label="Situação"
              value={draft.status}
              onChange={(v) => store.patch({ status: v as typeof draft.status })}
              options={Object.entries(STATUS_LABEL)}
            />
          </div>
        </Section>

        {/* Contrato. */}
        <Section title="Contrato" icon={WalletIcon}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Plano"
              value={draft.contract.plan}
              onChange={(v) => store.patchContract({ plan: v })}
              error={errors.plan}
              required
            />
            <SelectField
              label="Modalidade"
              value={draft.contract.modality}
              onChange={(v) => store.patchContract({ modality: v })}
              options={Object.entries({ Mensal: "Mensal", Anual: "Anual" })}
            />
            <TextField
              label="Data do contrato"
              type="date"
              value={draft.contract.contractDate}
              onChange={(v) => store.patchContract({ contractDate: v })}
              error={errors.contractDate}
              required
            />
            <SelectField
              label="Assinatura"
              value={draft.contract.signStatus}
              onChange={(v) =>
                store.patchContract({
                  signStatus: v as typeof draft.contract.signStatus,
                })
              }
              options={Object.entries(SIGN_LABEL)}
            />
            <NumberField
              label="Computadores contratados"
              value={draft.contract.computersContracted}
              onChange={(n) => store.patchContract({ computersContracted: n })}
              error={errors.computersContracted}
              min={1}
            />
            <NumberField
              label="Computadores instalados"
              value={draft.contract.computersInstalled}
              onChange={(n) => store.patchContract({ computersInstalled: n })}
              min={0}
            />
            <NumberField
              label="Mensalidade (R$)"
              value={draft.contract.monthlyValue}
              onChange={(n) => store.patchContract({ monthlyValue: n })}
              min={0}
              step={0.01}
            />
            <ReadOnlyField
              label="Dia de pagamento"
              value={`Dia ${CustomerRules.paymentDay(draft.contract.contractDate)}`}
              hint="Definido automaticamente pela data do contrato."
            />
          </div>
        </Section>

        {/* Representação. */}
        <Section title="Representação" icon={ShieldIcon} className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <SelectField
              label="Pertence a"
              value={draft.representation.owner}
              onChange={(v) =>
                store.patchRepresentation({
                  owner: v as typeof draft.representation.owner,
                })
              }
              options={Object.entries(OWNER_LABEL)}
            />
            <TextField
              label="Franquia"
              value={draft.representation.franchiseName ?? ""}
              onChange={(v) => store.patchRepresentation({ franchiseName: v })}
            />
            <TextField
              label="Representante"
              value={draft.representation.representativeName ?? ""}
              onChange={(v) =>
                store.patchRepresentation({ representativeName: v })
              }
            />
          </div>
        </Section>
      </div>

      {/* Ações. */}
      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t border-white/8 bg-noturno-black/80 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
        <Link
          href={mode === "edit" && id ? `/clientes/${id}` : "/clientes"}
          className="inline-flex h-11 items-center rounded-xl border border-white/10 px-5 text-sm font-semibold text-noturno-grey-light-clean transition-colors hover:border-white/20 hover:text-white"
        >
          Cancelar
        </Link>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={state.submitting}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-noturno-orange px-6 text-sm font-semibold text-noturno-black transition-colors hover:bg-noturno-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.submitting
            ? "Salvando..."
            : mode === "edit"
              ? "Salvar alterações"
              : "Cadastrar cliente"}
        </button>
      </div>
    </div>
  );
}

// ----- Campos do formulário -----

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-xs font-medium uppercase tracking-wider text-noturno-grey-light">
      {children}
    </label>
  );
}

function FieldError({ children }: { children: ReactNode }) {
  return <span className="text-xs text-noturno-red">{children}</span>;
}

const CONTROL_CLASS =
  "h-11 w-full rounded-xl border bg-noturno-black-secondary px-3.5 text-sm text-white placeholder:text-noturno-grey-light/50 outline-none transition-colors focus:border-noturno-orange/70";

function controlBorder(error?: string): string {
  return error ? "border-noturno-red/60" : "border-white/10";
}

function TextField({
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  type = "text",
  onBlur,
  rightHint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  onBlur?: () => void;
  rightHint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <FieldLabel>
          {label}
          {required && <span className="text-noturno-orange"> *</span>}
        </FieldLabel>
        {rightHint && (
          <span className="text-[11px] text-noturno-grey-light/70">{rightHint}</span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={CONTROL_CLASS + " " + controlBorder(error) + " [color-scheme:dark]"}
      />
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  error,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  min?: number;
  step?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        step={step}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className={CONTROL_CLASS + " " + controlBorder(error)}
      />
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={CONTROL_CLASS + " " + controlBorder()}
      >
        {options.map(([val, lbl]) => (
          <option key={val} value={val} className="bg-noturno-black-secondary">
            {lbl}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-11 items-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3.5 text-sm text-noturno-grey-light-clean">
        {value}
      </div>
      {hint && <span className="text-[11px] text-noturno-grey-light/70">{hint}</span>}
    </div>
  );
}

// ----- Estados auxiliares -----

function BackLink() {
  return (
    <Link
      href="/clientes"
      className="inline-flex w-fit items-center gap-1.5 text-sm text-noturno-grey-light transition-colors hover:text-white"
    >
      <ChevronRightIcon size={16} className="rotate-180" />
      Voltar para clientes
    </Link>
  );
}

function Guard({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 py-16 text-center animate-fade-in">
      {children}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6">
      <BaseCard className="h-20 animate-pulse bg-white/[0.04]" aria-hidden="true" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <BaseCard
            key={i}
            className="h-56 animate-pulse bg-white/[0.04]"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
