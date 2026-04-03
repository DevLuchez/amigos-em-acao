import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BeneficiadoSucessoPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="text-center bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Recebemos seu pedido de ajuda!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400 mb-4">
                Mais de 100 Amigos entram em Ação para ajudar a construir um futuro melhor para Jaraguá do Sul, Guaramirim, Schroeder e Corupá. Entre você também em ação e nos ajude a mudar as histórias de vida de muitas famílias.

              </p>
              <Link href="/">
                <Button className="w-full">Voltar para a página inicial</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
