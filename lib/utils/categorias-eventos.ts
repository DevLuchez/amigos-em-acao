export const CATEGORIAS_EVENTOS = [
  { value: "acao_social",          label: "Ação Social" },
  { value: "arrecadacao_mercados", label: "Arrecadação Variada em Mercados" },
  { value: "entrega_cesta_basica", label: "Entrega de Cesta Básica" },
  { value: "campanha_feijoada",    label: "Campanha da Feijoada" },
  { value: "campanha_agasalho",    label: "Campanha do Agasalho" },
  { value: "campanha_natal",       label: "Campanha de Natal" },
  { value: "outros",               label: "Outros" },
]

/** Retorna o label legível de uma categoria, ou o próprio valor caso não encontre. */
export function getCategoriaLabel(value: string): string {
  return CATEGORIAS_EVENTOS.find((c) => c.value === value)?.label ?? value
}
