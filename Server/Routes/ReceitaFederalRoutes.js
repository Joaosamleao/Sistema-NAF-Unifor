import express from 'express';
import { checkRole } from '../Middleware/authorization.js'; 
import { enviarAgendamentosParaReceita, enviarAgendamentoUnico } from '../Controller/ReceitaFederalController.js'

const router = express.Router();

router.post('/enviarReceita', checkRole(['Administrador']), enviarAgendamentosParaReceita);
router.post('/enviarUm/:id', enviarAgendamentoUnico)

router.use((req, res) => {
    res.status(404).json({
        erro: 'Subrota de /receita não encontrada',
        caminho: req.originalUrl
    })
});

export default router;