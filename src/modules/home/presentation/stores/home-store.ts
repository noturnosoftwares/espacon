// Scope: [M] module-home
//
// Store da tela principal. Estende apenas BaseStore (não é CRUD). Orquestra o
// carregamento dos dados da home a partir da sessão do usuário autenticado:
// navegação visível (regra de permissão), widgets do dashboard e notificações.
// Instância POR TELA. Métodos agrupados por contexto (Session / Dashboard /
// Notifications).

import { BaseStore, type BaseState } from "@/shared/stores/base-store";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type { SessionRepository } from "@/modules/auth/domain/repositories/session-repository";
import type { NavGroup } from "../../domain/models/nav";
import type { DashboardWidget } from "../../domain/models/dashboard-widget";
import type { DashboardCharts } from "../../domain/models/dashboard-charts";
import type { AppNotification } from "../../domain/models/notification";
import type { GetDashboardUseCase } from "../../data/application/get-dashboard-usecase";
import type { GetDashboardChartsUseCase } from "../../data/application/get-dashboard-charts-usecase";
import type { GetNotificationsUseCase } from "../../data/application/get-notifications-usecase";
import { buildNavigation } from "../../data/application/build-navigation";

type HomeState = BaseState & {
  currentUser: AuthenticatedUser | null;
  /** true quando não há sessão (gatilho de redirecionamento ao login). */
  unauthenticated: boolean;
  nav: NavGroup[];
  widgets: DashboardWidget[];
  charts: DashboardCharts | null;
  notifications: AppNotification[];
};

export class HomeStore extends BaseStore<HomeState> {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly getDashboardUseCase: GetDashboardUseCase,
    private readonly getDashboardChartsUseCase: GetDashboardChartsUseCase,
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
  ) {
    super({
      ...BaseStore.baseState(),
      currentUser: null,
      unauthenticated: false,
      nav: [],
      widgets: [],
      charts: null,
      notifications: [],
    });
  }

  // ----- Derived -----

  /** Notificações não lidas (badge da central). */
  get unreadCount(): number {
    return this.getSnapshot().notifications.filter((n) => !n.read).length;
  }

  // ----- Session -----

  /**
   * Inicializa a tela: restaura a sessão e, havendo usuário, monta a navegação
   * (por permissão) e carrega dashboard + notificações. Sem sessão → marca
   * `unauthenticated` (a página redireciona ao login — guard básico).
   */
  async init(): Promise<void> {
    this.setState({ loading: true, errorMessage: null });

    const session = await this.sessionRepository.restore();
    const user = session.success ? session.data : null;

    if (!user) {
      this.setState({
        loading: false,
        isInitialized: true,
        unauthenticated: true,
      });
      return;
    }

    this.setState({ currentUser: user, nav: buildNavigation(user) });

    await Promise.all([
      this.loadDashboard(user),
      this.loadCharts(user),
      this.loadNotifications(),
    ]);

    this.setState({ loading: false, isInitialized: true });
  }

  /** Encerra a sessão (logout). */
  async signOut(): Promise<void> {
    await this.sessionRepository.clear();
    this.setState({ currentUser: null, unauthenticated: true });
  }

  // ----- Dashboard -----

  private async loadDashboard(user: AuthenticatedUser): Promise<void> {
    const result = await this.getDashboardUseCase.execute(user);
    if (result.success) {
      this.setState({ widgets: result.data });
      return;
    }
    this.setState({ errorMessage: result.error.message });
  }

  private async loadCharts(user: AuthenticatedUser): Promise<void> {
    const result = await this.getDashboardChartsUseCase.execute(user);
    if (result.success) {
      this.setState({ charts: result.data });
    }
    // Falha em gráficos não bloqueia a home — apenas não exibe a seção.
  }

  // ----- Notifications -----

  private async loadNotifications(): Promise<void> {
    const result = await this.getNotificationsUseCase.execute();
    if (result.success) {
      this.setState({ notifications: result.data });
    }
    // Falha em notificações não bloqueia a home — apenas não popula a lista.
  }

  /** Marca todas as notificações como lidas (estado local da tela). */
  markAllNotificationsRead(): void {
    const notifications = this.getSnapshot().notifications.map((n) =>
      n.read ? n : { ...n, read: true },
    );
    this.setState({ notifications });
  }
}
