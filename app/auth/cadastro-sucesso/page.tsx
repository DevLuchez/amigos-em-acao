import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function CadastroSucessoPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="text-green-500" size={32} />
                <CardTitle className="text-2xl text-white">Cadastro realizado!</CardTitle>
              </div>
              <CardDescription className="text-zinc-400">Sua conta foi criada com sucesso</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400 mb-4">
                Seu cadastro foi concluído. Você já pode fazer login e acessar a plataforma.
              </p>
              <div className="flex flex-col gap-2">
                <Link href="/auth/login">
                  <Button className="w-full">Fazer login</Button>
                </Link>
                <Link href="/">
                  <Button
                    variant="outline"
                    className="w-full bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
                  >
                    Voltar para a página inicial
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
