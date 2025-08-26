import express from 'express';
import multer from 'multer';

// Configuração do multer para upload de imagens
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
    }
  }
});

const router = express.Router();

// GET /api/rooms - Buscar todos os tipos de quartos
router.get('/', async (req, res) => {
  try {
    const { hotel_id } = req.query;
    
    let query = `
      SELECT rt.*, h.name as hotel_name 
      FROM room_types rt 
      LEFT JOIN hotels h ON rt.hotel_id = h.id
    `;
    let params = [];
    
    if (hotel_id) {
      query += ' WHERE rt.hotel_id = ?';
      params.push(hotel_id);
    }
    
    query += ' ORDER BY rt.created_at DESC';
    
    const [rows] = await req.db.execute(query, params);
    
    // Buscar imagens para cada tipo de quarto
    for (let room of rows) {
      const [images] = await req.db.execute(
        'SELECT * FROM room_images WHERE room_type_id = ? ORDER BY display_order',
        [room.id]
      );
      room.images = images;
    }
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar quartos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar quartos',
      message: error.message 
    });
  }
});

// GET /api/rooms/:id - Buscar tipo de quarto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await req.db.execute(
      `SELECT rt.*, h.name as hotel_name 
       FROM room_types rt 
       LEFT JOIN hotels h ON rt.hotel_id = h.id 
       WHERE rt.id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Tipo de quarto não encontrado' 
      });
    }
    
    const room = rows[0];
    
    // Buscar imagens
    const [images] = await req.db.execute(
      'SELECT * FROM room_images WHERE room_type_id = ? ORDER BY display_order',
      [id]
    );
    room.images = images;
    
    res.json(room);
  } catch (error) {
    console.error('Erro ao buscar quarto:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar quarto',
      message: error.message 
    });
  }
});

// POST /api/rooms - Criar novo tipo de quarto
router.post('/', upload.array('images', 10), async (req, res) => {
  const connection = await req.db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const {
      hotel_id,
      name,
      description,
      size_sqm,
      bed_type,
      bed_count,
      max_occupancy,
      amenities,
      bathroom_type,
      smoking_allowed,
      price_per_night
    } = req.body;

    // Validação básica
    if (!hotel_id || !name) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Campos obrigatórios: hotel_id, name' 
      });
    }

    // Verificar se hotel existe
    const [hotelExists] = await connection.execute(
      'SELECT id FROM hotels WHERE id = ?',
      [hotel_id]
    );
    
    if (hotelExists.length === 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Hotel não encontrado' 
      });
    }

    // Inserir tipo de quarto
    const [result] = await connection.execute(
      `INSERT INTO room_types (
        hotel_id, name, description, size_sqm, bed_type, bed_count,
        max_occupancy, amenities, bathroom_type, smoking_allowed,
        price_per_night, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        hotel_id,
        name,
        description || null,
        size_sqm || null,
        bed_type || null,
        bed_count || 1,
        max_occupancy || 2,
        JSON.stringify(amenities || []),
        bathroom_type || null,
        smoking_allowed === 'true' || smoking_allowed === true ? 1 : 0,
        price_per_night || null
      ]
    );

    const roomTypeId = result.insertId;
    
    // Processar imagens se enviadas
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const imageData = file.buffer.toString('base64');
        
        await connection.execute(
          `INSERT INTO room_images (
            room_type_id, image_data, image_type, display_order, created_at
          ) VALUES (?, ?, ?, ?, NOW())`,
          [roomTypeId, imageData, file.mimetype, i + 1]
        );
      }
    }
    
    await connection.commit();
    
    // Buscar o quarto criado com imagens
    const [newRoom] = await req.db.execute(
      `SELECT rt.*, h.name as hotel_name 
       FROM room_types rt 
       LEFT JOIN hotels h ON rt.hotel_id = h.id 
       WHERE rt.id = ?`,
      [roomTypeId]
    );
    
    const [images] = await req.db.execute(
      'SELECT * FROM room_images WHERE room_type_id = ? ORDER BY display_order',
      [roomTypeId]
    );
    newRoom[0].images = images;

    res.status(201).json({
      message: 'Tipo de quarto criado com sucesso',
      room: newRoom[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar quarto:', error);
    res.status(500).json({ 
      error: 'Erro ao criar quarto',
      message: error.message 
    });
  } finally {
    connection.release();
  }
});

// PUT /api/rooms/:id - Atualizar tipo de quarto
router.put('/:id', upload.array('images', 10), async (req, res) => {
  const connection = await req.db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const {
      name,
      description,
      size_sqm,
      bed_type,
      bed_count,
      max_occupancy,
      amenities,
      bathroom_type,
      smoking_allowed,
      price_per_night,
      remove_images
    } = req.body;

    // Verificar se quarto existe
    const [existing] = await connection.execute(
      'SELECT id FROM room_types WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        error: 'Tipo de quarto não encontrado' 
      });
    }

    // Atualizar tipo de quarto
    await connection.execute(
      `UPDATE room_types SET 
        name = ?, description = ?, size_sqm = ?, bed_type = ?, bed_count = ?,
        max_occupancy = ?, amenities = ?, bathroom_type = ?, smoking_allowed = ?,
        price_per_night = ?, updated_at = NOW()
      WHERE id = ?`,
      [
        name,
        description || null,
        size_sqm || null,
        bed_type || null,
        bed_count || 1,
        max_occupancy || 2,
        JSON.stringify(amenities || []),
        bathroom_type || null,
        smoking_allowed === 'true' || smoking_allowed === true ? 1 : 0,
        price_per_night || null,
        id
      ]
    );
    
    // Remover imagens específicas se solicitado
    if (remove_images && Array.isArray(remove_images)) {
      for (const imageId of remove_images) {
        await connection.execute(
          'DELETE FROM room_images WHERE id = ? AND room_type_id = ?',
          [imageId, id]
        );
      }
    }
    
    // Adicionar novas imagens se enviadas
    if (req.files && req.files.length > 0) {
      // Buscar próximo display_order
      const [maxOrder] = await connection.execute(
        'SELECT COALESCE(MAX(display_order), 0) as max_order FROM room_images WHERE room_type_id = ?',
        [id]
      );
      
      let nextOrder = maxOrder[0].max_order + 1;
      
      for (const file of req.files) {
        const imageData = file.buffer.toString('base64');
        
        await connection.execute(
          `INSERT INTO room_images (
            room_type_id, image_data, image_type, display_order, created_at
          ) VALUES (?, ?, ?, ?, NOW())`,
          [id, imageData, file.mimetype, nextOrder++]
        );
      }
    }
    
    await connection.commit();
    
    // Buscar o quarto atualizado com imagens
    const [updatedRoom] = await req.db.execute(
      `SELECT rt.*, h.name as hotel_name 
       FROM room_types rt 
       LEFT JOIN hotels h ON rt.hotel_id = h.id 
       WHERE rt.id = ?`,
      [id]
    );
    
    const [images] = await req.db.execute(
      'SELECT * FROM room_images WHERE room_type_id = ? ORDER BY display_order',
      [id]
    );
    updatedRoom[0].images = images;

    res.json({
      message: 'Tipo de quarto atualizado com sucesso',
      room: updatedRoom[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao atualizar quarto:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar quarto',
      message: error.message 
    });
  } finally {
    connection.release();
  }
});

// DELETE /api/rooms/:id - Deletar tipo de quarto
router.delete('/:id', async (req, res) => {
  const connection = await req.db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    
    // Verificar se quarto existe
    const [existing] = await connection.execute(
      'SELECT id FROM room_types WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        error: 'Tipo de quarto não encontrado' 
      });
    }

    // Deletar imagens primeiro
    await connection.execute(
      'DELETE FROM room_images WHERE room_type_id = ?',
      [id]
    );
    
    // Deletar tipo de quarto
    await connection.execute(
      'DELETE FROM room_types WHERE id = ?',
      [id]
    );
    
    await connection.commit();

    res.json({ 
      message: 'Tipo de quarto deletado com sucesso' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao deletar quarto:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar quarto',
      message: error.message 
    });
  } finally {
    connection.release();
  }
});

// DELETE /api/rooms/:id/images/:imageId - Deletar imagem específica
router.delete('/:id/images/:imageId', async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    // Verificar se imagem existe e pertence ao quarto
    const [existing] = await req.db.execute(
      'SELECT id FROM room_images WHERE id = ? AND room_type_id = ?',
      [imageId, id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        error: 'Imagem não encontrada' 
      });
    }

    await req.db.execute(
      'DELETE FROM room_images WHERE id = ? AND room_type_id = ?',
      [imageId, id]
    );

    res.json({ 
      message: 'Imagem deletada com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar imagem',
      message: error.message 
    });
  }
});

export default router;