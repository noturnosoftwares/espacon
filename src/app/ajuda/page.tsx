// Scope: [M] module-help
//
// Rota da Central de Ajuda (/ajuda). Mantém o App Router fino: apenas delega à
// página do módulo. As abas (Base de Conhecimento, Tutoriais, Novidades,
// Suporte) são selecionadas pelo hash da URL (ex.: /ajuda#tutoriais).

import { HelpPage } from "@/modules/help/presentation/pages/help-page";

export default function Ajuda() {
  return <HelpPage />;
}
