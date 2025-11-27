import jwt from 'jsonwebtoken';
import Colaborador from '../Model/Colaborador.js'; 
import bcrypt from 'bcrypt'; 

export const login = async (req, res) => { 
  const { username, password } = req.body;

  try {
    const colaborador = await Colaborador.findOne({ email: username });

    if (!colaborador) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, colaborador.senha);

    if (isMatch) {
      const token = jwt.sign(
        { id: colaborador._id, email: colaborador.email, cargo: colaborador.cargo }, 
        process.env.JWT_SECRET, 
        { expiresIn: '8h' }
      );
      return res.json({ token, cargo: colaborador.cargo });
    }
    return res.status(401).json({ message: 'Credenciais inválidas' });

  } catch (error) {
    console.error('Erro no login:', error);
    // caso o erro seja na busca no banco ou outro erro interno
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const register = async (req, res) => {
    try {
        const novoColaborador = new Colaborador(req.body);
        
        await novoColaborador.save();

        // usuário criado. o fluxo pede para aguardar o Admin
        return res.status(201).json({ 
            message: 'Colaborador criado com sucesso. Aguardando aprovação.',
            id: novoColaborador._id 
        });

    } catch (error) {
        // erro 11000: Violação de Unique Index (email ou cpf duplicado)
        if (error.code === 11000) {
            return res.status(409).json({ message: 'E-mail ou CPF já cadastrado no sistema.' });
        }
        console.error('Erro no registro:', error);
        return res.status(500).json({ message: 'Erro ao registrar o colaborador.' });
    }
};