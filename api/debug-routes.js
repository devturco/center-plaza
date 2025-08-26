import express from 'express';

const app = express();
const PORT = 3002;

app.use(express.json());

// Teste básico
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Debug server funcionando' });
});

// Testar rotas uma por uma
console.log('🔍 Testando rotas individuais...');

try {
  console.log('✅ Testando rota básica...');
  app.get('/test1', (req, res) => {
    res.json({ message: 'Rota básica OK' });
  });
  
  console.log('✅ Testando rota com parâmetro simples...');
  app.get('/test2/:id', (req, res) => {
    res.json({ message: 'Rota com parâmetro OK', id: req.params.id });
  });
  
  console.log('✅ Testando rota com dois parâmetros...');
  app.get('/test3/:hotel_id/:room_type_id', (req, res) => {
    res.json({ 
      message: 'Rota com dois parâmetros OK', 
      hotel_id: req.params.hotel_id,
      room_type_id: req.params.room_type_id 
    });
  });
  
  console.log('✅ Testando rota com parâmetros aninhados...');
  app.delete('/test4/:id/images/:imageId', (req, res) => {
    res.json({ 
      message: 'Rota aninhada OK', 
      id: req.params.id,
      imageId: req.params.imageId 
    });
  });
  
  console.log('✅ Todas as rotas de teste foram registradas com sucesso!');
  
} catch (error) {
  console.error('❌ Erro ao registrar rotas de teste:', error.message);
}

// Tentar importar as rotas reais uma por uma
console.log('\n🔍 Testando importação das rotas reais...');

try {
  console.log('📦 Importando hotels.js...');
  const hotelRoutes = await import('./routes/hotels.js');
  app.use('/api/hotels-test', hotelRoutes.default);
  console.log('✅ hotels.js importado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao importar hotels.js:', error.message);
}

try {
  console.log('📦 Importando rooms.js...');
  const roomRoutes = await import('./routes/rooms.js');
  app.use('/api/rooms-test', roomRoutes.default);
  console.log('✅ rooms.js importado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao importar rooms.js:', error.message);
}

try {
  console.log('📦 Importando reservations.js...');
  const reservationRoutes = await import('./routes/reservations.js');
  app.use('/api/reservations-test', reservationRoutes.default);
  console.log('✅ reservations.js importado com sucesso!');
} catch (error) {
  console.error('❌ Erro ao importar reservations.js:', error.message);
}

app.listen(PORT, () => {
  console.log(`\n🚀 Debug server rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📍 Test 1: http://localhost:${PORT}/test1`);
  console.log(`📍 Test 2: http://localhost:${PORT}/test2/123`);
  console.log(`📍 Test 3: http://localhost:${PORT}/test3/1/2`);
});