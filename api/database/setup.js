import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração da conexão MySQL
const dbConfig = {
  host: 'host.neuratek.com.br',
  port: 3307,
  user: 'usermac',
  password: 'TH1460-d3v@',
  database: 'centerplaza',
  multipleStatements: true
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Conectando ao banco de dados MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados!');
    
    // Ler o arquivo SQL
    const sqlFilePath = path.join(__dirname, 'schema.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('🔄 Executando script SQL...');
    
    // Dividir o SQL em statements individuais
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✅ Statement executado com sucesso');
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('ℹ️  Tabela já existe, continuando...');
          } else {
            console.error('❌ Erro ao executar statement:', error.message);
            console.error('Statement:', statement.substring(0, 100) + '...');
          }
        }
      }
    }
    
    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas:');
    
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'hotels' OR SHOW TABLES LIKE 'room_types' OR SHOW TABLES LIKE 'room_images'"
    );
    
    console.log('📋 Tabelas encontradas:', tables.map(t => Object.values(t)[0]));
    
    // Verificar dados inseridos
    const [hotelCount] = await connection.execute('SELECT COUNT(*) as count FROM hotels');
    const [roomCount] = await connection.execute('SELECT COUNT(*) as count FROM room_types');
    const [imageCount] = await connection.execute('SELECT COUNT(*) as count FROM room_images');
    
    console.log('\n📊 Dados inseridos:');
    console.log(`   Hotéis: ${hotelCount[0].count}`);
    console.log(`   Tipos de quartos: ${roomCount[0].count}`);
    console.log(`   Imagens: ${imageCount[0].count}`);
    
    console.log('\n🎉 Banco de dados configurado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada.');
    }
  }
}

// Executar setup se chamado diretamente