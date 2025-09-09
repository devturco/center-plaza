// Serviço de API para comunicação com o backend SQLite

const API_BASE_URL = 'http://localhost:3001/api';

// Tipos para as entidades
export interface Hotel {
  id: number;
  name: string;
  description?: string;
  address?: string;
  location?: string; // Campo para compatibilidade com frontend
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RoomType {
  id: number;
  hotel_id: number;
  name: string;
  description?: string;
  capacity: number;
  price_per_night: number;
  amenities?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Reservation {
  id: number;
  hotel_id: number;
  room_type_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in_date: string;
  check_out_date: string;
  guests_count: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  special_requests?: string;
  created_at?: string;
  updated_at?: string;
}

// Classe de erro personalizada para API
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Função auxiliar para fazer requisições
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Serviços para Hotels
export const hotelService = {
  // Listar todos os hotéis
  async getAll(): Promise<Hotel[]> {
    return apiRequest<Hotel[]>('/hotels');
  },

  // Buscar hotel por ID
  async getById(id: number): Promise<Hotel> {
    return apiRequest<Hotel>(`/hotels/${id}`);
  },

  // Criar novo hotel
  async create(hotel: Omit<Hotel, 'id' | 'created_at' | 'updated_at'>): Promise<Hotel> {
    return apiRequest<Hotel>('/hotels', {
      method: 'POST',
      body: JSON.stringify(hotel),
    });
  },

  // Atualizar hotel
  async update(id: number, hotel: Partial<Omit<Hotel, 'id' | 'created_at' | 'updated_at'>>): Promise<Hotel> {
    return apiRequest<Hotel>(`/hotels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hotel),
    });
  },

  // Deletar hotel
  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/hotels/${id}`, {
      method: 'DELETE',
    });
  },
};

// Serviços para Room Types
export const roomService = {
  // Listar todos os tipos de quarto
  async getAll(): Promise<RoomType[]> {
    return apiRequest<RoomType[]>('/rooms');
  },

  // Buscar tipo de quarto por ID
  async getById(id: number): Promise<RoomType> {
    return apiRequest<RoomType>(`/rooms/${id}`);
  },

  // Buscar tipos de quarto por hotel
  async getByHotel(hotelId: number): Promise<RoomType[]> {
    return apiRequest<RoomType[]>(`/hotels/${hotelId}/rooms`);
  },

  // Criar novo tipo de quarto
  async create(room: Omit<RoomType, 'id' | 'created_at' | 'updated_at'>): Promise<RoomType> {
    return apiRequest<RoomType>('/rooms', {
      method: 'POST',
      body: JSON.stringify(room),
    });
  },

  // Atualizar tipo de quarto
  async update(id: number, room: Partial<Omit<RoomType, 'id' | 'created_at' | 'updated_at'>>): Promise<RoomType> {
    return apiRequest<RoomType>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(room),
    });
  },

  // Atualizar tipo de quarto com imagens
  async updateWithImages(id: number, room: Partial<Omit<RoomType, 'id' | 'created_at' | 'updated_at'>>, images: File[]): Promise<RoomType> {
    const formData = new FormData();
    
    // Adicionar dados do quarto diretamente no FormData
    Object.entries(room).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Adicionar imagens
    images.forEach((image) => {
      formData.append('images', image);
    });
    
    const url = `${API_BASE_URL}/rooms/${id}`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
      });
      
      if (!response.ok) {
        throw new ApiError(response.status, `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.room || data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Deletar tipo de quarto
  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/rooms/${id}`, {
      method: 'DELETE',
    });
  },
};

// Serviços para Reservations
export const reservationService = {
  // Listar todas as reservas
  async getAll(): Promise<Reservation[]> {
    return apiRequest<Reservation[]>('/reservations');
  },

  // Buscar reserva por ID
  async getById(id: number): Promise<Reservation> {
    return apiRequest<Reservation>(`/reservations/${id}`);
  },

  // Buscar reservas por email do hóspede
  async getByGuestEmail(email: string): Promise<Reservation[]> {
    return apiRequest<Reservation[]>(`/reservations?guest_email=${encodeURIComponent(email)}`);
  },

  // Buscar reserva por código e nome
  async getByCodeAndName(code: string, guestName: string): Promise<Reservation | null> {
    try {
      const reservations = await apiRequest<Reservation[]>(
        `/reservations?code=${encodeURIComponent(code)}&guest_name=${encodeURIComponent(guestName)}`
      );
      return reservations.length > 0 ? reservations[0] : null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Criar nova reserva
  async create(reservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>): Promise<Reservation> {
    return apiRequest<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservation),
    });
  },

  // Atualizar reserva
  async update(id: number, reservation: Partial<Omit<Reservation, 'id' | 'created_at' | 'updated_at'>>): Promise<Reservation> {
    return apiRequest<Reservation>(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reservation),
    });
  },

  // Atualizar status da reserva
  async updateStatus(id: number, status: Reservation['status']): Promise<Reservation> {
    return apiRequest<Reservation>(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Deletar reserva
  async delete(id: number): Promise<void> {
    return apiRequest<void>(`/reservations/${id}`, {
      method: 'DELETE',
    });
  },
};

// Serviço de health check
export const healthService = {
  async check(): Promise<{ status: string; timestamp: string }> {
    return apiRequest<{ status: string; timestamp: string }>('/health');
  },
};

// Exportar tudo como default também
export default {
  hotel: hotelService,
  room: roomService,
  reservation: reservationService,
  health: healthService,
  ApiError,
};