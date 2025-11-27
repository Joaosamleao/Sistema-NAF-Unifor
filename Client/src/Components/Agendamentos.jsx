import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, ArrowLeft, PlusCircle } from 'lucide-react';

const tiposDeAgendamento = [
    'Auxílio à elaboração e orientações sobre a Declaração de Ajuste Anual do IRPF',
    'Auxílio à inscrição e Informações cadastrais de CPF',
    'Auxílio à inscrição e Informações cadastrais do CNPJ',
    'Auxílio à emissão e informações sobre Certidões Negativas de Débitos PF e PJ',
    'Auxílio à consulta à situação fiscal',
    'Agendamento on-line de atendimentos na RFB',
    'Informações e auxílio à regularização de CPF Suspenso',
    'Informações e auxílio à elaboração de pedido de isenção de IRPF para portadores de moléstias graves',
    'Orientações e auxílio à elaboração de pedidos de isenção de IPI/IOF na compra de veículos por portadores de deficiência física, mental ou visual',
    'Auxílio à apresentação de pedidos de restituição de pagamentos indevidos e/ou a maior (Perdcomps)',
    'Informações gerais sobre ITR',
    'Auxílio à inscrição e Informações gerais sobre o Microempreendedor Individual',
    'Auxílio à inscrição e Informações gerais sobre o Simples Nacional',
    'Auxílio à inscrição e informações cadastrais da matrícula CEI',
    'Informações e auxílio no eSocial do empregador doméstico',
    'Auxílio à emissão e informações sobre guias para o recolhimento da contribuição previdenciária de Produtores Rurais Pessoa Física, Segurado Especial, Contribuinte Individual e obras de pessoas físicas',
    'Orientações e auxílio ao cumprimento de obrigações tributárias acessórias para associações e demais entidades sem fins lucrativos',
    'Informações e auxilio para a obtenção de Certificado Digital',
    'Informações e auxilio para realizar a opção pelo Domicílio Tributário Eletrônico - DTE',
    'Auxílio à habilitação nos sistemas RADAR e Siscomex',
    'Informações sobre regras de importação e exportação através dos Correios',
    'Informações sobre Regras de Bagagem',
    'Auxílio à inscrição e informações cadastrais da Carteira de Identidade Nacional (CIN)'
];

const MODALIDADE_OPCOES = ['Presencial', 'Remoto'];
const TIPO_DE_PESSOA_OPCOES = [
    'Pessoa Física',
    'Microempreendedor Individual',
    'Pequenos Proprietários Rurais',
    'Mulheres em situação de risco e vulnerabilidade conforme Programa Mulher Cidadã, Portaria MF 26/2023',
    'Entidade sem fins lucrativos',
    'Outra'
];


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

function NovoAgendamentoModal({ isOpen, onClose, onAgendamentoCriado }) {
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [tipoAgendamento, setTipoAgendamento] = useState('');
    const [data, setData] = useState('');
    const [modalidade, setModalidade] = useState('Presencial');
    const [tipoDePessoa, setTipoDePessoa] = useState('Pessoa Física');
    const [telefone, setTelefone] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('naf_token');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const cpfDigits = cpf.replace(/\D/g, '');

        if (cpfDigits.length !== 11) {
            setError('CPF inválido. Deve conter 11 dígitos.');
            setIsSubmitting(false);
            return;
        }

        const novoAgendamento = {
            nome,
            cpf: cpfDigits,
            email,
            tipoAgendamento,
            data,
            modalidade,
            tipoDePessoa,
            telefone,
        };

        try {
            const response = await fetch('/api/agendamentos/criar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(novoAgendamento),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao criar agendamento');
            }

            onAgendamentoCriado();
            handleClose();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setNome('');
        setCpf('');
        setEmail('');
        setTipoAgendamento('');
        setData('');
        setModalidade('Presencial');
        setTipoDePessoa('Pessoa Física');
        setTelefone('');
        setError(null);
        setIsSubmitting(false);
        onClose();
    };

    const inputClass = "mt-1 block w-full border-gray-300 shadow-sm sm:text-sm";
    const focusInputClass = "focus:outline-none focus:ring-0 focus:border-blue-500 focus:rounded-none";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-gray-900">Novo Agendamento</h2>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <span className="sr-only">Fechar</span>
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto">
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                                Nome
                            </label>
                            <input
                                type="text"
                                id="nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                className={`${inputClass} rounded-lg ${focusInputClass}`}
                                placeholder="Nome Completo"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                                CPF
                            </label>
                            <input
                                type="text"
                                id="cpf"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                className={`${inputClass} rounded-lg ${focusInputClass}`}
                                placeholder="000.000.000-00"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`${inputClass} rounded-lg ${focusInputClass}`}
                                placeholder="voce@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                                Telefone (Opcional)
                            </label>
                            <input
                                type="tel"
                                id="telefone"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                                className={`${inputClass} rounded-lg ${focusInputClass}`}
                                placeholder="(85) 99999-9999"
                            />
                        </div>

                        <div>
                            <label htmlFor="data" className="block text-sm font-medium text-gray-700">
                                Data do Agendamento
                            </label>
                            <input
                                type="date"
                                id="data"
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                                className={`${inputClass} rounded-lg ${focusInputClass}`}
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="tipoDePessoa" className="block text-sm font-medium text-gray-700">
                                Tipo de Pessoa
                            </label>
                            <select
                                id="tipoDePessoa"
                                value={tipoDePessoa}
                                onChange={(e) => setTipoDePessoa(e.target.value)}
                                className={`${inputClass} rounded-lg ${focusInputClass}`}
                                required
                            >
                                {TIPO_DE_PESSOA_OPCOES.map((tipo) => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="modalidade" className="block text-sm font-medium text-gray-700">
                                Modalidade
                            </label>
                            <select
                                id="modalidade"
                                value={modalidade}
                                onChange={(e) => setModalidade(e.target.value)}
                                className={`${inputClass} rounded-lg ${focusInputClass}`}
                                required
                            >
                                {MODALIDADE_OPCOES.map((mod) => (
                                    <option key={mod} value={mod}>{mod}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                                Tipo de Agendamento
                            </label>
                            <select
                                id="tipo"
                                value={tipoAgendamento}
                                onChange={(e) => setTipoAgendamento(e.target.value)}
                                className={`${inputClass} rounded-lg ${focusInputClass}`}
                                required
                            >
                                <option value="" disabled>Selecione um tipo</option>
                                {tiposDeAgendamento.map((tipo) => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>

                        {error && (
                            <div className="md:col-span-2 text-center text-sm text-red-600">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-4 p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg sticky bottom-0 z-10">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm border border-gray-300"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-[#265BCD] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Criando...' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DetalhesAgendamento({ agendamento, onVoltar, onAtendimentoAdicionado, onAgendamentoExcluido, onAgendamentoConcluido }) {
    const [novoAtendimentoTipo, setNovoAtendimentoTipo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);
    const token = localStorage.getItem('naf_token');


    const handleAddAtendimento = async () => {
        if (novoAtendimentoTipo.trim() === '') return;

        setIsSubmitting(true);

        const novosServicos = [
            ...agendamento.atendimentosComplementares,
            novoAtendimentoTipo
        ];

        try {
            const response = await fetch(`/api/agendamentos/atualizar/${agendamento._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ atendimentosComplementares: novosServicos }),
            });

            if (!response.ok) {
                throw new Error('Falha ao adicionar serviço');
            }

            onAtendimentoAdicionado(agendamento._id, novoAtendimentoTipo);
            setNovoAtendimentoTipo('');

        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExcluir = async () => {
        if (!window.confirm("Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.")) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/agendamentos/excluir/${agendamento._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error('Falha ao excluir agendamento');
            }

            onAgendamentoExcluido();

        } catch (err) {
            console.error(err);
            alert(err.message);
            setIsDeleting(false);
        }
    };

    const handleConcluir = async () => {
        const foiConclusivo = window.confirm("O atendimento foi conclusivo?\n\nClique 'OK' para 'Sim'\nClique 'Cancelar' para 'Não'");
        const statusConclusivo = foiConclusivo ? 'Sim' : 'Não';

        setIsCompleting(true);
        try {
            const response = await fetch(`/api/agendamentos/atualizar/${agendamento._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: 'Completo',
                    foiConclusivo: statusConclusivo
                }),
            });

            if (!response.ok) {
                throw new Error('Falha ao marcar como concluído');
            }

            onAgendamentoConcluido();

        } catch (err) {
            console.error(err);
            alert(err.message);
            setIsCompleting(false);
        }
    };


    const InfoItem = ({ label, value }) => (
        <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">{value || 'N/A'}</p>
        </div>
    );

    return (
        <div className="py-8">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={onVoltar}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                    disabled={isDeleting || isCompleting}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </button>
                <button
                    type="button"
                    onClick={handleConcluir}
                    className="bg-[#265BCD] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                    disabled={isDeleting || isCompleting}
                >
                    {isCompleting ? 'Concluindo...' : 'Marcar como concluído'}
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoItem label="Nome Completo" value={agendamento.nome} />
                    <InfoItem label="CPF" value={agendamento.cpf} />
                    <InfoItem label="Endereço de Email" value={agendamento.email} />

                    <InfoItem label="Número de Telefone" value={agendamento.telefone} />
                    <InfoItem label="Instituição de Atendimento" value={'CE - UNIFOR - Fortaleza'} />
                    <InfoItem label="Estado" value={'Ceará - CE'} />

                    <div className="md:col-span-2">
                        <InfoItem label="Tipo de Atendimento" value={agendamento.tipoAgendamento} />
                    </div>

                    <InfoItem label="Modalidade do Atendimento" value={agendamento.modalidade} />
                    <InfoItem label="Tipo de Pessoa" value={agendamento.tipoDePessoa} />
                    <InfoItem label="Data do Agendamento" value={formatarData(agendamento.data)} />
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Atendimentos Complementares</h3>

                    <ul className="mt-4 space-y-2">
                        {agendamento.atendimentosComplementares.map((servico, index) => (
                            <li key={index} className="text-gray-700 pl-2">
                                - {servico}
                            </li>
                        ))}
                    </ul>

                    <div className="mt-4 flex gap-4">
                        <select
                            value={novoAtendimentoTipo}
                            onChange={(e) => setNovoAtendimentoTipo(e.target.value)}
                            className="flex-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            disabled={isDeleting || isCompleting}
                        >
                            <option value="" disabled>Selecione o Serviço</option>
                            {tiposDeAgendamento.map((tipo) => (
                                <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddAtendimento}
                            disabled={!novoAtendimentoTipo || isSubmitting || isDeleting || isCompleting}
                            className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg text-sm border 
                    ${!novoAtendimentoTipo || isSubmitting || isDeleting || isCompleting
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-300'}`}
                        >
                            <PlusCircle className="h-5 w-5" />
                            {isSubmitting ? 'Adicionando...' : 'Adicionar'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    onClick={handleExcluir}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                    disabled={isDeleting || isCompleting}
                >
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                </button>
            </div>
        </div>
    );
}


function Agendamentos({ userRole }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAgendamento, setSelectedAgendamento] = useState(null);
    const podeCriarOuEditar = ['Administrador', 'Monitor'].includes(userRole);

    const [agendamentos, setAgendamentos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAgendamentos = useCallback(async (status) => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('naf_token');

            const headers = token ? {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            };

            if (token) {
                // formato padrão JWT: Authorization: Bearer <token>
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                // se não houver token
                setIsLoading(false);
                setError("Erro: Token de autenticação não encontrado. Faça o login novamente.");
                return;
            }

            const response = await fetch('/api/agendamentos/listarIncompletos', {
                headers: headers
            });

            if (response.status === 401) {
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido do servidor.' }));
                // se for 401/403 pode ser token expirado/cargo incorreto
                throw new Error(errorData.message || `Falha ao buscar agendamentos: ${response.statusText}`);
            }
            const data = await response.json();
            setAgendamentos(data);
        } catch (err) {
            console.error("Erro ao buscar agendamentos:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setIsLoading(true);
        fetchAgendamentos();
    }, [fetchAgendamentos]);

    const handleAgendamentoCriado = () => {
        setIsLoading(true);
        fetchAgendamentos();
    };

    const handleAtendimentoAdicionado = (agendamentoId, servicoAdicionado) => {
        setAgendamentos(agendamentosAtuals =>
            agendamentosAtuals.map(ag => {
                if (ag._id === agendamentoId) {
                    return {
                        ...ag,
                        atendimentosComplementares: [
                            ...ag.atendimentosComplementares,
                            servicoAdicionado
                        ]
                    };
                }
                return ag;
            })
        );

        setSelectedAgendamento(agAtual => ({
            ...agAtual,
            atendimentosComplementares: [
                ...agAtual.atendimentosComplementares,
                servicoAdicionado
            ]
        }));
    };

    const handleAgendamentoExcluido = () => {
        setSelectedAgendamento(null);
        setIsLoading(true);
        fetchAgendamentos();
    };

    const handleAgendamentoConcluido = () => {
        setSelectedAgendamento(null);
        setIsLoading(true);
        fetchAgendamentos();
    };


    if (selectedAgendamento) {
        return (
            <DetalhesAgendamento
                agendamento={selectedAgendamento}
                onVoltar={() => setSelectedAgendamento(null)}
                onAtendimentoAdicionado={handleAtendimentoAdicionado}
                onAgendamentoExcluido={handleAgendamentoExcluido}
                onAgendamentoConcluido={handleAgendamentoConcluido}
            />
        );
    }

    if (isLoading) {
        return (
            <div className="px-4 sm:px-6 lg:px-8 py-8 text-center">
                <p className="text-gray-600">Carregando agendamentos...</p>
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

    return (
        <>
            <div className="px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {agendamentos.length} agendamentos em aberto
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
                        {podeCriarOuEditar && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center space-x-2 bg-[#265BCD] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                            >
                                <PlusCircle size={20} />
                                <span>Novo Agendamento</span>
                            </button>
                        )}
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
                            {agendamentos.map((agendamento) => (
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
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatarData(agendamento.data)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {podeCriarOuEditar && (
                                            <button
                                                onClick={() => setSelectedAgendamento(agendamento)}
                                                className="text-[#265BCD] hover:text-blue-700"
                                            >
                                                Detalhes/Editar
                                            </button>
                                        )}
                                        {!podeCriarOuEditar && userRole === 'Leitor' && (
                                            <span className="text-gray-400">Ver Detalhes</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <NovoAgendamentoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAgendamentoCriado={handleAgendamentoCriado}
            />
        </>
    );
}

export default Agendamentos;