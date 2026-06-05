// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/helpers)
//
// Consulta de CEP (ViaCEP) para preenchimento automático de endereço. É uma
// conveniência de UI: falha de rede/CEP inexistente apenas devolve null (sem
// lançar), e o usuário segue preenchendo manualmente. Mantida fora dos módulos
// por ser reutilizável (clientes, franquias, fornecedores...).

export type CepAddress = {
  street: string;
  district: string;
  city: string;
  uf: string;
};

type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

/** Busca o endereço de um CEP. Devolve null em erro/CEP inválido/inexistente. */
export async function lookupCep(cep: string): Promise<CepAddress | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!response.ok) return null;
    const data = (await response.json()) as ViaCepResponse;
    if (data.erro) return null;
    return {
      street: data.logradouro ?? "",
      district: data.bairro ?? "",
      city: data.localidade ?? "",
      uf: data.uf ?? "",
    };
  } catch {
    return null;
  }
}
