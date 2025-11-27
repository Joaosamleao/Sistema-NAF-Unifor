import { useState, useEffect } from 'react';
import Navbar from './Components/Navbar';
import Agendamentos from './Components/Agendamentos';
import ReceitaFederal from './Components/ReceitaFederal';
import Login from './Components/Login';
import Register from './Components/Register';
import Gerenciamento from './Components/Gerenciamento';

// adicionar activeLink para: Perfil, Notificações

function App() {
  const [activeLink, setActiveLink] = useState('Agendamentos');
  const [userRole, setUserRole] = useState(localStorage.getItem('user_cargo'));
  const isAguardando = userRole === 'Aguardando';

  useEffect(() => {
    if (activeLink === 'Criar conta') {
        return;
    }
    if (!userRole) {
        if (!localStorage.getItem('naf_token')) {
             setActiveLink('Entrar');
        } 
        else if (isAguardando) {
            setActiveLink('Aguardando');
        }
    }
  }, [userRole, isAguardando, activeLink]);


  const renderScreen = () => {
    if (isAguardando || activeLink === 'Aguardando') {
      return (
        <div className="text-center p-10 mt-10 bg-yellow-100 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-800">Aguardando Confirmação</h2>
          <p className="text-yellow-700">Sua conta está em análise. Você terá acesso ao sistema quando um administrador definir sua função.</p>
          <button
            onClick={() => {
              localStorage.clear();
              setUserRole(null);
              setActiveLink('Entrar');
            }}
            className="mt-4 text-blue-600 underline"
          >
            Sair e Voltar para Login
          </button>
        </div>
      );
    }

    switch (activeLink) {
      case 'Entrar':
        return <Login setActiveLink={setActiveLink} setUserRole={setUserRole} />;
      case 'Criar conta':
        return <Register setActiveLink={setActiveLink} />;
      case 'Dashboard':
        return <div>Dashboard (Em Breve)</div>;
      case 'Agendamentos':
        return <Agendamentos userRole={userRole} />;
      case 'Receita Federal':
        return <ReceitaFederal userRole={userRole} />;
      case 'Gerenciamento': // Rota do Administrador
        return <Gerenciamento userRole={userRole} />;
      default:
        return <Login setActiveLink={setActiveLink} setUserRole={setUserRole} />;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          activeLink={activeLink}
          setActiveLink={setActiveLink}
          userRole={userRole}
        />
        <main className="px-4 sm:px-6 lg:px-8">
          {renderScreen()}
        </main>
      </div>
    </>
  );
}

export default App;