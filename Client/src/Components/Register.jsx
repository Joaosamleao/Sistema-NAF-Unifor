import { useState } from 'react'
import logo from '../assets/naf-logo.png'; 
import sideImage from '../assets/user.png';

export default function Register({ setActiveLink }) {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmSenha, setConfirmSenha] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (senha !== confirmSenha) {
      setError('As senhas não coincidem');
      return;
    }

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, cpf, email, telefone, senha }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || 'Falha ao criar a conta');
        }

        setSubmitted(true); // ir para a tela de espera

    } catch (err) {
        setError(err.message);
    }
}

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl p-10 shadow-md">
          <h2 className="text-2xl font-bold text-center mb-4">Aguarde por um Administrador</h2>
          <p className="text-center text-gray-600 mb-6">Sua conta foi criada com sucesso, você terá acesso ao sistema quando um administrador definir sua função.</p>
          <div className="flex justify-center">
            <button
              onClick={() => setActiveLink('Entrar')}
              className="bg-blue-600 text-white px-8 py-2 rounded-md"
            >
              Voltar para o Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-stretch">
      <div className="w-1/2 flex items-center justify-center">
        <div className="max-w-md w-full px-8">
          <h1 className="text-3xl font-bold text-center mb-2">Crie sua conta</h1>
          <p className="text-center text-sm text-gray-600 mb-6">Preencha sua informações abaixo para criar sua conta</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input required value={nome} onChange={(e)=>setNome(e.target.value)} placeholder="Nome completo" className="w-full border rounded-md p-3" />
            </div>
            <div>
              <input required value={cpf} onChange={(e)=>setCpf(e.target.value)} placeholder="CPF" className="w-full border rounded-md p-3" />
            </div>
            <div>
              <input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="exemplo@email.com" className="w-full border rounded-md p-3" />
            </div>
            <div>
              <input value={telefone} onChange={(e)=>setTelefone(e.target.value)} placeholder="Telefone" className="w-full border rounded-md p-3" />
            </div>

            <div className="flex gap-3">
              <input required type="password" value={senha} onChange={(e)=>setSenha(e.target.value)} placeholder="Senha" className="w-1/2 border rounded-md p-3" />
              <input required type="password" value={confirmSenha} onChange={(e)=>setConfirmSenha(e.target.value)} placeholder="Confirme sua senha" className="w-1/2 border rounded-md p-3" />
            </div>

            <div className="text-xs text-gray-500">Deve ter no mínimo 6 caracteres</div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md mt-2">Criar sua conta</button>
          </form>

          <div className="text-center mt-4 text-sm text-gray-700">
            Já possui uma conta?{' '}
            <button onClick={() => setActiveLink('Entrar')} className="font-medium text-[#265BCD] hover:text-blue-500">Entre aqui</button>
          </div>
        </div>
      </div>

      <div className="hidden relative w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" 
          alt="Ambiente de trabalho"
        />
      </div>
    </div>
  )
}
