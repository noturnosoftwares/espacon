// Scope: [M] module-help
//
// Central de Ajuda. Reaproveita o AuthenticatedShell (menu + navbar + guard) e
// renderiza um centro de ajuda em abas (Base de Conhecimento, Tutoriais,
// Novidades, Suporte) com busca. A aba ativa é sincronizada com o hash da URL,
// de modo que os itens do menu lateral (/ajuda#tutoriais, ...) selecionem a aba
// correspondente. A HelpStore (instância por tela) carrega o conteúdo mock-first.

"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/shared/stores/base-store";
import { BaseCard } from "@/shared/widgets/base-card";
import { IconByKey } from "@/shared/design-system/icon-key";
import {
  BookIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
} from "@/shared/design-system/icons";
import { AuthenticatedShell } from "@/modules/home/presentation/widgets/authenticated-shell";
import { makeGetHelpCenterUseCase } from "../../data/help-factory";
import { HelpStore, HELP_TABS, type HelpTab } from "../stores/help-store";
import { HelpCategoryCard } from "../widgets/help-category-card";
import { HelpArticleRow } from "../widgets/help-article-row";
import { HelpTutorialCard } from "../widgets/help-tutorial-card";
import { HelpNewsItem } from "../widgets/help-news-item";
import { HelpFaqItem } from "../widgets/help-faq-item";
import { HelpSupportChannels } from "../widgets/help-support-channels";

// Mapeamento aba ⇄ hash da URL (itens do menu lateral apontam para estes hashes).
const TAB_TO_HASH: Record<HelpTab, string> = {
  knowledge: "",
  tutorials: "tutoriais",
  news: "novidades",
  support: "suporte",
};
const HASH_TO_TAB: Record<string, HelpTab> = {
  tutoriais: "tutorials",
  novidades: "news",
  suporte: "support",
};

export function HelpPage() {
  return <AuthenticatedShell>{() => <HelpContent />}</AuthenticatedShell>;
}

function HelpContent() {
  const [store] = useState(() => new HelpStore(makeGetHelpCenterUseCase()));
  const state = useStore(store, (s) => s);

  useEffect(() => {
    void store.init();
  }, [store]);

  // Sincroniza a aba ativa com o hash da URL (montagem + navegação do menu).
  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash.replace("#", "");
      store.setTab(HASH_TO_TAB[hash] ?? "knowledge");
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [store]);

  const selectTab = (tab: HelpTab) => {
    store.setTab(tab);
    const hash = TAB_TO_HASH[tab];
    window.history.replaceState(
      null,
      "",
      hash ? `#${hash}` : window.location.pathname,
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 animate-fade-in">
      {/* Herói + busca. */}
      <BaseCard className="relative isolate overflow-hidden p-6 sm:p-8">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 size-60 rounded-full bg-noturno-orange opacity-15 blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 right-24 -z-10 text-white/[0.03]"
        >
          <BookIcon size={160} strokeWidth={1} />
        </span>

        <div className="flex max-w-2xl flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-noturno-orange/10 px-2.5 py-1 text-xs font-medium text-noturno-orange">
            <SparklesIcon size={14} />
            Central de Ajuda
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Como podemos ajudar?
          </h1>
          <p className="text-sm text-noturno-grey-light">
            Pesquise na base de conhecimento, siga tutoriais, veja as novidades e
            fale com o suporte.
          </p>
        </div>

        <div className="relative mt-5 max-w-xl">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-noturno-grey-light">
            <SearchIcon size={18} />
          </span>
          <input
            type="search"
            value={state.query}
            onChange={(e) => store.setQuery(e.target.value)}
            placeholder="Pesquisar artigos, tutoriais, perguntas..."
            className="h-11 w-full rounded-xl border border-white/10 bg-noturno-black/40 pl-11 pr-10 text-sm text-white placeholder:text-noturno-grey-light/70 outline-none transition-colors focus:border-noturno-orange/60 focus:bg-noturno-black/60"
          />
          {state.query && (
            <button
              type="button"
              onClick={() => store.setQuery("")}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-noturno-grey-light transition-colors hover:text-white"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
      </BaseCard>

      {/* Abas. */}
      <div className="flex flex-wrap gap-2 border-b border-white/8 pb-px">
        {HELP_TABS.map((tab) => {
          const active = state.activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              aria-current={active ? "page" : undefined}
              className={
                "relative rounded-t-lg px-3.5 py-2 text-sm font-medium transition-colors " +
                (active
                  ? "text-noturno-orange"
                  : "text-noturno-grey-light hover:text-white")
              }
            >
              {tab.label}
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-noturno-orange" />
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo. */}
      {state.loading ? (
        <HelpSkeleton />
      ) : state.errorMessage ? (
        <BaseCard className="p-8 text-center text-sm text-noturno-grey-light">
          {state.errorMessage}
        </BaseCard>
      ) : (
        <HelpTabContent store={store} state={state} />
      )}
    </div>
  );
}

function HelpTabContent({
  store,
  state,
}: {
  store: HelpStore;
  state: { activeTab: HelpTab };
}) {
  if (state.activeTab === "knowledge") {
    const categories = store.categories;
    const articles = store.articles;

    if (store.hasActiveQuery && categories.length === 0 && articles.length === 0) {
      return <HelpEmpty />;
    }

    return (
      <div className="flex flex-col gap-8">
        {categories.length > 0 && (
          <section className="flex flex-col gap-4">
            <SectionTitle title="Categorias" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {categories.map((category) => (
                <HelpCategoryCard key={category.id} category={category} />
              ))}
            </div>
          </section>
        )}

        {articles.length > 0 && (
          <section className="flex flex-col gap-4">
            <SectionTitle
              title={store.hasActiveQuery ? "Artigos encontrados" : "Artigos populares"}
            />
            <div className="flex flex-col gap-3">
              {articles.map((article) => (
                <HelpArticleRow key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  if (state.activeTab === "tutorials") {
    const tutorials = store.tutorials;
    if (tutorials.length === 0) return <HelpEmpty />;
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tutorials.map((tutorial) => (
          <HelpTutorialCard key={tutorial.id} tutorial={tutorial} />
        ))}
      </div>
    );
  }

  if (state.activeTab === "news") {
    const news = store.getSnapshot().center?.news ?? [];
    return (
      <BaseCard className="p-6">
        <ul className="flex flex-col">
          {news.map((item, i) => (
            <HelpNewsItem key={item.id} news={item} last={i === news.length - 1} />
          ))}
        </ul>
      </BaseCard>
    );
  }

  // support
  const faqs = store.faqs;
  return (
    <div className="flex flex-col gap-8">
      <HelpSupportChannels />
      <section className="flex flex-col gap-4">
        <SectionTitle title="Perguntas frequentes" />
        {faqs.length === 0 ? (
          <HelpEmpty />
        ) : (
          <div className="flex flex-col gap-3">
            {faqs.map((faq) => (
              <HelpFaqItem key={faq.id} faq={faq} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wider text-noturno-grey-light">
      {title}
    </h2>
  );
}

function HelpEmpty() {
  return (
    <BaseCard className="flex flex-col items-center gap-3 p-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-white/5 text-noturno-grey-light">
        <IconByKey name="helpCircle" size={24} />
      </span>
      <p className="text-sm text-noturno-grey-light">
        Nenhum resultado encontrado. Tente outros termos ou abra um chamado de
        suporte.
      </p>
    </BaseCard>
  );
}

function HelpSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <BaseCard
          key={i}
          className="h-[150px] animate-pulse bg-white/[0.04]"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
