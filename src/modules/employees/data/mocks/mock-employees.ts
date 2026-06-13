import { BankAccountType } from '@/shared/domain'
import { EmployeeStatus } from '../../domain/models'
import type { EmployeeJson } from '../../domain/models'

/**
 * mock-employees — funcionários de exemplo (spec §16): cobrem ATIVO/AFASTADO/
 * DEMITIDO, com e sem representante, contas CORRENTE e POUPANCA. CPFs são
 * **válidos** (passam no `isValidCpf`), celulares têm 9º dígito, e o CEP é
 * coerente com a UF da cidade (`isCepWithinUf`).
 *
 * **Cidade/Naturalidade** referenciam o módulo `locations` (`cidadeId`/
 * `cidadeNaturalId` = id do mock de cidades 1–10 = capitais; país = Brasil).
 *
 * TROCA POR API REAL: `RestEmployeeProvider` (`/employees`), mesmo contrato JSON.
 */
export const MOCK_EMPLOYEES: EmployeeJson[] = [
  {
    codigo: 1, nome: 'João da Silva Souza', apelido: 'João', cpf: '12345678909', rg: '12.345.678-9',
    nascimento: '1990-05-12', nomePai: 'José Souza', nomeMae: 'Maria da Silva', conjuge: 'Ana Souza',
    cidadeNaturalId: 1, cidadeNaturalNome: 'São Paulo', ufNatural: 'SP',
    endereco: 'Rua das Flores', numero: '100', complemento: 'Apto 21', bairro: 'Centro',
    cidadeId: 1, cidadeNome: 'São Paulo', uf: 'SP', paisId: 1, paisNome: 'Brasil', cep: '01001000',
    foneEmpresa: '1133334444', fonePessoal: '11999990001', email: 'joao.souza@empresa.com',
    admissao: '2020-01-10', demissao: null, salario: 4200.0, comissao: 0, situacao: EmployeeStatus.Active,
    representante: false, representanteId: null, representanteNome: '', grupo: 'Administrativo',
    contaTipo: BankAccountType.Checking, banco: '001', agencia: '1234', conta: '567890',
  },
  {
    codigo: 2, nome: 'Mariana Costa Lima', apelido: 'Mari', cpf: '10020030088', rg: '22.111.333-0',
    nascimento: '1988-09-03', nomePai: 'Carlos Lima', nomeMae: 'Beatriz Costa', conjuge: '',
    cidadeNaturalId: 2, cidadeNaturalNome: 'Rio de Janeiro', ufNatural: 'RJ',
    endereco: 'Avenida Atlântica', numero: '500', complemento: '', bairro: 'Copacabana',
    cidadeId: 2, cidadeNome: 'Rio de Janeiro', uf: 'RJ', paisId: 1, paisNome: 'Brasil', cep: '20010000',
    foneEmpresa: '2133335555', fonePessoal: '21999990002', email: 'mariana.lima@empresa.com',
    admissao: '2019-03-15', demissao: null, salario: 5300.0, comissao: 2.5, situacao: EmployeeStatus.Active,
    representante: true, representanteId: 1, representanteNome: 'Aurora Distribuição Ltda', grupo: 'Comercial',
    contaTipo: BankAccountType.Savings, banco: '104', agencia: '4321', conta: '112233',
  },
  {
    codigo: 3, nome: 'Pedro Henrique Alves', apelido: 'Pedro', cpf: '20030040094', rg: '30.222.444-1',
    nascimento: '1995-12-20', nomePai: 'Antônio Alves', nomeMae: 'Cláudia Henrique', conjuge: '',
    cidadeNaturalId: 3, cidadeNaturalNome: 'Belo Horizonte', ufNatural: 'MG',
    endereco: 'Rua da Bahia', numero: '1500', complemento: 'Sala 4', bairro: 'Lourdes',
    cidadeId: 3, cidadeNome: 'Belo Horizonte', uf: 'MG', paisId: 1, paisNome: 'Brasil', cep: '30110000',
    foneEmpresa: '3133336666', fonePessoal: '31999990003', email: 'pedro.alves@empresa.com',
    admissao: '2021-07-01', demissao: null, salario: 3800.0, comissao: 0, situacao: EmployeeStatus.OnLeave,
    representante: false, representanteId: null, representanteNome: '', grupo: 'Técnico',
    contaTipo: BankAccountType.Checking, banco: '237', agencia: '0567', conta: '998877',
  },
  {
    codigo: 4, nome: 'Fernanda Oliveira Rocha', apelido: 'Fê', cpf: '30040050009', rg: '40.333.555-2',
    nascimento: '1992-02-28', nomePai: 'Marcos Rocha', nomeMae: 'Sandra Oliveira', conjuge: 'Bruno Rocha',
    cidadeNaturalId: 4, cidadeNaturalNome: 'Salvador', ufNatural: 'BA',
    endereco: 'Rua Chile', numero: '20', complemento: '', bairro: 'Comércio',
    cidadeId: 4, cidadeNome: 'Salvador', uf: 'BA', paisId: 1, paisNome: 'Brasil', cep: '40010000',
    foneEmpresa: '7133337777', fonePessoal: '71999990004', email: 'fernanda.rocha@empresa.com',
    admissao: '2018-11-05', demissao: null, salario: 6100.0, comissao: 3, situacao: EmployeeStatus.Active,
    representante: true, representanteId: 2, representanteNome: 'Boreal Representações', grupo: 'Comercial',
    contaTipo: BankAccountType.Checking, banco: '341', agencia: '7788', conta: '334455',
  },
  {
    codigo: 5, nome: 'Lucas Martins Pereira', apelido: 'Lucas', cpf: '40050060007', rg: '50.444.666-3',
    nascimento: '1985-06-17', nomePai: 'Roberto Pereira', nomeMae: 'Vânia Martins', conjuge: '',
    cidadeNaturalId: 5, cidadeNaturalNome: 'Fortaleza', ufNatural: 'CE',
    endereco: 'Avenida Beira Mar', numero: '3000', complemento: 'Bloco B', bairro: 'Meireles',
    cidadeId: 5, cidadeNome: 'Fortaleza', uf: 'CE', paisId: 1, paisNome: 'Brasil', cep: '60010000',
    foneEmpresa: '8533338888', fonePessoal: '85999990005', email: 'lucas.pereira@empresa.com',
    admissao: '2017-04-22', demissao: '2023-08-30', salario: 4900.0, comissao: 0, situacao: EmployeeStatus.Dismissed,
    representante: false, representanteId: null, representanteNome: '', grupo: 'Administrativo',
    contaTipo: BankAccountType.Savings, banco: '033', agencia: '1010', conta: '202020',
  },
  {
    codigo: 6, nome: 'Camila Ribeiro Nunes', apelido: 'Cá', cpf: '50060070013', rg: '60.555.777-4',
    nascimento: '1998-10-09', nomePai: 'Paulo Nunes', nomeMae: 'Teresa Ribeiro', conjuge: '',
    cidadeNaturalId: 6, cidadeNaturalNome: 'Recife', ufNatural: 'PE',
    endereco: 'Rua do Sol', numero: '45', complemento: '', bairro: 'Boa Vista',
    cidadeId: 6, cidadeNome: 'Recife', uf: 'PE', paisId: 1, paisNome: 'Brasil', cep: '50010000',
    foneEmpresa: '8133339999', fonePessoal: '81999990006', email: 'camila.nunes@empresa.com',
    admissao: '2022-02-14', demissao: null, salario: 3500.0, comissao: 1.5, situacao: EmployeeStatus.Active,
    representante: false, representanteId: null, representanteNome: '', grupo: 'Atendimento',
    contaTipo: BankAccountType.Checking, banco: '260', agencia: '0001', conta: '445566',
  },
  {
    codigo: 7, nome: 'Rafael Gomes Teixeira', apelido: 'Rafa', cpf: '60070080020', rg: '70.666.888-5',
    nascimento: '1983-01-25', nomePai: 'Sérgio Teixeira', nomeMae: 'Lúcia Gomes', conjuge: 'Paula Teixeira',
    cidadeNaturalId: 7, cidadeNaturalNome: 'Curitiba', ufNatural: 'PR',
    endereco: 'Rua XV de Novembro', numero: '800', complemento: 'Cobertura', bairro: 'Centro',
    cidadeId: 7, cidadeNome: 'Curitiba', uf: 'PR', paisId: 1, paisNome: 'Brasil', cep: '80010000',
    foneEmpresa: '4133331111', fonePessoal: '41999990007', email: 'rafael.teixeira@empresa.com',
    admissao: '2016-09-12', demissao: null, salario: 7200.0, comissao: 4, situacao: EmployeeStatus.Active,
    representante: true, representanteId: 3, representanteNome: 'Cometa Vendas e Serviços', grupo: 'Comercial',
    contaTipo: BankAccountType.Checking, banco: '001', agencia: '3030', conta: '667788',
  },
  {
    codigo: 8, nome: 'Juliana Almeida Castro', apelido: 'Ju', cpf: '70080090036', rg: '80.777.999-6',
    nascimento: '1991-07-30', nomePai: 'Fernando Castro', nomeMae: 'Rosa Almeida', conjuge: '',
    cidadeNaturalId: 8, cidadeNaturalNome: 'Porto Alegre', ufNatural: 'RS',
    endereco: 'Avenida Ipiranga', numero: '1200', complemento: '', bairro: 'Azenha',
    cidadeId: 8, cidadeNome: 'Porto Alegre', uf: 'RS', paisId: 1, paisNome: 'Brasil', cep: '90010000',
    foneEmpresa: '5133332222', fonePessoal: '51999990008', email: 'juliana.castro@empresa.com',
    admissao: '2020-10-19', demissao: null, salario: 4600.0, comissao: 0, situacao: EmployeeStatus.OnLeave,
    representante: false, representanteId: null, representanteNome: '', grupo: 'Financeiro',
    contaTipo: BankAccountType.Savings, banco: '041', agencia: '5050', conta: '778899',
  },
  {
    codigo: 9, nome: 'Bruno Carvalho Dias', apelido: 'Bruno', cpf: '11223344517', rg: '90.888.000-7',
    nascimento: '1987-03-08', nomePai: 'Eduardo Dias', nomeMae: 'Helena Carvalho', conjuge: '',
    cidadeNaturalId: 9, cidadeNaturalNome: 'Florianópolis', ufNatural: 'SC',
    endereco: 'Rua Felipe Schmidt', numero: '300', complemento: 'Sala 12', bairro: 'Centro',
    cidadeId: 9, cidadeNome: 'Florianópolis', uf: 'SC', paisId: 1, paisNome: 'Brasil', cep: '88010000',
    foneEmpresa: '4833334444', fonePessoal: '48999990009', email: 'bruno.dias@empresa.com',
    admissao: '2015-05-03', demissao: '2022-12-15', salario: 5800.0, comissao: 0, situacao: EmployeeStatus.Dismissed,
    representante: false, representanteId: null, representanteNome: '', grupo: 'Técnico',
    contaTipo: BankAccountType.Checking, banco: '756', agencia: '6060', conta: '889900',
  },
  {
    codigo: 10, nome: 'Patrícia Mendes Barros', apelido: 'Paty', cpf: '80090010078', rg: '11.999.222-8',
    nascimento: '1996-11-11', nomePai: 'Ricardo Barros', nomeMae: 'Sônia Mendes', conjuge: '',
    cidadeNaturalId: 10, cidadeNaturalNome: 'Brasília', ufNatural: 'DF',
    endereco: 'SQN 410 Bloco A', numero: '101', complemento: '', bairro: 'Asa Norte',
    cidadeId: 10, cidadeNome: 'Brasília', uf: 'DF', paisId: 1, paisNome: 'Brasil', cep: '70040000',
    foneEmpresa: '6133335555', fonePessoal: '61999990010', email: 'patricia.barros@empresa.com',
    admissao: '2023-01-09', demissao: null, salario: 3900.0, comissao: 2, situacao: EmployeeStatus.Active,
    representante: true, representanteId: 4, representanteNome: 'Delta Comercial', grupo: 'Comercial',
    contaTipo: BankAccountType.Checking, banco: '070', agencia: '7070', conta: '990011',
  },
]
