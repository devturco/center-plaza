import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3001;

// Middleware básico
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração da conexão MySQL
const dbConfig = {
  host: 'host.neuratek.com.br',
  port: 3307,
  user: 'usermac',
  password: 'TH1460-d3v@',
  database: 'centerplaza',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// Função para inicializar a conexão com o banco
async function initializeDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log('✅ Conectado ao banco de dados MySQL');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    return false;
  }
}

// Middleware para verificar conexão com banco
const checkDatabase = async (req, res, next) => {
  try {
    if (!pool) {
      throw new Error('Pool de conexão não inicializado');
    }
    req.db = pool;
    next();
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro de conexão com banco de dados',
      message: error.message 
    });
  }
};

// Rota de teste simples
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API do Center Plaza funcionando',
    timestamp: new Date().toISOString()
  });
});

// Testar importação das rotas uma por uma
console.log('🔍 Testando importação de rotas...');

try {
  console.log('📝 Importando hotels.js...');
  const hotelRoutes = await import('./routes/hotels.js');
  app.use('/api/hotels', checkDatabase, hotelRoutes.default);
  console.log('✅ hotels.js importado com sucesso');
} catch (error) {
  console.error('❌ Erro ao importar hotels.js:', error.message);
}

try {
  console.log('📝 Importando rooms.js...');
  const roomRoutes = await import('./routes/rooms.js');
  app.use('/api/rooms', checkDatabase, roomRoutes.default);
  console.log('✅ rooms.js importado com sucesso');
} catch (error) {
  console.error('❌ Erro ao importar rooms.js:', error.message);
}

try {
  console.log('📝 Importando reservations.js...');
  const reservationRoutes = await import('./routes/reservations.js');
  app.use('/api/reservations', checkDatabase, reservationRoutes.default);
  console.log('✅ reservations.js importado com sucesso');
} catch (error) {
  console.error('❌ Erro ao importar reservations.js:', error.message);
}

// Inicializar servidor
async function startServer() {
  const dbConnected = await initializeDatabase();
  
  if (!dbConnected) {
    console.error('❌ Não foi possível conectar ao banco de dados. Servidor não iniciado.');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de debug rodando na porta ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer();