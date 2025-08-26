import express from 'express';

const app = express();
const PORT = 3003;

app.use(express.json());

// Middleware simples para simular req.db
app.use((req, res, next) => {
  req.db = { execute: () => Promise.resolve([[]]) };
  next();
});

app.get('/test', (req, res) => {
  res.json({ message: 'Servidor de teste funcionando' });
});

console.log('Testando importação individual de rotas...');

try {
  console.log('1. Testando hotels.js...');
  const hotelRoutes = await import('./routes/hotels.js');
  app.use('/api/hotels', hotelRoutes.default);
  console.log('✅ hotels.js importado com sucesso');
} catch (error) {
  console.error('❌ Erro ao importar hotels.js:', error.message);
  process.exit(1);
}

try {
  console.log('2. Testando rooms.js...');
  const roomRoutes = await import('./routes/rooms.js');
  app.use('/api/rooms', roomRoutes.default);
  console.log('✅ rooms.js importado com sucesso');
} catch (error) {
  console.error('❌ Erro ao importar rooms.js:', error.message);
  process.exit(1);
}

try {
  console.log('3. Testando reservations.js...');
  const reservationRoutes = await import('./routes/reservations.js');
  app.use('/api/reservations', reservationRoutes.default);
  console.log('✅ reservations.js importado com sucesso');
} catch (error) {
  console.error('❌ Erro ao importar reservations.js:', error.message);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
});