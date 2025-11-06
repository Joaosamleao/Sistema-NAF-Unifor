import mongoose from 'mongoose';

const agendamentoSchema = new mongoose.Schema({
    nome: {type: String, required: true},
    cpf: {type: String, required: true, minlenght: 11, maxlength: 11},
    email: {type: String, required: true},
    tipoAgendamento: {type: String, required: true},
    atendimentosComplementares: {type: [String], default: []},
    data: {type: Date, required: true},
    status: {type: String, required: true, enum: ['Incompleto', 'Completo', 'Enviado'], default: 'Incompleto'}
})

export default mongoose.model('Appointment', agendamentoSchema);