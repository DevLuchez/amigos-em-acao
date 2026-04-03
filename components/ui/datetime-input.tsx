"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface DateTimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string // formato interno: YYYY-MM-DDTHH:MM
  onChange: (value: string) => void
}

// Converte de YYYY-MM-DDTHH:MM para DD/MM/AAAA HH:MM
function formatToDisplay(isoValue: string): string {
  if (!isoValue) return ""
  
  // formato esperado: YYYY-MM-DDTHH:MM
  const match = isoValue.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (match) {
    const [, year, month, day, hour, minute] = match
    return `${day}/${month}/${year} ${hour}:${minute}`
  }
  
  return ""
}

// Converte de DD/MM/AAAA HH:MM para YYYY-MM-DDTHH:MM
function formatToISO(displayValue: string): string {
  // formato esperado: DD/MM/AAAA HH:MM
  const match = displayValue.match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/)
  if (match) {
    const [, day, month, year, hour, minute] = match
    return `${year}-${month}-${day}T${hour}:${minute}`
  }
  return ""
}

// Aplica máscara ao valor digitado
function applyMask(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "")
  
  let result = ""
  
  // DD
  if (numbers.length > 0) {
    result += numbers.substring(0, 2)
  }
  // /
  if (numbers.length > 2) {
    result += "/"
    // MM
    result += numbers.substring(2, 4)
  }
  // /
  if (numbers.length > 4) {
    result += "/"
    // AAAA (máximo 4 dígitos para o ano)
    result += numbers.substring(4, 8)
  }
  // espaço
  if (numbers.length > 8) {
    result += " "
    // HH
    result += numbers.substring(8, 10)
  }
  // :
  if (numbers.length > 10) {
    result += ":"
    // MM
    result += numbers.substring(10, 12)
  }
  
  return result
}

const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ className, value, onChange, placeholder = "DD/MM/AAAA HH:MM", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")
    
    // Sincroniza o valor externo (ISO) com o valor de exibição
    React.useEffect(() => {
      const formatted = formatToDisplay(value)
      setDisplayValue(formatted)
    }, [value])
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      const masked = applyMask(rawValue)
      
      setDisplayValue(masked)
      
      // Só converte para ISO se o formato estiver completo
      if (masked.length === 16) { // DD/MM/AAAA HH:MM = 16 caracteres
        const isoValue = formatToISO(masked)
        if (isoValue) {
          onChange(isoValue)
        }
      } else if (masked === "") {
        onChange("")
      }
    }
    
    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={16}
        className={cn(className)}
        {...props}
      />
    )
  }
)
DateTimeInput.displayName = "DateTimeInput"

export { DateTimeInput }
