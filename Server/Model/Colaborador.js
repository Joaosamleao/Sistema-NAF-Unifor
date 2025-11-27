import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const colaboradorSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    cpf: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    telefone: { type: String },
    senha: { type: String, required: true },
    cargo: { type: String, required: true, enum: ['Administrador', 'Monitor', 'Leitor', 'Aguardando'], default: 'Aguardando'},
    ativo: { type: Boolean, required: true, default: false },
    dataEntrada: { type: Date, default: Date.now },
});

colaboradorSchema.pre('save', async function(next) {
    if (this.isModified('senha')) {
        this.senha = await bcrypt.hash(this.senha, 10);
    }
    next();
});

export default mongoose.model('Colaborador', colaboradorSchema, 'colaboradores');