import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccommodationCard from "@/components/AccommodationCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Users, Star } from "lucide-react";
import accommodation1 from "@/assets/accommodation-1.jpg";
import accommodation2 from "@/assets/accommodation-2.jpg";
import accommodation3 from "@/assets/accommodation-3.jpg";

const Hospedagens = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGuests, setSelectedGuests] = useState("");

  const accommodations = [
    {
      id: 1,
      name: "Chalé das Montanhas",
      image: accommodation1,
      location: "Serra da Mantiqueira",
      rating: 4.9,
      reviewCount: 42,
      price: 320,
      maxGuests: 6,
      amenities: ["wifi", "estacionamento", "cafe"],
      featured: true,
    },
    {
      id: 2,
      name: "Casa de Vidro",
      image: accommodation2,
      location: "Vale Encantado",
      rating: 4.8,
      reviewCount: 28,
      price: 450,
      maxGuests: 4,
      amenities: ["wifi", "estacionamento"],
      featured: false,
    },
    {
      id: 3,
      name: "Refúgio de Pedra",
      image: accommodation3,
      location: "Picos da Serra",
      rating: 4.9,
      reviewCount: 56,
      price: 380,
      maxGuests: 8,
      amenities: ["wifi", "estacionamento", "cafe"],
      featured: true,
    },
    {
      id: 4,
      name: "Vila dos Pássaros",
      image: accommodation1,
      location: "Mata Atlântica",
      rating: 4.7,
      reviewCount: 33,
      price: 280,
      maxGuests: 4,
      amenities: ["wifi", "cafe"],
      featured: false,
    },
    {
      id: 5,
      name: "Loft Panorâmico",
      image: accommodation2,
      location: "Mirante da Serra",
      rating: 4.8,
      reviewCount: 41,
      price: 420,
      maxGuests: 2,
      amenities: ["wifi", "estacionamento"],
      featured: false,
    },
    {
      id: 6,
      name: "Casa do Lago",
      image: accommodation3,
      location: "Lagoa Serena",
      rating: 4.9,
      reviewCount: 67,
      price: 550,
      maxGuests: 10,
      amenities: ["wifi", "estacionamento", "cafe"],
      featured: true,
    },
  ];

  const filteredAccommodations = accommodations.filter(accommodation => {
    const matchesSearch = accommodation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         accommodation.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGuests = selectedGuests === "" || accommodation.maxGuests >= parseInt(selectedGuests);
    return matchesSearch && matchesGuests;
  });

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-primary-light py-20">
          <div className="container mx-auto px-4 text-center text-primary-foreground">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Nossas Hospedagens
            </h1>
            <p className="text-xl max-w-2xl mx-auto">
              Encontre a acomodação perfeita para sua experiência na serra
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-secondary/30 sticky top-20 z-40 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou localização..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <select
                    className="pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground"
                    value={selectedGuests}
                    onChange={(e) => setSelectedGuests(e.target.value)}
                  >
                    <option value="">Qualquer quantidade</option>
                    <option value="2">2+ hóspedes</option>
                    <option value="4">4+ hóspedes</option>
                    <option value="6">6+ hóspedes</option>
                    <option value="8">8+ hóspedes</option>
                  </select>
                </div>
                
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <p className="text-muted-foreground">
                {filteredAccommodations.length} hospedagem(ns) encontrada(s)
              </p>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                <select className="border border-input rounded-md px-3 py-1 bg-background text-foreground">
                  <option>Destaque</option>
                  <option>Menor Preço</option>
                  <option>Maior Preço</option>
                  <option>Melhor Avaliação</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAccommodations.map((accommodation, index) => (
                <div
                  key={accommodation.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <AccommodationCard {...accommodation} />
                </div>
              ))}
            </div>

            {filteredAccommodations.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhuma hospedagem encontrada</h3>
                <p className="text-muted-foreground">
                  Tente ajustar seus filtros de busca para encontrar mais opções.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Hospedagens;