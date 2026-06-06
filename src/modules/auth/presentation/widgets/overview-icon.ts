/**
 * overview-icon — mapeia a **chave semântica de ícone** do contrato
 * (`GET /public/login-overview`, ex.: `users`, `car`, `map-pin`) para a classe
 * do Design System (PrimeIcons).
 *
 * Fica na presentation de propósito: o contrato/data carrega apenas a intenção
 * (chave), e a tradução para o conjunto de ícones é decisão visual. Trocar a
 * biblioteca de ícones no futuro muda só este arquivo. Chaves desconhecidas caem
 * num fallback neutro (nunca quebra a UI).
 */
const ICON_MAP: Readonly<Record<string, string>> = {
  // Indicadores
  users: 'pi pi-users',
  building: 'pi pi-building',
  'map-pin': 'pi pi-map-marker',
  map: 'pi pi-map',
  briefcase: 'pi pi-briefcase',
  'th-large': 'pi pi-th-large',
  inbox: 'pi pi-inbox',
  bolt: 'pi pi-bolt',
  // Apps do ecossistema Noturno
  car: 'pi pi-car',
  'shopping-bag': 'pi pi-shopping-bag',
  boxes: 'pi pi-box',
  'message-circle': 'pi pi-comments',
  truck: 'pi pi-truck',
}

const FALLBACK_ICON = 'pi pi-circle'

export function overviewIconClass(key: string): string {
  return ICON_MAP[key] ?? FALLBACK_ICON
}
