import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { testConnection } from './database/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🔄 Iniciando configuração do banco de dados...');
    
    // Testar conexão
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      process.exit(1);
    }
    
    // Ler arquivo SQL
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Dividir o conteúdo em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        // Pular comandos que são apenas comentários ou comandos específicos do MySQL CLI
        if (command.toUpperCase().startsWith('SHOW TABLES') || 
            command.toUpperCase().startsWith('SELECT') && command.includes('status')) {
          console.log(`⏭️  Pulando comando ${i + 1}: ${command.substring(0, 50)}...`);
          continue;
        }
        
        await pool.execute(command);
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
      } catch (error) {
        // Ignorar erros de "tabela já existe"
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`⚠️  Tabela já existe - Comando ${i + 1}`);
          continue;
        }
        
        console.error(`❌ Erro no comando ${i + 1}:`, error.message);
        console.error(`Comando: ${command}`);
        
        // Continuar com outros comandos mesmo se um falhar
        continue;
      }
    }
    
    // Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando tabelas criadas...');
    const [tables] = await pool.execute('SHOW TABLES');
    
    console.log('📋 Tabelas encontradas:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Verificar dados iniciais
    console.log('\n📊 Verificando dados iniciais...');
    
    try {
      const [hotels] = await pool.execute('SELECT COUNT(*) as count FROM hotels');
      console.log(`  - Hotéis: ${hotels[0].count}`);
      
      const [roomTypes] = await pool.execute('SELECT COUNT(*) as count FROM room_types');
      console.log(`  - Tipos de quartos: ${roomTypes[0].count}`);
      
      const [roomImages] = await pool.execute('SELECT COUNT(*) as count FROM room_images');
      console.log(`  - Imagens de quartos: ${roomImages[0].count}`);
      
      const [reservations] = await pool.execute('SELECT COUNT(*) as count FROM reservations');
      console.log(`  - Reservas: ${reservations[0].count}`);
    } catch (error) {
      console.error('❌ Erro ao verificar dados:', error.message);
    }
    
    console.log('\n🎉 Configuração do banco de dados concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar setup
setupDatabase();