import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = 3001;

// Middleware
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

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API do Center Plaza funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota simples para testar banco
app.get('/api/test-db', checkDatabase, async (req, res) => {
  try {
    const [rows] = await req.db.execute('SELECT 1 as test');
    res.json({ 
      status: 'OK', 
      message: 'Conexão com banco funcionando',
      result: rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao testar banco',
      message: error.message 
    });
  }
});

// Rota para verificar tabelas existentes
app.get('/api/check-tables', checkDatabase, async (req, res) => {
  try {
    const [tables] = await req.db.execute('SHOW TABLES');
    const tableNames = tables.map(row => Object.values(row)[0]);
    
    // Verificar se as tabelas do Center Plaza existem
    const centerPlazaTables = ['hotels', 'room_types', 'room_images', 'reservations'];
    const existingTables = centerPlazaTables.filter(table => tableNames.includes(table));
    const missingTables = centerPlazaTables.filter(table => !tableNames.includes(table));
    
    res.json({ 
      status: 'OK',
      allTables: tableNames,
      centerPlazaTables: {
        existing: existingTables,
        missing: missingTables
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao verificar tabelas',
      message: error.message 
    });
  }
});

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
    console.log(`📍 Test DB: http://localhost:${PORT}/api/test-db`);
  });
}

startServer();