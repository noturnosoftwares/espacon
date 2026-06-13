import type { SupplierJson } from '../../domain/models'

/**
 * mock-suppliers — ~12 fornecedores na fase mock-first (spec §16): PJ com CNPJ
 * **numérico e alfanumérico** (ADR-009), PF (CPF), e **genéricos** (DAS/DARF/DARE,
 * sem documento), ativos/inativos, com/sem fiscal/bancário. CNPJs/CPFs são
 * **válidos** e os CEPs coerentes com a UF (passam nas extensions). `cidadeId`
 * referencia o mock de cidades do módulo `locations` (capitais 1–12).
 *
 * TROCA POR API REAL: `RestSupplierProvider` (`/suppliers`), mesmo contrato JSON.
 */
type AddressJson = SupplierJson['endereco']
type BankJson = SupplierJson['banco']
type FiscalJson = SupplierJson['fiscal']

function addr(
  logradouro: string,
  numero: string,
  bairro: string,
  cidadeId: number,
  cidadeNome: string,
  uf: string,
  cep: string,
  complemento = '',
): AddressJson {
  return { logradouro, numero, complemento, bairro, cidadeId, cidadeNome, uf, paisId: 1, paisNome: 'Brasil', cep }
}
function noAddr(): AddressJson {
  return { logradouro: '', numero: '', complemento: '', bairro: '', cidadeId: null, cidadeNome: '', uf: '', paisId: null, paisNome: '', cep: '' }
}
function bank(banco: string, agencia: string, conta: string, favorecido: string, documentoFavorecido: string, tipo: 'CORRENTE' | 'POUPANCA' = 'CORRENTE'): BankJson {
  return { tipo, banco, agencia, conta, favorecido, documentoFavorecido }
}
function noBank(): BankJson {
  return { tipo: null, banco: '', agencia: '', conta: '', favorecido: '', documentoFavorecido: '' }
}
function fiscal(partial: Partial<FiscalJson>): FiscalJson {
  return {
    regimeTributario: null,
    indicadorIe: null,
    contribuinteIbsCbs: false,
    inscricaoMunicipal: '',
    cnae: '',
    suframa: '',
    optanteSimples: false,
    produtorRural: false,
    inscricaoProdutor: '',
    ...partial,
  }
}

export const MOCK_SUPPLIERS: SupplierJson[] = [
  {
    codigo: 1, natureza: 'JURIDICA', razaoSocial: 'ACME Distribuidora LTDA', fantasia: 'ACME',
    documento: '11444777000161', inscricaoEstadual: '110042490114',
    endereco: addr('Rua das Flores', '100', 'Centro', 1, 'São Paulo', 'SP', '01001000', 'Galpão 2'),
    telefone: '1133334444', fax: '', celular: '11999998888', nomeContato: 'Maria',
    email: 'compras@acme.com.br', representante: 'João Vendas', representanteTelefone: '11988887777',
    banco: bank('001', '1234', '567890', 'ACME Distribuidora LTDA', '11444777000161'),
    fiscal: fiscal({ regimeTributario: 'REGIME_NORMAL', indicadorIe: 'CONTRIBUINTE', contribuinteIbsCbs: true, cnae: '4639701' }),
    observacao: '', situacao: 'ATIVO',
  },
  {
    codigo: 2, natureza: 'JURIDICA', razaoSocial: 'Alfa Tecnologia S.A.', fantasia: 'Alfa Tech',
    documento: '12ABC34501DE35', inscricaoEstadual: 'ISENTO',
    endereco: addr('Avenida Atlântica', '500', 'Copacabana', 2, 'Rio de Janeiro', 'RJ', '20010000'),
    telefone: '2133335555', fax: '2133335556', celular: '21999990002', nomeContato: 'Carlos',
    email: 'contato@alfatech.com.br', representante: 'Ana Souza', representanteTelefone: '21988880002',
    banco: bank('341', '7788', '334455', 'Alfa Tecnologia S.A.', '12ABC34501DE35'),
    fiscal: fiscal({ regimeTributario: 'SIMPLES_NACIONAL', indicadorIe: 'ISENTO', optanteSimples: true, cnae: '6201501' }),
    observacao: 'CNPJ alfanumérico (IN RFB 2.229/2024).', situacao: 'ATIVO',
  },
  {
    codigo: 3, natureza: 'JURIDICA', razaoSocial: 'Noturno Suprimentos LTDA', fantasia: 'Noturno Sup',
    documento: 'NOTURNO0001A95', inscricaoEstadual: '0623079000341',
    endereco: addr('Rua da Bahia', '1500', 'Lourdes', 3, 'Belo Horizonte', 'MG', '30110000', 'Sala 4'),
    telefone: '3133336666', fax: '', celular: '31999990003', nomeContato: 'Beatriz',
    email: 'suprimentos@noturno.com.br', representante: '', representanteTelefone: '',
    banco: bank('237', '0567', '998877', 'Noturno Suprimentos LTDA', 'NOTURNO0001A95', 'POUPANCA'),
    fiscal: fiscal({ regimeTributario: 'REGIME_NORMAL', indicadorIe: 'CONTRIBUINTE', contribuinteIbsCbs: true }),
    observacao: '', situacao: 'ATIVO',
  },
  {
    codigo: 4, natureza: 'JURIDICA', razaoSocial: 'Beta Comércio de Peças LTDA', fantasia: 'Beta Peças',
    documento: '11222333000181', inscricaoEstadual: '',
    endereco: addr('Rua Chile', '20', 'Comércio', 4, 'Salvador', 'BA', '40010000'),
    telefone: '7133337777', fax: '', celular: '71999990004', nomeContato: 'Fernando',
    email: 'beta@betapecas.com.br', representante: 'Rocha Representações', representanteTelefone: '71988880004',
    banco: noBank(),
    fiscal: fiscal({ regimeTributario: 'REGIME_NORMAL', indicadorIe: 'NAO_CONTRIBUINTE' }),
    observacao: 'Inativado por falta de pedidos.', situacao: 'INATIVO',
  },
  {
    codigo: 5, natureza: 'JURIDICA', razaoSocial: 'Zeta Serviços Digitais LTDA', fantasia: 'Zeta',
    documento: 'ZZ999AA0001167', inscricaoEstadual: 'ISENTO',
    endereco: addr('Rua XV de Novembro', '800', 'Centro', 7, 'Curitiba', 'PR', '80010000'),
    telefone: '4133331111', fax: '', celular: '41999990005', nomeContato: 'Rafael',
    email: 'fin@zeta.com.br', representante: '', representanteTelefone: '',
    banco: bank('260', '0001', '445566', 'Zeta Serviços Digitais LTDA', 'ZZ999AA0001167'),
    fiscal: fiscal({ regimeTributario: 'SIMPLES_NACIONAL', indicadorIe: 'ISENTO', optanteSimples: true, cnae: '6209100' }),
    observacao: '', situacao: 'ATIVO',
  },
  {
    codigo: 6, natureza: 'FISICA', razaoSocial: 'João Carlos Pereira', fantasia: 'João Marcenaria',
    documento: '12345678909', inscricaoEstadual: '',
    endereco: addr('Avenida Beira Mar', '3000', 'Meireles', 5, 'Fortaleza', 'CE', '60010000', 'Bloco B'),
    telefone: '8533338888', fax: '', celular: '85999990006', nomeContato: 'João',
    email: 'joao.marcenaria@gmail.com', representante: '', representanteTelefone: '',
    banco: bank('104', '4321', '112233', 'João Carlos Pereira', '12345678909', 'POUPANCA'),
    fiscal: fiscal({}),
    observacao: 'Prestador pessoa física.', situacao: 'ATIVO',
  },
  {
    codigo: 7, natureza: 'FISICA', razaoSocial: 'Maria Aparecida Lima', fantasia: 'Maria Costura',
    documento: '10020030088', inscricaoEstadual: '',
    endereco: addr('Rua do Sol', '45', 'Boa Vista', 6, 'Recife', 'PE', '50010000'),
    telefone: '8133339999', fax: '', celular: '81999990007', nomeContato: 'Maria',
    email: 'maria.costura@gmail.com', representante: '', representanteTelefone: '',
    banco: noBank(),
    fiscal: fiscal({}),
    observacao: '', situacao: 'ATIVO',
  },
  {
    codigo: 8, natureza: 'FISICA', razaoSocial: 'Pedro Henrique Alves', fantasia: '',
    documento: '20030040094', inscricaoEstadual: '',
    endereco: addr('Avenida Ipiranga', '1200', 'Azenha', 8, 'Porto Alegre', 'RS', '90010000'),
    telefone: '5133332222', fax: '', celular: '51999990008', nomeContato: 'Pedro',
    email: 'pedro.alves@gmail.com', representante: '', representanteTelefone: '',
    banco: noBank(),
    fiscal: fiscal({}),
    observacao: 'Sem pedidos recentes.', situacao: 'INATIVO',
  },
  {
    codigo: 9, natureza: 'GENERICO', razaoSocial: 'DAS - Simples Nacional', fantasia: '',
    documento: '', inscricaoEstadual: '',
    endereco: noAddr(),
    telefone: '', fax: '', celular: '', nomeContato: '', email: '', representante: '', representanteTelefone: '',
    banco: noBank(), fiscal: fiscal({}),
    observacao: 'Guia de recolhimento — Documento de Arrecadação do Simples Nacional.', situacao: 'ATIVO',
  },
  {
    codigo: 10, natureza: 'GENERICO', razaoSocial: 'DARF - Receita Federal', fantasia: '',
    documento: '', inscricaoEstadual: '',
    endereco: noAddr(),
    telefone: '', fax: '', celular: '', nomeContato: '', email: '', representante: '', representanteTelefone: '',
    banco: noBank(), fiscal: fiscal({}),
    observacao: 'Documento de Arrecadação de Receitas Federais.', situacao: 'ATIVO',
  },
  {
    codigo: 11, natureza: 'GENERICO', razaoSocial: 'DARE - Secretaria da Fazenda', fantasia: '',
    documento: '', inscricaoEstadual: '',
    endereco: noAddr(),
    telefone: '', fax: '', celular: '', nomeContato: '', email: '', representante: '', representanteTelefone: '',
    banco: noBank(), fiscal: fiscal({}),
    observacao: 'Documento de Arrecadação de Receitas Estaduais.', situacao: 'INATIVO',
  },
  {
    codigo: 12, natureza: 'JURIDICA', razaoSocial: 'Gamma Logística e Transportes LTDA', fantasia: 'Gamma Log',
    documento: 'A1B2C3D4E5F668', inscricaoEstadual: 'ISENTO',
    endereco: addr('Rua Felipe Schmidt', '300', 'Centro', 9, 'Florianópolis', 'SC', '88010000', 'Sala 12'),
    telefone: '4833334444', fax: '', celular: '48999990012', nomeContato: 'Bruno',
    email: 'logistica@gamma.com.br', representante: 'Gamma Vendas', representanteTelefone: '48988880012',
    banco: bank('033', '1010', '202020', 'Gamma Logística e Transportes LTDA', 'A1B2C3D4E5F668'),
    fiscal: fiscal({ regimeTributario: 'MEI', indicadorIe: 'ISENTO', cnae: '4930202' }),
    observacao: '', situacao: 'ATIVO',
  },
]
