import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import AgendamentoRoutes from './Routes/AgendamentoRoutes.js';
import ReceitaFederalRoutes from './Routes/ReceitaFederalRoutes.js'
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

app.use('/api/agendamentos', AgendamentoRoutes);
app.use('/api/receita', ReceitaFederalRoutes);

app.use((req, res) => {
    res.status(404).json({
        erro: 'Rota não encontrada',
        caminho: req.originalUrl
    });
});

await connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`);
});