import pool, { testConnection } from './database/connection.js';

async function createTables() {
  try {
    console.log('🔄 Criando tabelas do banco de dados...');
    
    // Testar conexão
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      process.exit(1);
    }
    
    // Criar tabela hotels
    console.log('📋 Criando tabela hotels...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        zip_code VARCHAR(20),
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        description TEXT,
        amenities JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_city (city),
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci