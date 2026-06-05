// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/design-system)
//
// Registro de ícones por chave estável. Permite que camadas sem UI (domain/data)
// refiram um ícone por string (`IconKey`) sem importar componentes React; a
// apresentação resolve a chave para o componente via `IconByKey`/ICON_REGISTRY.

import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  BellIcon,
  BookIcon,
  BuildingIcon,
  CalendarIcon,
  ChartIcon,
  ClockIcon,
  CreditCardIcon,
  FileTextIcon,
  GraduationIcon,
  HeadsetIcon,
  HelpCircleIcon,
  KeyIcon,
  LifebuoyIcon,
  MessageIcon,
  type IconProps,
  PhoneIcon,
  PlayCircleIcon,
  ReceiptIcon,
  RocketIcon,
  SettingsIcon,
  ShieldIcon,
  SparklesIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
  ZapIcon,
} from "./icons";
import type { ComponentType } from "react";

export const ICON_REGISTRY = {
  chart: ChartIcon,
  users: UsersIcon,
  user: UserIcon,
  headset: HeadsetIcon,
  wallet: WalletIcon,
  shield: ShieldIcon,
  book: BookIcon,
  building: BuildingIcon,
  fileText: FileTextIcon,
  creditCard: CreditCardIcon,
  bell: BellIcon,
  key: KeyIcon,
  lifebuoy: LifebuoyIcon,
  sparkles: SparklesIcon,
  playCircle: PlayCircleIcon,
  message: MessageIcon,
  rocket: RocketIcon,
  helpCircle: HelpCircleIcon,
  graduation: GraduationIcon,
  clock: ClockIcon,
  phone: PhoneIcon,
  calendar: CalendarIcon,
  settings: SettingsIcon,
  receipt: ReceiptIcon,
  zap: ZapIcon,
  arrowDownCircle: ArrowDownCircleIcon,
  arrowUpCircle: ArrowUpCircleIcon,
} as const satisfies Record<string, ComponentType<IconProps>>;

/** Chave estável de ícone usada por domain/data sem acoplar a componentes. */
export type IconKey = keyof typeof ICON_REGISTRY;

/** Resolve uma `IconKey` para o componente de ícone correspondente. */
export function IconByKey({
  name,
  ...props
}: IconProps & { name: IconKey }) {
  const Icon = ICON_REGISTRY[name];
  return <Icon {...props} />;
}
