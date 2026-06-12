/**
 * Validação de **nome composto** de pessoa (ver spec `employee-registration` R2/R3).
 *
 * Regra: ≥ 2 palavras, cada palavra com ≥ 2 letras, apenas letras (com acento),
 * apóstrofo, hífen e espaço — sem dígitos nem símbolos. Rejeita repetição absurda
 * da mesma letra (ex.: "aaaa") e entradas obviamente inválidas.
 *
 * Não tenta ser um validador civil completo (nomes têm exceções); apenas barra o
 * lixo mais comum de digitação, deixando o backend como autoridade final.
 */
const NAME_WORD = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:['-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/

/** Uma letra repetida ≥ 4 vezes seguidas é quase sempre digitação inválida. */
const ABSURD_REPEAT = /([A-Za-zÀ-ÖØ-öø-ÿ])\1{3,}/

export function isValidFullName(value: string): boolean {
  const trimmed = value.trim().replace(/\s+/g, ' ')
  if (trimmed.length < 3) return false
  if (ABSURD_REPEAT.test(trimmed)) return false

  const words = trimmed.split(' ')
  if (words.length < 2) return false

  return words.every((word) => {
    const letters = word.replace(/['-]/g, '')
    return letters.length >= 2 && NAME_WORD.test(word)
  })
}
