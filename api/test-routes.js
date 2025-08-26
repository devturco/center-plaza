import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3001;

// Middleware básico
app.use(cors());
app.use(express.json());

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

// Criar router para testar rotas problemáticas
const router = express.Router();

// Teste 1: Rota simples com um parâmetro
router.get('/test1/:id', async (req, res) => {
  res.json({ message: 'Teste 1 funcionando', id: req.params.id });
});

// Teste 2: Rota com dois parâmetros (como availability)
router.get('/test2/:hotel_id/:room_type_id', async (req, res) => {
  res.json({ 
    message: 'Teste 2 funcionando', 
    hotel_id: req.params.hotel_id,
    room_type_id: req.params.room_type_id
  });
});

// Teste 3: Rota com parâmetros aninhados (como images)
router.delete('/test3/:id/images/:imageId', async (req, res) => {
  res.json({ 
    message: 'Teste 3 funcionando', 
    id: req.params.id,
    imageId: req.params.imageId
  });
});

app.use('/api/test', checkDatabase, router);

// Inicializar servidor
async function startServer() {
  const dbConnected = await initializeDatabase();
  
  if (!dbConnected) {
    console.error('❌ Não foi possível conectar ao banco de dados. Servidor não iniciado.');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📍 Teste 1: http://localhost:${PORT}/api/test/test1/123`);
    console.log(`📍 Teste 2: http://localhost:${PORT}/api/test/test2/1/2`);
    console.log(`📍 Teste 3: DELETE http://localhost:${PORT}/api/test/test3/1/images/2`);
  });
}

startServer();