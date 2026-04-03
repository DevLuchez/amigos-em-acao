import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Ops, algo deu errado</CardTitle>
            </CardHeader>
            <CardContent>
              {params?.error ? (
                <p className="text-sm text-zinc-400 mb-4">Erro: {params.error}</p>
              ) : (
                <p className="text-sm text-zinc-400 mb-4">Ocorreu um erro não especificado.</p>
              )}
              <Link href="/auth/login">
                <Button className="w-full">Voltar para o login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
