/**
 * RepresentativeSummary — resumo de representante para o **lookup** (ver spec
 * `employee-registration` §10). Vínculo com o cadastro de representantes; aqui só
 * o necessário para exibir/selecionar (id + nome).
 */
export interface RepresentativeSummary {
  id: number
  name: string
}

export interface RepresentativeSummaryJson {
  id: number
  name: string
}

export function representativeFromJson(json: RepresentativeSummaryJson): RepresentativeSummary {
  return { id: json.id, name: json.name }
}
