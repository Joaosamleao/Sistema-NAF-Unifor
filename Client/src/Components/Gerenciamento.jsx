import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, User, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';

const CARGOS = ['Aguardando', 'Leitor', 'Monitor', 'Administrador'];
const API_URL = '/api/colaboradores';

function Gerenciamento() {
    const [colaboradores, setColaboradores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUserId = localStorage.getItem('user_id');

    const fetchColaboradores = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('naf_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const response = await fetch(`${API_URL}/listar`, { headers });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Falha ao buscar colaboradores' }));
                throw new Error(errorData.message || 'Erro de rede ou autorização.');
            }

            const data = await response.json();
            setColaboradores(data);

        } catch (err) {
            console.error("Erro ao buscar colaboradores:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleUpdateCargo = async (id, novoCargo) => {
        if (id === currentUserId) {
            alert("Ação Bloqueada: Você não pode alterar seu próprio cargo.");
            return;
        }
        if (!window.confirm(`Tem certeza que deseja alterar o cargo deste colaborador para "${novoCargo}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('naf_token');
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const response = await fetch(`${API_URL}/atualizarCargo/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({ cargo: novoCargo })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Falha ao atualizar' }));
                throw new Error(errorData.message || 'Erro ao atualizar cargo.');
            }

            fetchColaboradores();

        } catch (err) {
            alert(`Erro ao atualizar cargo: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchColaboradores();
    }, [fetchColaboradores]);

    if (isLoading) return <div className="text-center mt-10">Carregando colaboradores...</div>;
    if (error) return <div className="text-center mt-10 text-red-600">Erro: {error}</div>;


    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <User className="h-8 w-8 text-sky-600" />
                Gerenciamento de Colaboradores
            </h2>
            
            <div className="card-soft overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome/Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-gray-200">
                        {colaboradores.map((colaborador) => {
                            const isCurrentUser = colaborador._id === currentUserId;

                            return (
                                <tr key={colaborador._id} className={isCurrentUser ? "bg-sky-50" : "hover:bg-gray-50 transition-colors duration-150"}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{colaborador.nome} {isCurrentUser && "(Você)"}</div>
                                        <div className="text-sm text-gray-500">{colaborador.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {colaborador.cpf}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            colaborador.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {colaborador.ativo ? 'Ativo' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {isCurrentUser ? (
                                            <div className="flex items-center gap-2 text-gray-500 cursor-not-allowed" title="Você não pode alterar seu próprio cargo">
                                                <ShieldAlert className="w-4 h-4" />
                                                <span>{colaborador.cargo}</span>
                                            </div>
                                        ) : (
                                            <select 
                                                value={colaborador.cargo}
                                                onChange={(e) => handleUpdateCargo(colaborador._id, e.target.value)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm transition-colors duration-150 btn-animate"
                                            >
                                                {CARGOS.map(cargo => (
                                                    <option key={cargo} value={cargo}>{cargo}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Gerenciamento;