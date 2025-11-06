import express from 'express';

import {
    listarAgendamentos,
    listarAgendamentosI,
    listarAgendamentosC,
    obterAgendamento,
    criarAgendamento,
    atualizarAgendamento,
    deletarAgendamento
} from '../Controller/AgendamentoController.js';

const router = express.Router();

router.get('/listar', listarAgendamentos);
router.get('/listarIncompletos', listarAgendamentosI);
router.get('/listarCompletos', listarAgendamentosC);
router.get('/object/:id', obterAgendamento);
router.post('/criar', criarAgendamento);
router.put('/atualizar/:id', atualizarAgendamento);
router.delete('/excluir/:id', deletarAgendamento);

router.use((req, res) => {
    res.status(404).json({
        erro: 'Subrota de /agendamentos não encontrada',
        caminho: req.originalUrl
    })
});

export default router;