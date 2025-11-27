import { Bell } from 'lucide-react';
import logo from '../assets/naf-logo.png';

    function Logo() {
        return (
            <img
                className="h-17 w-17 object-contain"
                src={logo}
                alt="NAF Unifor Logo"
            />
        );
    }

function Navbar({ activeLink, setActiveLink }) {
    const navLinks = [
        { name: 'Dashboard', href: '#' },
        { name: 'Agendamentos', href: '#' },
        { name: 'Receita Federal', href: '#' },
    ];

    return (
        <nav className="bg-white border-b border-gray-200">
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
                            ? 'text-black font-semibold border-b-2 border-blue-600 px-3 py-3 text-sm'
                            : 'text-gray-700 hover:text-blue-600 px-3 py-3 rounded-md text-sm font-medium border-b-2 border-transparent'
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
                <button
                type="button"
                className="relative rounded-full p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" aria-hidden="true" />
                </button>

                <img
                className="h-9 w-9 rounded-full object-cover"
                src="https://placehold.co/36x36/E0E0E0/B0B0B0?text=A"
                alt="User profile"
                />

                <button onClick={() => setActiveLink && setActiveLink('Entrar')} className="text-sm text-gray-700 ml-4">Sair</button>
            </div>
            </div>
        </div>
        </nav>
    );
}

    export default Navbar;

