import Agendamento from "../Model/Agendamento.js";

export const listarAgendamentos = async(req ,res) => {
    try {
        const agendamentos = await Agendamento.find();
        res.status(200).json(agendamentos);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const listarAgendamentosI = async(req, res) => {
    try {
        const agendamentos = await Agendamento.find({status: 'Incompleto'});
        res.status(200).json(agendamentos);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const listarAgendamentosC = async(req, res) => {
    try {
        const agendamentos = await Agendamento.find({status: 'Completo'});
        res.status(200).json(agendamentos);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

export const obterAgendamento = async(req, res) => {
    try {
        const agendamento = await Agendamento.findById(req.params.id);
        if (!agendamento) {
            return res.status(404).json({message: 'Agendamento não encontrado'});
        }
        res.status(200).json(agendamento);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const criarAgendamento = async(req, res) => {
    try {
        await Agendamento.collection.dropIndex("usuarioId_1"); 
        console.log("🔧 FIX: Índice fantasma 'usuarioId_1' removido com sucesso.");
    } catch (error) {
    }

    try {
        const agendamento = new Agendamento(req.body);
        const newAgendamento = await agendamento.save();
        res.status(201).json(newAgendamento);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const atualizarAgendamento = async(req, res) => {
    try {
        const agendamento = await Agendamento.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!agendamento) {
            return res.status(404).json({message: 'Agendamento não encontrado'});
        }
        res.status(200).json(agendamento);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

export const deletarAgendamento = async(req, res) => {
    try {
        const agendamento = await Agendamento.findByIdAndDelete(req.params.id);
        if (!agendamento) {
            return res.status(404).json({message: 'Agendamento não encontrado'});
        }
        res.status(200).json(agendamento);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};