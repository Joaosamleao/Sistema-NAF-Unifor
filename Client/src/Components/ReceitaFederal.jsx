import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';

function formatarData(isoString) {
    if (!isoString) return 'N/A';
    const data = new Date(isoString);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

function ReceitaFederal() {
    const [agendamentosCompletos, setAgendamentosCompletos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnviando, setIsEnviando] = useState(false);
    
    const fetchAgendamentosCompletos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
        const response = await fetch('/api/agendamentos/listarCompletos'); 
        if (!response.ok) {
            throw new Error('Falha ao buscar atendimentos finalizados');
        }
        const data = await response.json();
        setAgendamentosCompletos(data);
        } catch (err) {
        setError(err.message);
        } finally {
        setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAgendamentosCompletos();
    }, [fetchAgendamentosCompletos]);

    const handleEnviarTudo = async () => {
        const totalEnvios = agendamentosCompletos.reduce((acc, ag) => {
        return acc + 1 + ag.atendimentosComplementares.length;
        }, 0);
        
        if (!window.confirm(`Você está prestes a enviar ${totalEnvios} atendimentos para a Receita. Deseja continuar?`)) {
        return;
        }

        setIsEnviando(true);

        try {
        const response = await fetch('/api/receita/enviarReceita', {
            method: 'POST',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao enviar para a Receita');
        }

        const resultado = await response.json();
        
        alert(`Sucesso! ${resultado.totalEnviado} atendimentos enviados para a Receita.`);    
        fetchAgendamentosCompletos();

        } catch (err) {
        console.error(err);
        alert('Houve um erro ao enviar os dados: ' + err.message);
        } finally {
        setIsEnviando(false);
        }
    };

    if (isLoading) {
        return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-gray-600">Carregando atendimentos finalizados...</p>
        </div>
        );
    }

    if (error) {
        return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-red-600">Erro: {error}</p>
        </div>
        );
    }
    
    const totalEnvios = agendamentosCompletos.reduce((acc, ag) => {
        return acc + 1 + ag.atendimentosComplementares.length;
    }, 0);

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
            <div>
            <h1 className="text-3xl font-bold text-gray-900">Atendimentos finalizados</h1>
            <p className="mt-1 text-sm text-gray-600">
                {agendamentosCompletos.length} agendamentos concluídos, totalizando {totalEnvios} envios.
            </p>
            </div>
            <div className="flex items-center gap-4">
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Search className="h-5 w-5" />
                </span>
                <input
                type="text"
                placeholder="Buscar"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <button
                type="button"
                onClick={handleEnviarTudo}
                disabled={isEnviando || agendamentosCompletos.length === 0}
                className="bg-[#265BCD] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isEnviando ? 'Enviando...' : `Enviar ${totalEnvios} para a Receita`}
            </button>
            </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPF
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-numeric text-gray-500 uppercase tracking-wider">
                    Tipo de agendamento
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data do agendamento
                </th>
                <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Detalhes</span>
                </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {agendamentosCompletos.map((agendamento) => (
                <tr key={agendamento._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {agendamento.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {agendamento.cpf}
                    </td>
                    <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900">
                    {agendamento.email}
                    </td>
                    <td className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-900">
                    {agendamento.tipoAgendamento}
                    {agendamento.atendimentosComplementares.length > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                        (+{agendamento.atendimentosComplementares.length} extra)
                        </span>
                    )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatarData(agendamento.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <span className="text-gray-400">Detalhes</span>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    );
}

export default ReceitaFederal;