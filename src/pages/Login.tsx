import { useState, useEffect, type FormEvent } from 'react'
import logoImg from '@/assets/image-7e342.png'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { signIn, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await signIn(email, password)
    if (error) {
      setError('Credenciais inválidas. Verifique seu email e senha.')
      setLoading(false)
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900 text-slate-100 shadow-2xl">
        <CardHeader className="space-y-2 pb-2 text-center">
          <div className="mx-auto flex h-20 w-full items-center justify-center rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
            <img src={logoImg} alt="Rextur Advance" className="h-10 object-contain" />
          </div>
          <CardTitle className="pt-2 text-xl font-bold text-white">
            Sistema de Performance
          </CardTitle>
          <CardDescription className="text-slate-400">
            Análise de Atendimento Rextur Advance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-slate-800 bg-slate-950 text-white focus-visible:ring-cyan-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-slate-800 bg-slate-950 text-white focus-visible:ring-cyan-500"
                required
              />
            </div>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-amber-500 font-semibold text-white transition-opacity hover:opacity-95"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>
          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-300">Credenciais de demonstração:</p>
            <p className="mt-1">
              <span className="text-slate-500">Email:</span> leonardopth@gmail.com
            </p>
            <p>
              <span className="text-slate-500">Senha:</span> Skip@Pass
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
