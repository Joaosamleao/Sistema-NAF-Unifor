import { useState } from 'react'
import logo from '../assets/naf-logo.png';

export default function Login({ setActiveLink, setUserRole }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password: senha }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Falha no login')
      }

      const data = await res.json()

      if (res.ok && data.token) {
        localStorage.setItem('naf_token', data.token);
        localStorage.setItem('user_cargo', data.cargo);

        const payload = JSON.parse(atob(data.token.split('.')[1]));
        localStorage.setItem('user_id', payload.id);

        if (typeof setUserRole === 'function') setUserRole(data.cargo);

        setActiveLink('Dashboard')
      } else {
        setError(data.message || 'Erro ao entrar');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch">
      <div className="w-1/2 flex items-center justify-center">
        <div className="max-w-md w-full px-8">
          <h1 className="text-3xl font-bold text-center mb-2">Entre na sua conta</h1>
          <p className="text-center text-sm text-gray-600 mb-6">Coloque seu email para ter acesso a sua conta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="sr-only">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full border rounded-md p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="sr-only">Senha</label>
              <input
                required
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                className="w-full border rounded-md p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md mt-2 hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            Não possui uma conta?{' '}
            <button
              onClick={() => setActiveLink('Criar conta')}
              className="font-semibold leading-6 text-[#265BCD] hover:text-blue-500"
            >
              Crie aqui
            </button>
          </p>
        </div>
      </div>

      <div className="w-1/2 bg-white flex items-center justify-center">
        <div className="w-64 h-64 border rounded flex items-center justify-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M8 14l2-2 3 3 4-4"></path></svg>
        </div>
      </div>
    </div>
  )
}
