import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Reservation {
  id: string;
  accommodationId: number;
  accommodationName: string;
  accommodationImage: string;
  location: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  guestName: string;
  email: string;
  phone: string;
  document: string;
  specialRequests?: string;
  paymentMethod: string;
  status: 'confirmada' | 'pendente' | 'cancelada';
  paymentStatus: 'pago' | 'pendente' | 'estornado';
  createdAt: string;
  amenities: string[];
}

interface ReservationContextType {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => string;
  getReservation: (id: string) => Reservation | undefined;
  getReservationById: (id: string) => Reservation | undefined;
  getReservationByCodeAndName: (code: string, lastName: string) => Reservation | undefined;
  getUserReservations: (userEmail: string) => Reservation[];
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  updatePaymentStatus: (id: string, paymentStatus: Reservation['paymentStatus']) => void;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

const STORAGE_KEY = 'center_plaza_reservations';

export const ReservationProvider = ({ children }: { children: ReactNode }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Carregar reservas do localStorage na inicialização
  useEffect(() => {
    const savedReservations = localStorage.getItem(STORAGE_KEY);
    if (savedReservations) {
      try {
        const parsed = JSON.parse(savedReservations);
        setReservations(parsed);
      } catch (error) {
        console.error('Erro ao carregar reservas do localStorage:', error);
        // Se houver erro, inicializar com array vazio
        setReservations([]);
      }
    }
  }, []);

  // Salvar reservas no localStorage sempre que houver mudanças
  useEffect(() => {
    if (reservations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    }
  }, [reservations]);

  const addReservation = (reservationData: Omit<Reservation, 'id' | 'createdAt'>): string => {
    const newId = `RS${Date.now().toString().slice(-6)}`;
    const newReservation: Reservation = {
      ...reservationData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setReservations(prev => [...prev, newReservation]);
    return newId;
  };

  const getReservation = (id: string): Reservation | undefined => {
    return reservations.find(reservation => reservation.id === id);
  };

  const getReservationById = (id: string): Reservation | undefined => {
    return reservations.find(reservation => reservation.id === id);
  };

  const getReservationByCodeAndName = (code: string, lastName: string): Reservation | undefined => {
    return reservations.find(reservation => {
      const reservationLastName = reservation.guestName.split(' ').pop()?.toLowerCase();
      return reservation.id.toLowerCase() === code.toLowerCase() && 
             reservationLastName === lastName.toLowerCase();
    });
  };

  const getUserReservations = (userEmail: string): Reservation[] => {
    return reservations.filter(reservation => 
      reservation.email.toLowerCase() === userEmail.toLowerCase()
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const updateReservationStatus = (id: string, status: Reservation['status']) => {
    setReservations(prev => 
      prev.map(reservation => 
        reservation.id === id ? { ...reservation, status } : reservation
      )
    );
  };

  const updatePaymentStatus = (id: string, paymentStatus: Reservation['paymentStatus']) => {
    setReservations(prev => 
      prev.map(reservation => 
        reservation.id === id ? { ...reservation, paymentStatus } : reservation
      )
    );
  };

  const value: ReservationContextType = {
    reservations,
    addReservation,
    getReservation,
    getReservationById,
    getReservationByCodeAndName,
    getUserReservations,
    updateReservationStatus,
    updatePaymentStatus,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservations = () => {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
};