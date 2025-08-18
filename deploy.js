#!/usr/bin/env node

/**
 * Script de Deploy Automatizado - Center Plaza
 * 
 * Este script automatiza o processo de build e deploy do projeto.
 * Suporta múltiplas plataformas de deploy.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const config = {
  buildDir: 'dist',
  projectName: 'center-plaza',
  platforms: {
    vercel: 'vercel --prod',
    netlify: 'netlify deploy --prod --dir=dist',
    surge: 'surge dist/ center-plaza.surge.sh'
  }
};

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`\n🔄 ${description}...`, 'cyan');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} concluído!`, 'green');
    return true;
  } catch (error) {
    log(`❌ Erro em ${description}: ${error.message}`, 'red');
    return false;
  }
}

function checkBuildDir() {
  if (!fs.existsSync(config.buildDir)) {
    log(`❌ Diretório de build '${config.buildDir}' não encontrado!`, 'red');
    log('Execute "npm run build" primeiro.', 'yellow');
    return false;
  }
  return true;
}

function showHelp() {
  log('\n📋 Script de Deploy - Center Plaza', 'bright');
  log('\nUso: node deploy.js [plataforma]', 'cyan');
  log('\nPlataformas disponíveis:', 'yellow');
  Object.keys(config.platforms).forEach(platform => {
    log(`  • ${platform}`, 'magenta');
  });
  log('\nExemplos:', 'yellow');
  log('  node deploy.js vercel', 'cyan');
  log('  node deploy.js netlify', 'cyan');
  log('  node deploy.js surge', 'cyan');
  log('\nSem argumentos: executa apenas o build', 'yellow');
}

function main() {
  const args = process.argv.slice(2);
  const platform = args[0];

  log('\n🚀 Iniciando processo de deploy...', 'bright');
  log(`📦 Projeto: ${config.projectName}`, 'blue');

  // Mostrar ajuda se solicitado
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // Executar build
  if (!execCommand('npm run build', 'Build de produção')) {
    process.exit(1);
  }

  // Verificar se build foi criado
  if (!checkBuildDir()) {
    process.exit(1);
  }

  // Se nenhuma plataforma especificada, apenas build
  if (!platform) {
    log('\n✅ Build concluído! Arquivos prontos em ./dist/', 'green');
    log('\n💡 Para fazer deploy, execute:', 'yellow');
    log('  node deploy.js [plataforma]', 'cyan');
    showHelp();
    return;
  }

  // Verificar se plataforma é válida
  if (!config.platforms[platform]) {
    log(`\n❌ Plataforma '${platform}' não suportada!`, 'red');
    showHelp();
    process.exit(1);
  }

  // Executar deploy
  const deployCommand = config.platforms[platform];
  if (execCommand(deployCommand, `Deploy para ${platform}`)) {
    log(`\n🎉 Deploy para ${platform} concluído com sucesso!`, 'green');
    log('\n📊 Estatísticas do build:', 'blue');
    
    // Mostrar tamanho dos arquivos
    try {
      const stats = fs.statSync(path.join(config.buildDir, 'index.html'));
      log(`  • index.html: ${(stats.size / 1024).toFixed(2)} KB`, 'cyan');
      
      const assetsDir = path.join(config.buildDir, 'assets');
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        files.forEach(file => {
          const filePath = path.join(assetsDir, file);
          const fileStats = fs.statSync(filePath);
          log(`  • ${file}: ${(fileStats.size / 1024).toFixed(2)} KB`, 'cyan');
        });
      }
    } catch (error) {
      log('  Não foi possível obter estatísticas dos arquivos', 'yellow');
    }
    
    log('\n🔗 Próximos passos:', 'yellow');
    log('  • Configurar domínio personalizado', 'cyan');
    log('  • Configurar SSL/HTTPS', 'cyan');
    log('  • Implementar monitoramento', 'cyan');
  } else {
    log(`\n❌ Falha no deploy para ${platform}`, 'red');
    process.exit(1);
  }
}

// Executar script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, config };