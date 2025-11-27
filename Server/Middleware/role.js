// Middleware/role.js
export default function role(rolesPermitidos) {
    return (req, res, next) => {
        const userCargo = req.user && req.user.cargo;

        if (!userCargo) {
            return res.status(403).json({ message: 'Acesso negado: Cargo do usuário não encontrado no token.' });
        }

        if (userCargo === 'Aguardando') {
            return res.status(403).json({ message: 'Acesso pendente: Sua conta está aguardando ativação pelo Administrador.' });
        }
        
        if (rolesPermitidos.includes(userCargo)) {
            return next();
        } else {
            return res.status(403).json({ message: 'Acesso negado: Você não tem permissão para esta ação.' });
        }
    };
}