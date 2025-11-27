import express from 'express';

import { enviarAgendamentosParaReceita, enviarAgendamentoUnico } from '../Controller/ReceitaFederalController.js'

const router = express.Router();

router.post('/enviarReceita', enviarAgendamentosParaReceita);
router.post('/enviarUm/:id', enviarAgendamentoUnico);

router.use((req, res) => {
    res.status(404).json({
        erro: 'Subrota de /receita não encontrada',
        caminho: req.originalUrl
    })
});

export default router;