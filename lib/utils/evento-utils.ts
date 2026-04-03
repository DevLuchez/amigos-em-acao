export function isEventoRealizado(dataEvento: string): boolean {
  const dataEventoDate = new Date(dataEvento)
  const agora = new Date()
  return dataEventoDate < agora
}

export function getStatusEvento(dataEvento: string): "realizado" | "proximo" {
  return isEventoRealizado(dataEvento) ? "realizado" : "proximo"
}

export function formatEventoDateTime(isoDate: string): { date: string; time: string } {
  // Extrair data e hora diretamente da string ISO sem conversão de timezone
  const dateObj = new Date(isoDate)

  // Extrair componentes da data ISO (UTC)
  const year = dateObj.getUTCFullYear()
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0")
  const day = String(dateObj.getUTCDate()).padStart(2, "0")
  const hours = String(dateObj.getUTCHours()).padStart(2, "0")
  const minutes = String(dateObj.getUTCMinutes()).padStart(2, "0")

  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`,
  }
}

export type StatusViabilidade = "inviavel" | "viavel" | "lotado"

export function getStatusViabilidade(
  inscritos: number,
  quantidadeMinima: number,
  quantidadeMaxima: number | null,
): StatusViabilidade {
  // Se atingiu a quantidade máxima, está lotado
  if (quantidadeMaxima !== null && inscritos >= quantidadeMaxima) {
    return "lotado"
  }

  // Se não atingiu a quantidade mínima, está inviável
  if (inscritos < quantidadeMinima) {
    return "inviavel"
  }

  // Se atingiu a quantidade mínima e não está lotado, está viável
  return "viavel"
}

export function podeSeInscrever(dataEvento: string, inscritos: number, quantidadeMaxima: number | null): boolean {
  // Verifica se o evento ainda não aconteceu
  const eventoFuturo = getStatusEvento(dataEvento) === "proximo"

  // Verifica se não está lotado
  const naoLotado = quantidadeMaxima === null || inscritos < quantidadeMaxima

  return eventoFuturo && naoLotado
}
