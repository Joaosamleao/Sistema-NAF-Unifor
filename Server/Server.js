import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authMiddleware from './Middleware/auth.js';
import roleMiddleware from './Middleware/role.js';
import AgendamentoRoutes from './Routes/AgendamentoRoutes.js';
import ReceitaFederalRoutes from './Routes/ReceitaFederalRoutes.js'
import AuthRoutes from './Routes/AuthRoutes.js';
import ColaboradorRoutes from './Routes/ColaboradorRoutes.js'; 
import { connectDB } from './Config/Database.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
})

app.use('/api/auth', AuthRoutes);

app.use('/api/agendamentos', authMiddleware, roleMiddleware(['Administrador', 'Monitor', 'Leitor']), AgendamentoRoutes); 
app.use('/api/receita', authMiddleware, roleMiddleware(['Administrador']), ReceitaFederalRoutes);
app.use('/api/colaboradores', authMiddleware, roleMiddleware(['Administrador']), ColaboradorRoutes);

app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada',
        caminho: req.originalUrl
    });
});

try {
        await connectDB();
} catch (err) {
        console.error('Falha ao conectar ao banco de dados. Encerrando processo.');
        console.error(err);
        process.exit(1);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});