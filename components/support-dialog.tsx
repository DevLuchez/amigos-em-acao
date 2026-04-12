"use client"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HelpCircle, Paperclip, X, CheckCircle, Loader2 } from "lucide-react"
import { sendSupportEmail } from "@/app/actions/send-support-email"
import { cn } from "@/lib/utils"

type Props = {
  /** Estilo do botão: 'icon' para ícone somente (sidebar), 'full' para botão com texto (navbar) */
  variant?: "icon" | "full" | "ghost-light"
  userName?: string
  userEmail?: string
  className?: string
  /** Quando variant=icon, se true mostra label 'Suporte' ao lado do ícone */
  isExpanded?: boolean
}

export default function SupportDialog({
  variant = "full",
  userName = "",
  userEmail = "",
  className,
  isExpanded = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState("")
  const [mensagem, setMensagem] = useState("")
  const [nome, setNome] = useState(userName)
  const [email, setEmail] = useState(userEmail)
  const [imagem, setImagem] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setTipo("")
    setMensagem("")
    setNome(userName)
    setEmail(userEmail)
    setImagem(null)
    setSucesso(false)
    setErro(null)
  }

  const handleClose = (v: boolean) => {
    setOpen(v)
    if (!v) setTimeout(reset, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tipo || !mensagem.trim() || !email.trim()) return

    setIsLoading(true)
    setErro(null)

    const fd = new FormData()
    fd.append("tipo", tipo)
    fd.append("mensagem", mensagem)
    fd.append("remetente", nome)
    fd.append("emailRemetente", email)
    if (imagem) fd.append("imagem", imagem)

    const result = await sendSupportEmail(fd)

    if (result.success) {
      setSucesso(true)
    } else {
      setErro("Não foi possível enviar a mensagem. Tente novamente.")
    }
    setIsLoading(false)
  }

  const trigger =
    variant === "icon" ? (
      <button
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors w-full text-zinc-400 hover:bg-zinc-800 hover:text-white",
          !isExpanded && "justify-center",
          className
        )}
        title={!isExpanded ? "Suporte" : undefined}
      >
        <HelpCircle className="h-5 w-5 flex-shrink-0" />
        {isExpanded && "Suporte"}
      </button>
    ) : variant === "ghost-light" ? (
      <button
        className={cn(
          "relative text-white hover:text-white transition-colors duration-300 font-medium tracking-wide pb-1 group flex items-center gap-1.5",
          className
        )}
      >
        <HelpCircle className="w-4 h-4" />
        Suporte
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 ease-out group-hover:w-full" />
      </button>
    ) : (
      <Button variant="outline" className={cn("gap-2", className)}>
        <HelpCircle className="h-4 w-4" />
        Suporte
      </Button>
    )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-400" />
            Central de Suporte
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Envie dúvidas, relate erros ou faça sugestões. Nossa equipe entrará em
            contato em breve.
          </DialogDescription>
        </DialogHeader>

        {sucesso ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle className="h-14 w-14 text-green-500" />
            <p className="text-white font-semibold text-lg">Mensagem enviada!</p>
            <p className="text-sm text-zinc-400 max-w-xs">
              Recebemos seu contato e responderemos no e-mail informado o mais
              breve possível.
            </p>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Fechar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Tipo */}
            <div className="space-y-1.5">
              <Label className="text-white">Tipo de contato *</Label>
              <Select onValueChange={setTipo} value={tipo}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="duvida" className="text-white hover:bg-zinc-700">Dúvida</SelectItem>
                  <SelectItem value="erro" className="text-white hover:bg-zinc-700">Erro / Bug</SelectItem>
                  <SelectItem value="sugestao" className="text-white hover:bg-zinc-700">Sugestão</SelectItem>
                  <SelectItem value="outro" className="text-white hover:bg-zinc-700">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nome e Email */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-white">Seu nome</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome"
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white">Seu e-mail *</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            {/* Mensagem */}
            <div className="space-y-1.5">
              <Label className="text-white">Mensagem *</Label>
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value.slice(0, 300))}
                placeholder="Descreva sua dúvida, erro ou sugestão com o máximo de detalhes..."
                rows={4}
                required
                maxLength={300}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
              />
              <p className={`text-xs text-right ${mensagem.length >= 300 ? "text-red-400" : "text-zinc-500"}`}>
                {mensagem.length}/300
              </p>
            </div>

            {/* Imagem */}
            <div className="space-y-1.5">
              <Label className="text-white">Imagem (opcional)</Label>
              {imagem ? (
                <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2">
                  <Paperclip className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-white truncate flex-1">{imagem.name}</span>
                  <button
                    type="button"
                    onClick={() => { setImagem(null); if (fileRef.current) fileRef.current.value = "" }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center gap-2 border border-dashed border-zinc-700 rounded-md px-3 py-2.5 text-sm text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors"
                >
                  <Paperclip className="h-4 w-4" />
                  Clique para anexar uma imagem
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImagem(e.target.files?.[0] ?? null)}
              />
            </div>

            {erro && <p className="text-sm text-red-500">{erro}</p>}

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                onClick={() => handleClose(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="default"
                className="flex-1 bg-white text-black hover:bg-zinc-200"
                disabled={isLoading || !tipo || !mensagem.trim() || !email.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
