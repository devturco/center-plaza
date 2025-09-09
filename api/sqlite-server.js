import express from 'express';
import cors from 'cors';
import { getConnection, testConnection } from './database/sqlite-connection.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configurar charset UTF-8 para todas as respostas
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'API do Center Plaza funcionando com SQLite' });
});

// Rota para listar hotéis
app.get('/api/hotels', async (req, res) => {
  try {
    const db = await getConnection();
    const hotels = await db.all('SELECT * FROM hotels ORDER BY created_at DESC');
    
    // Parse amenities JSON and add location field
    const hotelsWithParsedAmenities = hotels.map(hotel => ({
      ...hotel,
      location: hotel.address, // Adicionar campo location para compatibilidade
      amenities: hotel.amenities ? JSON.parse(hotel.amenities) : []
    }));
    
    res.json(hotelsWithParsedAmenities);
  } catch (error) {
    console.error('Erro ao buscar hotéis:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar hotel
app.post('/api/hotels', async (req, res) => {
  try {
    const { name, address, city, state, zip_code, phone, email, website, description, amenities } = req.body;
    
    const db = await getConnection();
    const result = await db.run(`
      INSERT INTO hotels (name, address, city, state, zip_code, phone, email, website, description, amenities)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, address, city, state, zip_code, phone, email, website, description, JSON.stringify(amenities || [])]);
    
    const newHotel = await db.get('SELECT * FROM hotels WHERE id = ?', [result.lastID]);
    
    res.status(201).json({
      ...newHotel,
      amenities: newHotel.amenities ? JSON.parse(newHotel.amenities) : []
    });
  } catch (error) {
    console.error('Erro ao criar hotel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar tipos de quartos
app.get('/api/rooms', async (req, res) => {
  try {
    const db = await getConnection();
    const rooms = await db.all(`
      SELECT rt.*, h.name as hotel_name 
      FROM room_types rt 
      JOIN hotels h ON rt.hotel_id = h.id 
      ORDER BY rt.created_at DESC
    `);
    
    // Parse amenities JSON
    const roomsWithParsedAmenities = rooms.map(room => ({
      ...room,
      amenities: room.amenities ? JSON.parse(room.amenities) : []
    }));
    
    res.json(roomsWithParsedAmenities);
  } catch (error) {
    console.error('Erro ao buscar quartos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar tipo de quarto
app.post('/api/rooms', async (req, res) => {
  try {
    const {
      hotel_id, name, description, size_sqm, bed_type, bed_count,
      max_occupancy, amenities, bathroom_type, smoking_allowed, price_per_night
    } = req.body;
    
    const db = await getConnection();
    const result = await db.run(`
      INSERT INTO room_types (
        hotel_id, name, description, size_sqm, bed_type, bed_count,
        max_occupancy, amenities, bathroom_type, smoking_allowed, price_per_night
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      hotel_id, name, description, size_sqm, bed_type, bed_count,
      max_occupancy, JSON.stringify(amenities || []), bathroom_type, smoking_allowed ? 1 : 0, price_per_night
    ]);
    
    const newRoom = await db.get(`
      SELECT rt.*, h.name as hotel_name 
      FROM room_types rt 
      JOIN hotels h ON rt.hotel_id = h.id 
      WHERE rt.id = ?
    `, [result.lastID]);
    
    res.status(201).json({
      ...newRoom,
      amenities: newRoom.amenities ? JSON.parse(newRoom.amenities) : []
    });
  } catch (error) {
    console.error('Erro ao criar quarto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar reservas
app.get('/api/reservations', async (req, res) => {
  try {
    const db = await getConnection();
    const reservations = await db.all(`
      SELECT r.*, h.name as hotel_name, rt.name as room_type_name
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN room_types rt ON r.room_type_id = rt.id
      ORDER BY r.created_at DESC
    `);
    
    res.json(reservations);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar hotel por ID
app.get('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    const hotel = await db.get('SELECT * FROM hotels WHERE id = ?', [id]);
    
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel não encontrado' });
    }
    
    res.json({
      ...hotel,
      location: hotel.address, // Adicionar campo location para compatibilidade
      amenities: hotel.amenities ? JSON.parse(hotel.amenities) : []
    });
  } catch (error) {
    console.error('Erro ao buscar hotel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar quartos por hotel
app.get('/api/hotels/:hotelId/rooms', async (req, res) => {
  try {
    const { hotelId } = req.params;
    const db = await getConnection();
    const rooms = await db.all(`
      SELECT rt.*, h.name as hotel_name 
      FROM room_types rt 
      JOIN hotels h ON rt.hotel_id = h.id 
      WHERE rt.hotel_id = ?
      ORDER BY rt.created_at DESC
    `, [hotelId]);
    
    const roomsWithParsedAmenities = rooms.map(room => ({
      ...room,
      amenities: room.amenities ? JSON.parse(room.amenities) : []
    }));
    
    res.json(roomsWithParsedAmenities);
  } catch (error) {
    console.error('Erro ao buscar quartos do hotel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar quarto por ID
app.get('/api/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    const room = await db.get(`
      SELECT rt.*, h.name as hotel_name 
      FROM room_types rt 
      JOIN hotels h ON rt.hotel_id = h.id 
      WHERE rt.id = ?
    `, [id]);
    
    if (!room) {
      return res.status(404).json({ error: 'Quarto não encontrado' });
    }
    
    res.json({
      ...room,
      amenities: room.amenities ? JSON.parse(room.amenities) : []
    });
  } catch (error) {
    console.error('Erro ao buscar quarto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar hotel
app.put('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, city, state, zip_code, phone, email, website, description, amenities } = req.body;
    
    const db = await getConnection();
    
    // Verificar se hotel existe e buscar dados atuais
    const existingHotel = await db.get('SELECT * FROM hotels WHERE id = ?', [id]);
    if (!existingHotel) {
      return res.status(404).json({ error: 'Hotel não encontrado' });
    }
    
    // Usar valores existentes se não fornecidos
    const updatedData = {
      name: name !== undefined ? name : existingHotel.name,
      address: address !== undefined ? address : existingHotel.address,
      city: city !== undefined ? city : existingHotel.city,
      state: state !== undefined ? state : existingHotel.state,
      zip_code: zip_code !== undefined ? zip_code : existingHotel.zip_code,
      phone: phone !== undefined ? phone : existingHotel.phone,
      email: email !== undefined ? email : existingHotel.email,
      website: website !== undefined ? website : existingHotel.website,
      description: description !== undefined ? description : existingHotel.description,
      amenities: amenities !== undefined ? amenities : (existingHotel.amenities ? JSON.parse(existingHotel.amenities) : [])
    };
    
    await db.run(`
      UPDATE hotels SET 
        name = ?, address = ?, city = ?, state = ?, zip_code = ?, 
        phone = ?, email = ?, website = ?, description = ?, amenities = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      updatedData.name, updatedData.address, updatedData.city, updatedData.state, 
      updatedData.zip_code, updatedData.phone, updatedData.email, updatedData.website, 
      updatedData.description, JSON.stringify(updatedData.amenities), id
    ]);
    
    const updatedHotel = await db.get('SELECT * FROM hotels WHERE id = ?', [id]);
    
    res.json({
      ...updatedHotel,
      location: updatedHotel.address, // Adicionar campo location para compatibilidade
      amenities: updatedHotel.amenities ? JSON.parse(updatedHotel.amenities) : []
    });
  } catch (error) {
    console.error('Erro ao atualizar hotel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar quarto
app.put('/api/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      hotel_id, name, description, size_sqm, bed_type, bed_count,
      max_occupancy, amenities, bathroom_type, smoking_allowed, price_per_night
    } = req.body;
    
    console.log('🔄 Atualizando quarto ID:', id);
    console.log('📝 Dados recebidos:', req.body);
    
    const db = await getConnection();
    
    // Verificar se quarto existe
    const existingRoom = await db.get('SELECT id FROM room_types WHERE id = ?', [id]);
    if (!existingRoom) {
      return res.status(404).json({ error: 'Quarto não encontrado' });
    }
    
    await db.run(`
      UPDATE room_types SET 
        hotel_id = ?, name = ?, description = ?, size_sqm = ?, bed_type = ?, 
        bed_count = ?, max_occupancy = ?, amenities = ?, bathroom_type = ?, 
        smoking_allowed = ?, price_per_night = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      hotel_id, name, description, size_sqm, bed_type, bed_count,
      max_occupancy, JSON.stringify(amenities || []), bathroom_type, 
      smoking_allowed ? 1 : 0, price_per_night, id
    ]);
    
    const updatedRoom = await db.get(`
      SELECT rt.*, h.name as hotel_name 
      FROM room_types rt 
      JOIN hotels h ON rt.hotel_id = h.id 
      WHERE rt.id = ?
    `, [id]);
    
    console.log('✅ Quarto atualizado:', updatedRoom);
    
    res.json({
      ...updatedRoom,
      amenities: updatedRoom.amenities ? JSON.parse(updatedRoom.amenities) : []
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar quarto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar reservas com filtros
app.get('/api/reservations', async (req, res) => {
  try {
    const { guest_email, code, guest_name } = req.query;
    const db = await getConnection();
    
    let query = `
      SELECT r.*, h.name as hotel_name, rt.name as room_type_name
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN room_types rt ON r.room_type_id = rt.id
    `;
    
    const params = [];
    const conditions = [];
    
    if (guest_email) {
      conditions.push('r.guest_email = ?');
      params.push(guest_email);
    }
    
    if (code && guest_name) {
      conditions.push('r.id = ? AND r.guest_name = ?');
      params.push(code, guest_name);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY r.created_at DESC';
    
    const reservations = await db.all(query, params);
    res.json(reservations);
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar reserva por ID
app.get('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    const reservation = await db.get(`
      SELECT r.*, h.name as hotel_name, rt.name as room_type_name
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.id = ?
    `, [id]);
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    
    res.json(reservation);
  } catch (error) {
    console.error('Erro ao buscar reserva:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar reserva
app.post('/api/reservations', async (req, res) => {
  try {
    const {
      hotel_id, room_type_id, guest_name, guest_email, guest_phone,
      guest_document, check_in_date, check_out_date, number_of_guests,
      total_amount, special_requests, status = 'pending'
    } = req.body;
    
    const db = await getConnection();
    const result = await db.run(`
      INSERT INTO reservations (
        hotel_id, room_type_id, guest_name, guest_email, guest_phone,
        guest_document, check_in_date, check_out_date, number_of_guests,
        total_amount, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      hotel_id, room_type_id, guest_name, guest_email, guest_phone,
      guest_document, check_in_date, check_out_date, number_of_guests,
      total_amount, special_requests, status
    ]);
    
    const newReservation = await db.get(`
      SELECT r.*, h.name as hotel_name, rt.name as room_type_name
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.id = ?
    `, [result.lastID]);
    
    res.status(201).json(newReservation);
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar reserva completa
app.put('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      hotel_id, room_type_id, guest_name, guest_email, guest_phone,
      guest_document, check_in_date, check_out_date, number_of_guests,
      total_amount, special_requests, status
    } = req.body;
    
    const db = await getConnection();
    
    // Verificar se a reserva existe
    const existingReservation = await db.get('SELECT id FROM reservations WHERE id = ?', [id]);
    if (!existingReservation) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    
    // Validar status se fornecido
    if (status && !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    // Atualizar reserva
    await db.run(`
      UPDATE reservations SET 
        hotel_id = COALESCE(?, hotel_id),
        room_type_id = COALESCE(?, room_type_id),
        guest_name = COALESCE(?, guest_name),
        guest_email = COALESCE(?, guest_email),
        guest_phone = COALESCE(?, guest_phone),
        guest_document = COALESCE(?, guest_document),
        check_in_date = COALESCE(?, check_in_date),
        check_out_date = COALESCE(?, check_out_date),
        number_of_guests = COALESCE(?, number_of_guests),
        total_amount = COALESCE(?, total_amount),
        special_requests = COALESCE(?, special_requests),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      hotel_id, room_type_id, guest_name, guest_email, guest_phone,
      guest_document, check_in_date, check_out_date, number_of_guests,
      total_amount, special_requests, status, id
    ]);
    
    // Buscar reserva atualizada
    const updatedReservation = await db.get(`
      SELECT r.*, h.name as hotel_name, rt.name as room_type_name
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.id = ?
    `, [id]);
    
    res.json(updatedReservation);
  } catch (error) {
    console.error('Erro ao atualizar reserva:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar status da reserva
app.patch('/api/reservations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }
    
    const db = await getConnection();
    await db.run('UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    
    const updatedReservation = await db.get(`
      SELECT r.*, h.name as hotel_name, rt.name as room_type_name
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.id = ?
    `, [id]);
    
    if (!updatedReservation) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    
    res.json(updatedReservation);
  } catch (error) {
    console.error('Erro ao atualizar status da reserva:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para deletar hotel
app.delete('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    
    // Verificar se hotel existe
    const existingHotel = await db.get('SELECT id FROM hotels WHERE id = ?', [id]);
    if (!existingHotel) {
      return res.status(404).json({ error: 'Hotel não encontrado' });
    }
    
    // Verificar se há quartos associados
    const roomsCount = await db.get('SELECT COUNT(*) as count FROM room_types WHERE hotel_id = ?', [id]);
    if (roomsCount.count > 0) {
      return res.status(400).json({ error: 'Não é possível excluir hotel com quartos cadastrados. Exclua os quartos primeiro.' });
    }
    
    // Verificar se há reservas associadas
    const reservationsCount = await db.get('SELECT COUNT(*) as count FROM reservations WHERE hotel_id = ?', [id]);
    if (reservationsCount.count > 0) {
      return res.status(400).json({ error: 'Não é possível excluir hotel com reservas. Cancele as reservas primeiro.' });
    }
    
    // Deletar hotel
    await db.run('DELETE FROM hotels WHERE id = ?', [id]);
    
    console.log(`✅ Hotel ID ${id} deletado com sucesso`);
    res.json({ message: 'Hotel deletado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar hotel:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para deletar quarto
app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    
    // Verificar se quarto existe
    const existingRoom = await db.get('SELECT id FROM room_types WHERE id = ?', [id]);
    if (!existingRoom) {
      return res.status(404).json({ error: 'Quarto não encontrado' });
    }
    
    // Verificar se há reservas associadas
    const reservationsCount = await db.get('SELECT COUNT(*) as count FROM reservations WHERE room_type_id = ?', [id]);
    if (reservationsCount.count > 0) {
      return res.status(400).json({ error: 'Não é possível excluir quarto com reservas. Cancele as reservas primeiro.' });
    }
    
    // Deletar quarto
    await db.run('DELETE FROM room_types WHERE id = ?', [id]);
    
    console.log(`✅ Quarto ID ${id} deletado com sucesso`);
    res.json({ message: 'Quarto deletado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar quarto:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para deletar reserva
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getConnection();
    
    // Verificar se reserva existe
    const existingReservation = await db.get('SELECT id FROM reservations WHERE id = ?', [id]);
    if (!existingReservation) {
      return res.status(404).json({ error: 'Reserva não encontrada' });
    }
    
    // Deletar reserva
    await db.run('DELETE FROM reservations WHERE id = ?', [id]);
    
    console.log(`✅ Reserva ID ${id} deletada com sucesso`);
    res.json({ message: 'Reserva deletada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar reserva:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicializar servidor
async function startServer() {
  try {
    // Testar conexão com banco
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🏨 Hotéis: http://localhost:${PORT}/api/hotels`);
      console.log(`🛏️  Quartos: http://localhost:${PORT}/api/rooms`);
      console.log(`📅 Reservas: http://localhost:${PORT}/api/reservations`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();