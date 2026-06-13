/**
 * Models de domínio **compartilhados** entre cadastros de pessoa (ADR-010):
 * endereço e conta bancária. A cidade do endereço vem do módulo `locations`.
 */
export * from './person-address'
export * from './bank-account'
