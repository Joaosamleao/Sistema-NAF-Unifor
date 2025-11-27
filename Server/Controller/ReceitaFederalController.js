import Agendamento from '../Model/Agendamento.js';
import EnvioLog from '../Model/EnvioLog.js';

function formatarDataParaFormsMS(isoString) {
    if (!isoString) return '';
    const data = new Date(isoString);
    const ano = data.getUTCFullYear();
    const mes = (data.getUTCMonth() + 1).toString().padStart(2, '0');
    const dia = data.getUTCDate().toString().padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function mapearAgendamentoParaPayload(agendamento, servicoTexto) {
    const questionIds = {
        estado: "r63c60f2b1d534444a895a58c1e4e7997",
        instituicao: "r72abccf1b2934fb9a3d60ec421345dde",
        data: "r92f2cfd4d473447bb038b47717b343a6",
        modalidade: "r211847bd774a4510829fd641ef387ef4",
        tipoDePessoa: "r1712e5e4f633451bae0b231f0c517f81",
        foiConclusivo: "rce815392383e4dd38e31bcdb07544901",
        tipoAtendimento: "r55ccbdea62044b4790ae6de8ca02273f"
    };

    let dataFormatada = null;
    if (agendamento.data) {
        try {
            const d = new Date(agendamento.data);
            const ano = d.getUTCFullYear();
            const mes = (d.getUTCMonth() + 1).toString().padStart(2, '0');
            const dia = d.getUTCDate().toString().padStart(2, '0');
            dataFormatada = `${ano}-${mes}-${dia}`; 
        } catch (e) {
            dataFormatada = null;
        }
    }

    const conclusivo = (agendamento.foiConclusivo === 'Não' || agendamento.foiConclusivo === 'Nao') ? 'Não' : 'Sim';

    const answers = [
        { questionId: questionIds.estado, answer1: "Ceará - CE" },
        { questionId: questionIds.instituicao, answer1: "CE - UNIFOR - Fortaleza" },
        { questionId: questionIds.data, answer1: dataFormatada },
        { questionId: questionIds.modalidade, answer1: agendamento.modalidade || "Presencial" },
        { questionId: questionIds.tipoDePessoa, answer1: agendamento.tipoDePessoa || "Pessoa Física" },
        { questionId: questionIds.foiConclusivo, answer1: conclusivo },
        { questionId: questionIds.tipoAtendimento, answer1: servicoTexto }
    ];

    return answers.filter(a => a.answer1 !== undefined);
}

export const enviarAgendamentosParaReceita = async (req, res) => {
    try {
        console.log("Iniciando envio para a Receita...");

        const agendamentosCompletos = await Agendamento.find({ status: 'Completo' });

        if (!agendamentosCompletos || agendamentosCompletos.length === 0) {
            return res.status(200).json({ message: "Nenhum agendamento para enviar.", totalEnviado: 0 });
        }

        const payloads = [];
        for (const ag of agendamentosCompletos) {
            payloads.push({ 
                agendamentoId: ag._id.toString(), 
                answersArray: mapearAgendamentoParaPayload(ag, ag.tipoAgendamento) 
            });
            
            const extras = Array.isArray(ag.atendimentosComplementares) ? ag.atendimentosComplementares : [];
            for (const servico of extras) {
                payloads.push({ 
                    agendamentoId: ag._id.toString(), 
                    answersArray: mapearAgendamentoParaPayload(ag, servico) 
                });
            }
        }

        const MS_FORMS_URL = "https://forms.guest.usercontent.microsoft/formapi/api/9188040d-6c67-4c5b-b112-36a304b66dad/users/00000000-0000-0000-0003-0000d5c168a7/forms('DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAMAANXBaKdUMExNUUc4N1NaMjRYNklUQ0tSOFkyN1VUUi4u')/responses";

        let fetchImpl = global.fetch;
        if (typeof fetchImpl === 'undefined') {
            try { const mod = await import('node-fetch'); fetchImpl = mod.default; } catch (e) { }
        }

        let successfulSends = 0;
        
        for (const p of payloads) {
            const submitDate = new Date().toISOString();
            const startDate = new Date(Date.now() - 1000).toISOString();
            
            const payloadFinal = {
                startDate,
                submitDate,
                answers: JSON.stringify(p.answersArray),
                emailReceiptConsent: false,
            };
            
            console.log("Enviando Payload:", JSON.stringify(payloadFinal).substring(0, 200) + "...");

            try {
                const resp = await fetchImpl(MS_FORMS_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    body: JSON.stringify(payloadFinal),
                });

                if (!resp.ok) {
                    const text = await resp.text();
                    console.error(`Erro Forms (${resp.status}): ${text}`);
                    throw new Error(`Forms responded with ${resp.status}`);
                }

                successfulSends++;
                
                await Agendamento.findByIdAndUpdate(p.agendamentoId, { status: 'Enviado' });

            } catch (err) {
                console.error(`Falha no envio do agendamento ${p.agendamentoId}:`, err.message);
            }
            
            await new Promise(r => setTimeout(r, 500)); 
        }

        res.status(200).json({ 
            message: `Processado. ${successfulSends} envios com sucesso.`,
            totalEnviosSucesso: successfulSends
        });

    } catch (err) {
        console.error("Erro geral:", err);
        res.status(500).json({ message: "Erro interno no envio." });
    }
};

export const enviarAgendamentoUnico = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Iniciando envio individual para agendamento ${id}...`);

        const agendamento = await Agendamento.findById(id);

        if (!agendamento) {
            return res.status(404).json({ message: "Agendamento não encontrado." });
        }

        const payloads = [];
        payloads.push(mapearAgendamentoParaPayload(agendamento, agendamento.tipoAgendamento));
        
        if (agendamento.atendimentosComplementares && agendamento.atendimentosComplementares.length > 0) {
            for (const servico of agendamento.atendimentosComplementares) {
                payloads.push(mapearAgendamentoParaPayload(agendamento, servico));
            }
        }

        const MS_FORMS_URL = "https://forms.guest.usercontent.microsoft/formapi/api/9188040d-6c67-4c5b-b112-36a304b66dad/users/00000000-0000-0000-0003-0000d5c168a7/forms('DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAMAANXBaKdUMExNUUc4N1NaMjRYNklUQ0tSOFkyN1VUUi4u')/responses";

        await Promise.all(payloads.map(async (answersPayload) => {
            const submitDate = new Date().toISOString();
            const startDate = new Date(Date.now() - 1000).toISOString();
            
            const payloadFinal = {
                startDate: startDate,
                submitDate: submitDate,
                answers: JSON.stringify(answersPayload),
                emailReceiptConsent: false,
            };

            const response = await fetch(MS_FORMS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                body: JSON.stringify(payloadFinal),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Erro no envio individual: ${response.status} - ${errorText}`);
                throw new Error(`Falha no Forms: ${response.status}`);
            }
            
            return response;
        }));

        agendamento.status = 'Enviado';
        await agendamento.save();

        console.log(`Sucesso! Agendamento ${id} enviado (${payloads.length} registros).`);

        res.status(200).json({ 
            message: `Sucesso! Agendamento enviado.`,
            totalEnviado: payloads.length
        });

    } catch (err) {
        console.error("Erro ao enviar agendamento único:", err.message);
        res.status(500).json({ 
            message: "Erro ao enviar para a Receita. Verifique se os dados estão corretos.",
            details: err.message 
        });
    }
};