import Colaborador from "../Model/Colaborador.js";

export const listarColaboradores = async (req, res) => {
  try {
    const colaboradores = await Colaborador.find().select("-senha");
    res.status(200).json(colaboradores);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao buscar colaboradores", error: error.message });
  }
};

export const atualizarCargoColaborador = async (req, res) => {
  const { id } = req.params;
  const { cargo } = req.body;

  if (!cargo) {
        return res.status(400).json({ message: 'O novo cargo é obrigatório.' });
    }

  let updateFields = { cargo: cargo };

  if (cargo !== 'Aguardando') {
    updateFields.ativo = true;
  } else if (cargo === 'Aguardando') {
    updateFields.ativo = false;
  }

  try {
    const colaborador = await Colaborador.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!colaborador) {
      return res.status(404).json({ message: 'Colaborador não encontrado.' });
    }

    return res.status(200).json({
      message: 'Cargo atualizado com sucesso.',
      colaborador,
    });
  } catch (error) {
    console.error('Erro ao atualizar cargo:', error);
    return res.status(500).json({ message: 'Erro ao atualizar cargo do colaborador', error: error.message });
  }
};
