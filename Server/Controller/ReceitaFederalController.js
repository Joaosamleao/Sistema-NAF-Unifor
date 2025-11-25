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

    // Retornamos um array de answers (não string) para que o payload JSON final contenha
    // um array serializável corretamente.
    const answers = [
        { questionId: questionIds.estado, answer1: "Ceará - CE" },
        { questionId: questionIds.instituicao, answer1: "CE - UNIFOR - Fortaleza" },
        { questionId: questionIds.data, answer1: formatarDataParaFormsMS(agendamento.data) },
        { questionId: questionIds.modalidade, answer1: agendamento.modalidade },
        { questionId: questionIds.tipoDePessoa, answer1: agendamento.tipoDePessoa },
        { questionId: questionIds.foiConclusivo, answer1: agendamento.foiConclusivo },
        { questionId: questionIds.tipoAtendimento, answer1: tipoServico }
    ];

    return answers;
}

export const enviarAgendamentosParaReceita = async (req, res) => {
    try {
        console.log("Iniciando envio para a Receita...");

        const agendamentosCompletos = await Agendamento.find({ status: 'Completo' });

        if (!agendamentosCompletos || agendamentosCompletos.length === 0) {
            return res.status(200).json({ message: "Nenhum agendamento para enviar.", totalEnviado: 0 });
        }

        // Build payloads with reference to agendamento id so podemos rastrear sucessos por agendamento
        const payloads = []; // { agendamentoId, answers }
        for (const ag of agendamentosCompletos) {
            // tipoAgendamento principal
            payloads.push({ agendamentoId: ag._id.toString(), answers: mapearAgendamentoParaPayload(ag, ag.tipoAgendamento) });
            const extras = Array.isArray(ag.atendimentosComplementares) ? ag.atendimentosComplementares : [];
            for (const servico of extras) {
                payloads.push({ agendamentoId: ag._id.toString(), answers: mapearAgendamentoParaPayload(ag, servico) });
            }
        }

        // (Formulário Teste) Alterar para o da Receita Federal no futuro
        const MS_FORMS_URL = "https://forms.guest.usercontent.microsoft/formapi/api/9188040d-6c67-4c5b-b112-36a304b66dad/users/00000000-0000-0000-0003-0000d5c168a7/forms('DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAMAANXBaKdUMExNUUc4N1NaMjRYNklUQ0tSOFkyN1VUUi4u')/responses";

        // Ensure `fetch` is available (Node 18+ has it). If not, suggest installing node-fetch.
        let fetchImpl = global.fetch;
        if (typeof fetchImpl === 'undefined') {
            try {
                const mod = await import('node-fetch');
                fetchImpl = mod.default;
            } catch (e) {
                console.error('Fetch não encontrado no runtime e não foi possível importar node-fetch.');
                return res.status(500).json({ message: 'Fetch não disponível. Instale node-fetch ou atualize o Node.js para v18+' });
            }
        }

        // Helpers para envio sequencial com retries
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

        const maxRetries = 3;
        const successCountPerAg = {};
        const totalCountPerAg = {};
        for (const p of payloads) {
            totalCountPerAg[p.agendamentoId] = (totalCountPerAg[p.agendamentoId] || 0) + 1;
        }

        let successfulSends = 0;
        for (const p of payloads) {
            const submitDate = new Date().toISOString();
            const startDate = new Date(Date.now() - 1000).toISOString();
            const payload = {
                startDate,
                submitDate,
                answers: p.answers,
                emailReceiptConsent: false,
            };

            // create a log document for this payload
            const logDoc = new EnvioLog({
                agendamentoId: p.agendamentoId,
                payload,
                attempts: [],
                success: false,
                sentBy: req.user?.username || 'system',
            });
            await logDoc.save();

            let attempt = 0;
            let sent = false;
            while (attempt < maxRetries && !sent) {
                try {
                    attempt++;
                    const resp = await fetchImpl(MS_FORMS_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'NAF-Agent/1.0'
                        },
                        body: JSON.stringify(payload),
                    });

                    const status = resp.status;
                    const text = await resp.text().catch(() => '');
                    if (!resp.ok) {
                        // record failed attempt
                        logDoc.attempts.push({ attemptNumber: attempt, success: false, statusCode: status, responseText: text, timestamp: new Date() });
                        await logDoc.save();
                        throw new Error(`Forms responded with ${status}: ${text}`);
                    }

                    // sucesso
                    sent = true;
                    successfulSends++;
                    successCountPerAg[p.agendamentoId] = (successCountPerAg[p.agendamentoId] || 0) + 1;
                    logDoc.attempts.push({ attemptNumber: attempt, success: true, statusCode: status, responseText: text, timestamp: new Date() });
                    logDoc.success = true;
                    await logDoc.save();
                } catch (err) {
                    console.warn(`Falha ao enviar payload (attempt ${attempt}) para agendamento ${p.agendamentoId}:`, err.message || err);
                    // if the attempt failed and wasn't already logged (e.g., thrown before response), record attempt
                    if (!logDoc.attempts.some(a => a.attemptNumber === attempt)) {
                        logDoc.attempts.push({ attemptNumber: attempt, success: false, statusCode: null, responseText: err.message || String(err), timestamp: new Date() });
                        await logDoc.save();
                    }
                    if (attempt < maxRetries) {
                        await sleep(500 * attempt); // backoff
                    }
                }
            }

            if (!sent) {
                console.error(`Não foi possível enviar payload para agendamento ${p.agendamentoId} após ${maxRetries} tentativas.`);
            }
        }

        // Atualizar somente agendamentos que tiveram todos os payloads enviados com sucesso
        const idsParaAtualizar = Object.keys(totalCountPerAg).filter(id => successCountPerAg[id] === totalCountPerAg[id]);
        if (idsParaAtualizar.length > 0) {
            await Agendamento.updateMany(
                { _id: { $in: idsParaAtualizar } },
                { $set: { status: 'Enviado' } }
            );
        }

        console.log(`Envios processados. Total payloads: ${payloads.length}, enviados com sucesso: ${successfulSends}`);

        res.status(200).json({ 
            message: `Processado. ${successfulSends} envios bem-sucedidos de ${payloads.length} payloads.`,
            totalEnvioTentados: payloads.length,
            totalEnviosSucesso: successfulSends,
            agendamentosAtualizados: idsParaAtualizar.length
        });

    } catch (err) {
        console.error("Erro ao enviar para a Receita:", err.message);
        res.status(500).json({ message: "Erro interno do servidor ao enviar para a Receita" });
    }
};