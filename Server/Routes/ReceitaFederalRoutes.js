import express from 'express';

import { enviarAgendamentosParaReceita } from '../Controller/ReceitaFederalController.js'

const router = express.Router();

router.post('/enviarReceita', enviarAgendamentosParaReceita);

router.use((req, res) => {
    res.status(404).json({
        erro: 'Subrota de /receita não encontrada',
        caminho: req.originalUrl
    })
});

export default router;