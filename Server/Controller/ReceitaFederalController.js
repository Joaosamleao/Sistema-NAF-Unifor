import Agendamento from '../Model/Agendamento.js';

function formatarDataParaFormsMS(isoString) {
    if (!isoString) return '';
    const data = new Date(isoString);
    const ano = data.getUTCFullYear();
    const mes = (data.getUTCMonth() + 1).toString().padStart(2, '0');
    const dia = data.getUTCDate().toString().padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function mapearAgendamentoParaPayload(agendamento, tipoServico) {
    const questionIds = {
        estado: "r63c60f2b1d534444a895a58c1e4e7997",
        instituicao: "r72abccf1b2934fb9a3d60ec421345dde",
        data: "r92f2cfd4d473447bb038b47717b343a6",
        modalidade: "r211847bd774a4510829fd641ef387ef4",
        tipoDePessoa: "r1712e5e4f633451bae0b231f0c517f81",
        foiConclusivo: "rce815392383e4dd38e31bcdb07544901",
        tipoAtendimento: "r55ccbdea62044b4790ae6de8ca02273f"
    };

    const answers = [
        { questionId: questionIds.estado, answer1: "Ceará - CE" },
        { questionId: questionIds.instituicao, answer1: "CE - UNIFOR - Fortaleza" },
        { questionId: questionIds.data, answer1: formatarDataParaFormsMS(agendamento.data) },
        { questionId: questionIds.modalidade, answer1: agendamento.modalidade },
        { questionId: questionIds.tipoDePessoa, answer1: agendamento.tipoDePessoa },
        { questionId: questionIds.foiConclusivo, answer1: agendamento.foiConclusivo },
        { questionId: questionIds.tipoAtendimento, answer1: tipoServico }
    ];
    return JSON.stringify(answers);
}

export const enviarAgendamentosParaReceita = async (req, res) => {
    try {
        console.log("Iniciando envio para a Receita...");

        const agendamentosCompletos = await Agendamento.find({ status: 'Completo' });

        if (agendamentosCompletos.length === 0) {
        return res.status(200).json({ message: "Nenhum agendamento para enviar.", totalEnviado: 0 });
        }

        const payloads = [];
        for (const ag of agendamentosCompletos) {
        payloads.push(mapearAgendamentoParaPayload(ag, ag.tipoAgendamento));
        for (const servico of ag.atendimentosComplementares) {
            payloads.push(mapearAgendamentoParaPayload(ag, servico));
        }
        }
        // (Formulário Teste) Alterar para o da Receita Federal no futuro
        const MS_FORMS_URL = "https://forms.guest.usercontent.microsoft/formapi/api/9188040d-6c67-4c5b-b112-36a304b66dad/users/00000000-0000-0000-0003-0000d5c168a7/forms('DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAMAANXBaKdUMExNUUc4N1NaMjRYNklUQ0tSOFkyN1VUUi4u')/responses";

        await Promise.all(payloads.map(answersPayload => {
        const submitDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 1000).toISOString();
        const payload = {
            startDate: startDate,
            submitDate: submitDate,
            answers: answersPayload,
            emailReceiptConsent: false,
        };

        return fetch(MS_FORMS_URL, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            body: JSON.stringify(payload),
        });
        }));

        const idsParaAtualizar = agendamentosCompletos.map(ag => ag._id);
        await Agendamento.updateMany(
        { _id: { $in: idsParaAtualizar } },
        { $set: { status: 'Enviado' } }
        );

        console.log(`Sucesso! ${payloads.length} atendimentos enviados.`);
        
        res.status(200).json({ 
        message: `Sucesso! ${payloads.length} atendimentos enviados para a Receita.`,
        totalEnviado: payloads.length
        });

    } catch (err) {
        console.error("Erro ao enviar para a Receita:", err.message);
        res.status(500).json({ message: "Erro interno do servidor ao enviar para a Receita" });
    }
};