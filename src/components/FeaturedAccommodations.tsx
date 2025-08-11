import { Button } from "@/components/ui/button";
import AccommodationCard from "./AccommodationCard";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import accommodation1 from "@/assets/accommodation-1.jpg";
import accommodation2 from "@/assets/accommodation-2.jpg";
import accommodation3 from "@/assets/accommodation-3.jpg";

const FeaturedAccommodations = () => {
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
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Hospedagens em{" "}
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Destaque
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Descubra nossas acomodações mais procuradas, cada uma oferecendo 
            uma experiência única em meio à natureza exuberante da serra.
          </p>
        </div>

        {/* Accommodation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {accommodations.map((accommodation, index) => (
            <div
              key={accommodation.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <AccommodationCard {...accommodation} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="hero" size="lg" asChild>
            <Link to="/hospedagens">
              Ver Todas as Hospedagens
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedAccommodations;