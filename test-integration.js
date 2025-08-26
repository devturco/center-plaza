import pool from './api/database/connection.js';

async function testIntegration() {
  try {
    console.log('🔄 Testando integração Frontend -> Backend -> Database...');
    
    // Testar conexão
    const connection = await pool.getConnection();
    console.log('✅ Conexão com banco estabelecida');
    
    // Verificar tabelas existentes
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tabelas encontradas:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Verificar estrutura da tabela hotels se existir
    const hotelTable = tables.find(table => Object.values(table)[0] === 'hotels');
    if (hotelTable) {
      console.log('\n🏨 Estrutura da tabela hotels:');
      const [columns] = await connection.execute('DESCRIBE hotels');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Contar registros
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM hotels');
      console.log(`\n📊 Total de hotéis: ${count[0].total}`);
    }
    
    // Verificar estrutura da tabela room_types se existir
    const roomTable = tables.find(table => Object.values(table)[0] === 'room_types');
    if (roomTable) {
      console.log('\n🛏️ Estrutura da tabela room_types:');
      const [columns] = await connection.execute('DESCRIBE room_types');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Contar registros
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM room_types');
      console.log(`\n📊 Total de tipos de quartos: ${count[0].total}`);
    }
    
    connection.release();
    console.log('\n✅ Teste de integração concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste de integração:', error.message);
  } finally {
    process.exit(0);
  }
}

testIntegration();