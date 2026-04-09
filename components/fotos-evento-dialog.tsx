"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ImagePlus, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Foto = {
  id: string
  evento_id: string
  url: string
  storage_path: string
  created_at: string
}

type FotosEventoDialogProps = {
  eventoId: string
  eventoTitulo: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MAX_FOTOS = 6
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function FotosEventoDialog({
  eventoId,
  eventoTitulo,
  open,
  onOpenChange,
}: FotosEventoDialogProps) {
  const [fotos, setFotos] = useState<Foto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const loadFotos = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("evento_fotos")
      .select("*")
      .eq("evento_id", eventoId)
      .order("created_at", { ascending: true })

    if (data) setFotos(data)
    setLoading(false)
  }, [eventoId])

  useEffect(() => {
    if (open) loadFotos()
  }, [open, loadFotos])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remaining = MAX_FOTOS - fotos.length
    if (remaining <= 0) {
      toast({
        title: "Limite atingido",
        description: `Máximo de ${MAX_FOTOS} fotos por evento.`,
        variant: "destructive",
      })
      return
    }

    const filesToUpload = Array.from(files).slice(0, remaining)

    // Validar tamanho dos arquivos
    const oversized = filesToUpload.filter((f) => f.size > MAX_FILE_SIZE)
    if (oversized.length > 0) {
      toast({
        title: "Arquivo muito grande",
        description: `${oversized.map((f) => f.name).join(", ")} excede o limite de 5MB.`,
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    const supabase = createClient()
    let successCount = 0

    for (const file of filesToUpload) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const path = `${eventoId}/${crypto.randomUUID()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from("evento-fotos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        toast({
          title: "Erro no upload",
          description: `Falha ao enviar ${file.name}: ${uploadError.message}`,
          variant: "destructive",
        })
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("evento-fotos").getPublicUrl(path)

      const { error: insertError } = await supabase.from("evento_fotos").insert({
        evento_id: eventoId,
        url: publicUrl,
        storage_path: path,
      })

      if (!insertError) {
        successCount++
      }
    }

    if (successCount > 0) {
      toast({
        title: "Upload concluído",
        description: `${successCount} foto${successCount !== 1 ? "s" : ""} enviada${successCount !== 1 ? "s" : ""} com sucesso.`,
      })
    }

    setUploading(false)
    e.target.value = ""
    loadFotos()
  }

  const handleDelete = async (foto: Foto) => {
    setDeletingId(foto.id)
    const supabase = createClient()

    await supabase.storage.from("evento-fotos").remove([foto.storage_path])
    await supabase.from("evento_fotos").delete().eq("id", foto.id)

    toast({
      title: "Foto removida",
      description: "A foto foi excluída com sucesso.",
    })

    setDeletingId(null)
    loadFotos()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Fotos do Evento</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {eventoTitulo} — {fotos.length}/{MAX_FOTOS} fotos
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Grid de fotos existentes */}
            {fotos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fotos.map((foto) => (
                  <div
                    key={foto.id}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-zinc-700"
                  >
                    <img
                      src={foto.url}
                      alt="Foto do evento"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Button
                        onClick={() => handleDelete(foto)}
                        disabled={deletingId === foto.id}
                        variant="destructive"
                        size="icon"
                        className="h-10 w-10"
                      >
                        {deletingId === foto.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Área de upload */}
            {fotos.length < MAX_FOTOS && (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-500 transition-colors bg-zinc-800/50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {uploading ? (
                    <>
                      <Loader2 className="h-10 w-10 animate-spin text-zinc-400 mb-3" />
                      <p className="text-sm text-zinc-400">Enviando fotos...</p>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-10 w-10 text-zinc-400 mb-3" />
                      <p className="text-sm text-zinc-400">
                        <span className="font-semibold text-white">Clique para selecionar</span>{" "}
                        as fotos
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        PNG, JPG ou WebP • Máx. 5MB • Restam{" "}
                        {MAX_FOTOS - fotos.length} foto
                        {MAX_FOTOS - fotos.length !== 1 ? "s" : ""}
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            )}

            {fotos.length === 0 && !uploading && (
              <p className="text-center text-zinc-500 text-sm py-4">
                Nenhuma foto adicionada a este evento ainda.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
