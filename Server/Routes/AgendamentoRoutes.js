import express from 'express';
import { checkRole } from '../Middleware/authorization.js';

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

router.get('/listar', checkRole(['Administrador', 'Monitor', 'Leitor']), listarAgendamentos);
router.get('/listarIncompletos', checkRole(['Administrador', 'Monitor', 'Leitor']), listarAgendamentosI);
router.get('/listarCompletos', checkRole(['Administrador', 'Monitor', 'Leitor']), listarAgendamentosC);
router.get('/object/:id', checkRole(['Administrador', 'Monitor', 'Leitor']), obterAgendamento);

router.post('/criar', checkRole(['Administrador', 'Monitor']), criarAgendamento);
router.put('/atualizar/:id', checkRole(['Administrador', 'Monitor']), atualizarAgendamento);
router.delete('/excluir/:id', checkRole(['Administrador', 'Monitor']), deletarAgendamento);

router.use((req, res) => {
    res.status(404).json({
        erro: 'Subrota de /agendamentos não encontrada',
        caminho: req.originalUrl
    })
});

export default router;