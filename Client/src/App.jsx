import { useState } from 'react';
import Navbar from './Components/Navbar';
import Agendamentos from './Components/Agendamentos';
import ReceitaFederal from './Components/ReceitaFederal';
import Login from './Components/Login';
import Register from './Components/Register';

// Adicionar activeLink para: Perfil, Notificações

function App() {
  const [activeLink, setActiveLink] = useState('Agendamentos');
  
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar
          activeLink={activeLink}
          setActiveLink={setActiveLink}
        />
        <main className="px-4 sm:px-6 lg:px-8">
          {activeLink === 'Entrar' && <Login setActiveLink={setActiveLink} />}
          {activeLink === 'Criar conta' && <Register setActiveLink={setActiveLink} />}
          {activeLink === 'Dashboard' && <div>A ser adicionado</div>}
          {activeLink === 'Agendamentos' && <Agendamentos />}
          {activeLink === 'Receita Federal' && <ReceitaFederal />}
        </main>
      </div>
    </>
  );
}

export default App;
