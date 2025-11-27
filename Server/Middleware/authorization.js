export const checkRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.user.cargo; 
        const isActive = req.user.ativo; 

        if (!isActive) {
             // 403 Forbidden: o colaborador esta na base mas a conta não foi liberada
            return res.status(403).json({ message: 'Acesso pendente: Sua conta está aguardando ativação pelo Administrador.' });
        }
      
        if (roles.includes(userRole)) {
            next(); 
        } else {
            // 403 Forbidden: usuário logado mas sem permissão para essa ação
            return res.status(403).json({ message: 'Você não tem o cargo necessário para esta ação.' });
        }
    };
};