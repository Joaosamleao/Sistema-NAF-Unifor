import express from 'express';
import { 
    listarColaboradores,
    atualizarCargoColaborador,
} from '../Controller/ColaboradorController.js';
import role from '../Middleware/role.js';
import auth from '../Middleware/auth.js';

const router = express.Router();
const Administrador = ['Administrador']; 

router.get('/listar', role(Administrador), listarColaboradores);
router.put('/atualizarCargo/:id', role(Administrador), atualizarCargoColaborador); 
// router.delete('/deletar/:id', role(Administrador), deletarColaborador);

router.use((req, res) => {
    res.status(404).json({
        erro: 'Subrota de /colaboradores não encontrada',
        caminho: req.originalUrl
    })
});

export default router;