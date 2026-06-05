// Scope: [M] module-help
//
// Store da Central de Ajuda. Estende apenas BaseStore (não é CRUD). Carrega o
// agregado de conteúdo uma vez por tela e mantém o estado de UI da página: aba
// ativa e termo de busca. A filtragem por busca é derivada (getters), sem mutar
// os dados de origem. Instância POR TELA.

import { BaseStore, type BaseState } from "@/shared/stores/base-store";
import type {
  HelpArticle,
  HelpCategory,
  HelpCenter,
  HelpFaq,
  HelpTutorial,
} from "../../domain/models/help-content";
import type { GetHelpCenterUseCase } from "../../data/application/get-help-center-usecase";

/** Abas da Central de Ajuda (sincronizadas com o hash da URL). */
export type HelpTab = "knowledge" | "tutorials" | "news" | "support";

export const HELP_TABS: { id: HelpTab; label: string }[] = [
  { id: "knowledge", label: "Base de Conhecimento" },
  { id: "tutorials", label: "Tutoriais" },
  { id: "news", label: "Novidades" },
  { id: "support", label: "Suporte" },
];

type HelpState = BaseState & {
  center: HelpCenter | null;
  activeTab: HelpTab;
  query: string;
};

export class HelpStore extends BaseStore<HelpState> {
  constructor(private readonly getHelpCenter: GetHelpCenterUseCase) {
    super({
      ...BaseStore.baseState(),
      center: null,
      activeTab: "knowledge",
      query: "",
    });
  }

  // ----- Init -----

  async init(): Promise<void> {
    if (this.getSnapshot().isInitialized) return;
    this.setState({ loading: true, errorMessage: null });

    const result = await this.getHelpCenter.execute();
    if (!result.success) {
      this.setState({
        loading: false,
        isInitialized: true,
        errorMessage: result.error.message,
      });
      return;
    }

    this.setState({
      center: result.data,
      loading: false,
      isInitialized: true,
    });
  }

  // ----- UI -----

  setTab(tab: HelpTab): void {
    if (this.getSnapshot().activeTab !== tab) this.setState({ activeTab: tab });
  }

  setQuery(query: string): void {
    this.setState({ query });
  }

  // ----- Derived (busca) -----

  private get normalizedQuery(): string {
    return this.getSnapshot().query.trim().toLowerCase();
  }

  private matches(...fields: (string | undefined)[]): boolean {
    const q = this.normalizedQuery;
    if (!q) return true;
    return fields.some((f) => f?.toLowerCase().includes(q));
  }

  get categories(): HelpCategory[] {
    const center = this.getSnapshot().center;
    if (!center) return [];
    return center.categories.filter((c) =>
      this.matches(c.title, c.description),
    );
  }

  get articles(): HelpArticle[] {
    const center = this.getSnapshot().center;
    if (!center) return [];
    return center.popularArticles.filter((a) =>
      this.matches(a.title, a.excerpt, a.tags?.join(" ")),
    );
  }

  get tutorials(): HelpTutorial[] {
    const center = this.getSnapshot().center;
    if (!center) return [];
    return center.tutorials.filter((t) =>
      this.matches(t.title, t.description, t.level),
    );
  }

  get faqs(): HelpFaq[] {
    const center = this.getSnapshot().center;
    if (!center) return [];
    return center.faqs.filter((f) => this.matches(f.question, f.answer));
  }

  /** true quando há busca ativa mas nenhum resultado na aba atual. */
  get hasActiveQuery(): boolean {
    return this.normalizedQuery.length > 0;
  }
}
