const Database = require('sqlite3').Database;
const path = require('path');

const dbPath = path.join(__dirname, 'api', 'database', 'centerplaza.db');
const db = new Database(dbPath);

console.log('🗄️  VISUALIZADOR DE BANCO DE DADOS SQLite');
console.log('=' .repeat(50));

// Função para exibir tabelas
function showTables() {
  return new Promise((resolve, reject) => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log('\n📋 TABELAS DISPONÍVEIS:');
      tables.forEach((table, index) => {
        console.log(`${index + 1}. ${table.name}`);
      });
      
      resolve(tables);
    });
  });
}

// Função para exibir estrutura de uma tabela
function showTableStructure(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`\n🏗️  ESTRUTURA DA TABELA: ${tableName.toUpperCase()}`);
      console.log('-'.repeat(40));
      columns.forEach(col => {
        const nullable = col.notnull ? 'NOT NULL' : 'NULL';
        const pk = col.pk ? ' (PRIMARY KEY)' : '';
        console.log(`${col.name}: ${col.type} ${nullable}${pk}`);
      });
      
      resolve();
    });
  });
}

// Função para exibir dados de uma tabela
function showTableData(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      console.log(`\n📊 DADOS DA TABELA: ${tableName.toUpperCase()}`);
      console.log('-'.repeat(40));
      
      if (rows.length === 0) {
        console.log('Nenhum registro encontrado.');
      } else {
        console.log(`Total de registros: ${rows.length}`);
        console.log('\nPrimeiros registros:');
        rows.slice(0, 5).forEach((row, index) => {
          console.log(`\n[${index + 1}]`, JSON.stringify(row, null, 2));
        });
        
        if (rows.length > 5) {
          console.log(`\n... e mais ${rows.length - 5} registros`);
        }
      }
      
      resolve();
    });
  });
}

// Função principal
async function main() {
  try {
    const tables = await showTables();
    
    for (const table of tables) {
      await showTableStructure(table.name);
      await showTableData(table.name);
      console.log('\n' + '='.repeat(50));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    db.close();
    console.log('\n✅ Conexão com banco fechada.');
  }
}

main();