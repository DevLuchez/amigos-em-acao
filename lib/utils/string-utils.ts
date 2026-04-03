/**
 * Remove acentos e converte para lowercase para comparação insensível a acentos
 */
export function normalizeString(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

/**
 * Verifica se uma string contém outra (case e accent insensitive)
 */
export function stringContains(haystack: string, needle: string): boolean {
  return normalizeString(haystack).includes(normalizeString(needle))
}
