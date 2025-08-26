import express from 'express';
import cors from 'cors';
import pool, { testConnection } from './database/connection.js';

// Configuração do banco de dados (sem especificar database para listar bancos)
const dbConfig = {
  host: 'localhost',
  user: 'usermac',
  password: 'macmac',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware para verificar conexão com banco
app.use(async (req, res, next) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      req.db = pool;
      next();
    } else {
      return res.status(500).json({ error: 'Erro de conexão com banco de dados' });
    }
  } catch (error) {
    console.error('❌ Erro de conexão com banco:', error.message);
    return res.status(500).json({ error: 'Erro de conexão com banco de dados' });
  }
});

// Rota de saúde
app.get('/api/health', (req, res) => {
  res.json({ message: 'API Center Plaza funcionando!', timestamp: new Date().toISOString() });
});

// Rota de teste do banco
app.get('/api/test-db', async (req, res) => {
  try {
    const [result] = await req.db.execute('SELECT 1 as test');
    res.json({ message: 'Conexão com banco funcionando!', result: result[0] });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao testar banco', details: error.message });
  }
});

// Endpoint para listar bancos de dados
app.get('/api/databases', async (req, res) => {
  try {
    const [rows] = await req.db.execute('SHOW DATABASES');
    const databases = rows.map(row => Object.values(row)[0]);
    res.json({ databases });
  } catch (error) {
    console.error('❌ Erro ao listar bancos:', error.message);
    res.status(500).json({ error: 'Erro ao listar bancos', details: error.message });
  }
});

// Endpoint para listar tabelas
app.get('/api/tables', async (req, res) => {
  try {
    const [rows] = await req.db.execute('SHOW TABLES');
    const tables = rows.map(row => Object.values(row)[0]);
    res.json({ tables });
  } catch (error) {
    console.error('❌ Erro ao listar tabelas:', error.message);
    res.status(500).json({ error: 'Erro ao listar tabelas', details: error.message });
  }
});

// Rota para criar tabelas necessárias
app.post('/api/setup-tables', async (req, res) => {
  try {
    // Criar tabela hotels
    await req.db.execute(`
      CREATE TABLE IF NOT EXISTS hotels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        address VARCHAR(500),
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela room_types
    await req.db.execute(`
      CREATE TABLE IF NOT EXISTS room_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        capacity INT NOT NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        amenities JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela room_images
    await req.db.execute(`
      CREATE TABLE IF NOT EXISTS room_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_type_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela reservations
    await req.db.execute(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hotel_id INT NOT NULL,
        room_type_id INT NOT NULL,
        guest_name VARCHAR(255) NOT NULL,
        guest_email VARCHAR(255) NOT NULL,
        guest_phone VARCHAR(20),
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        guests_count INT NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    res.json({ message: 'Tabelas criadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// Rota simples para hotéis
app.get('/api/hotels', async (req, res) => {
  try {
    const [hotels] = await req.db.execute('SELECT * FROM hotels ORDER BY created_at DESC');
    res.json(hotels);
  } catch (error) {
    console.error('Erro ao buscar hotéis:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

// Rota simples para criar hotel
app.post('/api/hotels', async (req, res) => {
  try {
    const { name, description, address, city, state, zip_code, phone, email } = req.body;
    
    if (!name || !address || !city) {
      return res.status(400).json({ error: 'Nome, endereço e cidade são obrigatórios' });
    }
    
    const query = `
      INSERT INTO hotels (name, description, address, city, state, zip_code, phone, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await req.db.execute(query, [
      name, description, address, city, state, zip_code, phone, email
    ]);
    
    const [newHotel] = await req.db.execute('SELECT * FROM hotels WHERE id = ?', [result.insertId]);
    
    res.status(201).json(newHotel[0]);
  } catch (error) {
    console.error('Erro ao criar hotel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🏨 Hotéis: http://localhost:${PORT}/api/hotels`);
});