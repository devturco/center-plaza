import mysql from 'mysql2/promise';

// Configuração da conexão MySQL
const dbConfig = {
  host: 'host.neuratek.com.br',
  port: 3307,
  user: 'usermac',
  password: 'TH1460-d3v@',
  database: 'centerplaza',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Criar pool de conexões
const pool = mysql.createPool(dbConfig);

// Função para testar a conexão
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexão com MySQL estabelecida com sucesso');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error.message);
    return false;
  }
}

// Função para executar queries
export async function executeQuery(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
}

// Função para executar múltiplas queries em transação
export async function executeTransaction(queries) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params || []);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Função para fechar o pool de conexões
export async function closePool() {
  try {
    await pool.end();
    console.log('🔒 Pool de conexões MySQL fechado');
  } catch (error) {
    console.error('Erro ao fechar pool de conexões:', error);
  }
}

// Exportar o pool para uso direto quando necessário
export default pool;

// Tratamento de eventos do pool
pool.on('connection', (connection) => {
  console.log(`🔗 Nova conexão estabelecida como id ${connection.threadId}`);
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Tentando reconectar...');
  }
});