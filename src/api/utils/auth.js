import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui-mude-em-producao';
const JWT_EXPIRATION = '7d'; // Token válido por 7 dias

/**
 * Gera um JWT token para um usuário
 * @param {Object} user - Objeto do usuário { id, email, name }
 * @returns {String} JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
};

/**
 * Verifica e decodifica um JWT token
 * @param {String} token - Token JWT
 * @returns {Object|null} Payload do token ou null se inválido
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

/**
 * Extrai o token do header Authorization
 * @param {String} authHeader - Header Authorization (Bearer token)
 * @returns {String|null} Token ou null
 */
export const extractToken = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * Middleware de autenticação para Express
 * Valida o token JWT do header Authorization
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = extractToken(authHeader);

  if (!token) {
    return res.status(401).json({ 
      error: 'Token não fornecido. Use Bearer token no header Authorization' 
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ 
      error: 'Token inválido ou expirado' 
    });
  }

  // Adiciona informações do usuário ao request (normaliza para 'id' em vez de 'userId')
  req.user = {
    id: decoded.userId,
    email: decoded.email,
    name: decoded.name
  };
  next();
};
