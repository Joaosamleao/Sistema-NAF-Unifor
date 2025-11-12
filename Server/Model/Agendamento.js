import mongoose from 'mongoose';

const agendamentoSchema = new mongoose.Schema({
    nome: {type: String, required: true},
    cpf: {type: String, required: true, minlenght: 11, maxlength: 11},
    email: {type: String, required: true},
    telefone: {type: String, required: false},
    tipoAgendamento: {type: String, required: true},
    atendimentosComplementares: {type: [String], default: []},
    data: {type: Date, required: true},
    status: {type: String, required: true, enum: ['Incompleto', 'Completo', 'Enviado'], default: 'Incompleto'},
    foiConclusivo: {type: String, required: true, enum: ['Sim', 'Não'], default: 'Sim'},
    modalidade: {type: String, required: true, enum: ['Presencial', 'Remoto']},
    tipoDePessoa: {type: String, required: true, enum: ['Pessoa Física', 'Microempreendedor Individual', 'Pequenos Proprietários Rurais', 'Mulheres em situação de risco e vulnerabilidade conforme Programa Mulher Cidadã, Portaria MF 26/2023', 'Entidade sem fins lucrativos', 'Outra']}
})

export default mongoose.model('Appointment', agendamentoSchema);