import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const colaboradorSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    telefone: { type: String },
    senha: { type: String, required: true },
    cargo: { type: String, enum: ['Administrador', 'Monitor', 'Leitor'], default: 'Leitor' },
    dataEntrada: { type: Date, default: Date.now },
});

// Hook: HASH da senha ANTES de salvar o colaborador (Segurança!)
colaboradorSchema.pre('save', async function(next) {
    if (this.isModified('senha')) {
        this.senha = await bcrypt.hash(this.senha, 10);
    }
    next();
});

// Usar o nome exato da coleção no banco de dados: 'colaboradores'
export default mongoose.model('Colaborador', colaboradorSchema, 'colaboradores');