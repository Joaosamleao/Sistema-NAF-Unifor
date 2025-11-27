import { Bell } from 'lucide-react';
import logo from '../assets/naf-logo.png';
import { useState, useEffect } from 'react';

function Logo() {
    return (
        <img
            className="h-17 w-17 object-contain"
            src={logo}
            alt="NAF Unifor Logo"
        />
    );
}

function Navbar({ activeLink, setActiveLink, userRole }) {
    const baseLinks = [
        { name: 'Dashboard', href: '#', roles: ['Administrador', 'Monitor', 'Leitor'] },
        { name: 'Agendamentos', href: '#', roles: ['Administrador', 'Monitor', 'Leitor'] },
        { name: 'Receita Federal', href: '#', roles: ['Administrador'] }, // Apenas Admin
    ];

    if (userRole === 'Administrador') {
        baseLinks.push({ name: 'Gerenciamento', href: '#', roles: ['Administrador'] });
    }

    const navLinks = baseLinks.filter(link => link.roles.includes(userRole));
    const isLoggedIn = userRole && userRole !== 'Aguardando';
    const handleLogout = () => {
        localStorage.removeItem('naf_token');
        localStorage.removeItem('user_cargo');
        window.location.reload();
    };

    return (
        <nav className="bg-gradient-to-l from-white/80 via-sky-100 to-white/80 dark:from-sky-900/70 dark:via-sky-800/60 border-b border-sky-200 backdrop-blur-sm">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">

                    <div className="flex items-center">
                        <div className="shrink-0">
                            <Logo />
                        </div>
                        <div className="hidden md:block ml-6">
                            <div className="flex items-baseline space-x-4">
                                {navLinks.map((link) => ( 
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (typeof setActiveLink === 'function') {
                                                setActiveLink(link.name);
                                            }
                                        }}
                                        className={
                                            activeLink === link.name
                                                ? 'text-sky-900 font-semibold px-3 py-2 text-sm rounded-md shadow-sm bg-transparent dark:bg-transparent border border-sky-200'
                                                : 'text-gray-900 hover:text-sky-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out transform hover:-translate-y-0.5'
                                        }
                                        aria-current={activeLink === link.name ? 'page' : undefined}
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {isLoggedIn && (
                            <>
                                <button
                                    type="button"
                                    className="relative rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 transition-transform duration-150"
                                >
                                    <Bell className="h-6 w-6" aria-hidden="true" />
                                </button>
                                <img
                                    className="h-9 w-9 rounded-full object-cover"
                                    src="https://placehold.co/36x36/E0E0E0/B0B0B0?text=A"
                                    alt="User profile"
                                />
                            </>
                        )}
                        
                        <button 
                            onClick={isLoggedIn ? handleLogout : () => setActiveLink && setActiveLink('Entrar')} 
                            className="ml-4 text-sm font-medium px-3 py-2 rounded-md btn-animate primary-gradient"
                        >
                            {isLoggedIn ? 'Sair' : 'Entrar'}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;

