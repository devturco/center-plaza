import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { 
  Bed,
  Home, 
  Calendar, 
  BarChart3, 
  TrendingUp,
  ArrowLeft,
  Wifi,
  Car,
  Users,
  Clock,
  Building,
  Snowflake,
  Tv,
  Refrigerator,
  Phone,
  Shirt,
  Bath,
  Toilet,
  Droplets,
  FileText,
  Upload,
  X,
  Plus,
  Save
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Hotel {
  id?: number;
  name: string;
  address: string;
  amenities: string[];
}

interface Room {
  id?: number;
  hotel_id?: number;
  name: string;
  size: number;
  bedType: string;
  bedCount: number;
  description: string;
  amenities: string[];
  bathroomFeatures: string[];
  smokingPolicy: string;
  images: File[];
  imageUrls?: string[];
  rating: number;
  reviewCount: number;
}

const API_BASE_URL = 'http://localhost:3001/api';

const AdminCriarQuartos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hotel");
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingHotel, setIsSavingHotel] = useState(false);
  const [isSavingRoom, setIsSavingRoom] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Hotel state
  const [hotel, setHotel] = useState<Hotel>({
    name: "Center Plaza Hotel",
    address: "Rua Maestro Cardim, 418, Bela Vista, São Paulo, CEP 01323-000, Brasil",
    amenities: []
  });

  // Room state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room>({
    name: "",
    size: 0,
    bedType: "",
    bedCount: 0,
    description: "",
    amenities: [],
    bathroomFeatures: [],
    smokingPolicy: "Não é permitido fumar",
    images: [],
    rating: 6.4,
    reviewCount: 540
  });

  const hotelAmenities = [
    { id: "wifi", label: "Wi-Fi gratuito", icon: Wifi },
    { id: "parking", label: "Estacionamento privativo", icon: Car },
    { id: "family", label: "Quartos para famílias", icon: Users },
    { id: "reception", label: "Recepção 24 horas", icon: Clock },
    { id: "elevator", label: "Elevador", icon: Building },
    { id: "ac", label: "Ar-condicionado", icon: Snowflake }
  ];

  const roomAmenities = [
    { id: "ac", label: "Ar-condicionado", icon: Snowflake },
    { id: "tv", label: "TV de tela plana", icon: Tv },
    { id: "fridge", label: "Frigobar", icon: Refrigerator },
    { id: "wifi", label: "WiFi Gratuito", icon: Wifi },
    { id: "phone", label: "Telefone", icon: Phone },
    { id: "cable", label: "Canais a cabo", icon: Tv },
    { id: "wardrobe", label: "Guarda-roupa ou armário", icon: Shirt }
  ];

  const bathroomFeatures = [
    { id: "additional", label: "Banheiro adicional" },
    { id: "toilet", label: "Vaso sanitário" },
    { id: "shower", label: "Banheira ou chuveiro" },
    { id: "paper", label: "Papel higiênico" }
  ];

  const roomTypes = [
    { id: "individual", name: "Quarto Individual", defaultSize: 25, bedType: "solteiro", bedCount: 1 },
    { id: "duplo", name: "Quarto Duplo", defaultSize: 30, bedType: "casal grande", bedCount: 1 },
    { id: "twin", name: "Quarto com 2 Camas de Solteiro", defaultSize: 28, bedType: "solteiro", bedCount: 2 },
    { id: "triplo", name: "Quarto Triplo", defaultSize: 35, bedType: "solteiro", bedCount: 3 },
    { id: "triplo-standard", name: "Quarto Triplo Standard", defaultSize: 38, bedType: "misto", bedCount: 2 }
  ];

  // Load existing data on component mount
  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      setIsLoadingData(true);
      
      // Load hotels
      const hotelsResponse = await fetch(`${API_BASE_URL}/hotels`);
      if (hotelsResponse.ok) {
        const hotelsData = await hotelsResponse.json();
        if (hotelsData.length > 0) {
          const existingHotel = hotelsData[0];
          setHotel({
            id: existingHotel.id,
            name: existingHotel.name,
            address: existingHotel.address,
            amenities: existingHotel.amenities ? existingHotel.amenities.split(',') : []
          });
          
          // Load rooms for this hotel
          const roomsResponse = await fetch(`${API_BASE_URL}/rooms?hotel_id=${existingHotel.id}`);
          if (roomsResponse.ok) {
            const roomsData = await roomsResponse.json();
            const formattedRooms = roomsData.map((room: any) => ({
              id: room.id,
              hotel_id: room.hotel_id,
              name: room.name,
              size: room.size,
              bedType: room.bed_type,
              bedCount: room.bed_count,
              description: room.description,
              amenities: room.amenities ? room.amenities.split(',') : [],
              bathroomFeatures: room.bathroom_features ? room.bathroom_features.split(',') : [],
              smokingPolicy: room.smoking_policy || "Não é permitido fumar",
              images: [],
              imageUrls: room.images || [],
              rating: 6.4,
              reviewCount: 540
            }));
            setRooms(formattedRooms);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados existentes.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleHotelAmenityToggle = (amenityId: string) => {
    setHotel(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleRoomAmenityToggle = (amenityId: string) => {
    setCurrentRoom(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handleBathroomFeatureToggle = (featureId: string) => {
    setCurrentRoom(prev => ({
      ...prev,
      bathroomFeatures: prev.bathroomFeatures.includes(featureId)
        ? prev.bathroomFeatures.filter(id => id !== featureId)
        : [...prev.bathroomFeatures, featureId]
    }));
  };

  const handleRoomTypeSelect = (typeId: string) => {
    const roomType = roomTypes.find(type => type.id === typeId);
    if (roomType) {
      setCurrentRoom(prev => ({
        ...prev,
        name: roomType.name,
        size: roomType.defaultSize,
        bedType: roomType.bedType,
        bedCount: roomType.bedCount
      }));
    }
  };

  const handleSaveRoom = async () => {
    if (!currentRoom.name || !currentRoom.size) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (!hotel.id) {
      toast({
        title: "Erro",
        description: "Por favor, salve os dados do hotel primeiro.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSavingRoom(true);
      
      const formData = new FormData();
      formData.append('hotel_id', hotel.id.toString());
      formData.append('name', currentRoom.name);
      formData.append('size', currentRoom.size.toString());
      formData.append('bed_type', currentRoom.bedType);
      formData.append('bed_count', currentRoom.bedCount.toString());
      formData.append('description', currentRoom.description);
      formData.append('amenities', currentRoom.amenities.join(','));
      formData.append('bathroom_features', currentRoom.bathroomFeatures.join(','));
      formData.append('smoking_policy', currentRoom.smokingPolicy);
      
      // Add images
      currentRoom.images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar quarto');
      }

      const savedRoom = await response.json();
      
      // Update rooms list
      const newRoom = {
        id: savedRoom.id,
        hotel_id: hotel.id,
        name: currentRoom.name,
        size: currentRoom.size,
        bedType: currentRoom.bedType,
        bedCount: currentRoom.bedCount,
        description: currentRoom.description,
        amenities: currentRoom.amenities,
        bathroomFeatures: currentRoom.bathroomFeatures,
        smokingPolicy: currentRoom.smokingPolicy,
        images: [],
        imageUrls: savedRoom.images || [],
        rating: 6.4,
        reviewCount: 540
      };

      setRooms(prev => [...prev, newRoom]);

      toast({
        title: "Sucesso",
        description: "Quarto salvo com sucesso!"
      });

      // Reset form
      setCurrentRoom({
        name: "",
        size: 0,
        bedType: "",
        bedCount: 0,
        description: "",
        amenities: [],
        bathroomFeatures: [],
        smokingPolicy: "Não é permitido fumar",
        images: [],
        rating: 6.4,
        reviewCount: 540
      });
    } catch (error) {
      console.error('Erro ao salvar quarto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar quarto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSavingRoom(false);
    }
  };

  const handleSaveHotel = async () => {
    if (!hotel.name || !hotel.address) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos do hotel.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSavingHotel(true);
      
      const hotelData = {
        name: hotel.name,
        address: hotel.address,
        amenities: hotel.amenities.join(',')
      };

      const method = hotel.id ? 'PUT' : 'POST';
      const url = hotel.id ? `${API_BASE_URL}/hotels/${hotel.id}` : `${API_BASE_URL}/hotels`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hotelData)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar hotel');
      }

      const savedHotel = await response.json();
      
      setHotel(prev => ({
        ...prev,
        id: savedHotel.id || prev.id
      }));
      
      toast({
        title: "Sucesso",
        description: "Dados do hotel salvos com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar hotel:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados do hotel. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSavingHotel(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setCurrentRoom(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setCurrentRoom(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Criar Quartos</h1>
          </div>
          
          <Button onClick={handleSaveHotel} disabled={isSavingHotel} className="gap-2">
            {isSavingHotel ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSavingHotel ? 'Salvando...' : 'Salvar Dados'}
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-background/95 h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/admin/dashboard")}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/admin/hospedagens")}>
              <Home className="mr-2 h-4 w-4" />
              Hospedagens
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/admin/reservas")}>
              <Calendar className="mr-2 h-4 w-4" />
              Reservas
            </Button>
            <Button variant="default" className="w-full justify-start">
              <Bed className="mr-2 h-4 w-4" />
              Criar Quartos
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/admin/relatorios")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hotel">Dados do Hotel</TabsTrigger>
              <TabsTrigger value="quartos">Cadastrar Quartos</TabsTrigger>
            </TabsList>

            <TabsContent value="hotel" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Hotel</CardTitle>
                  <CardDescription>Configure os dados básicos do Center Plaza Hotel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="hotel-name">Nome do Hotel</Label>
                      <Input
                        id="hotel-name"
                        value={hotel.name}
                        onChange={(e) => setHotel(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="hotel-address">Endereço</Label>
                      <Textarea
                        id="hotel-address"
                        value={hotel.address}
                        onChange={(e) => setHotel(prev => ({ ...prev, address: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-semibold">Principais Comodidades</Label>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {hotelAmenities.map((amenity) => {
                        const Icon = amenity.icon;
                        const isSelected = hotel.amenities.includes(amenity.id);
                        
                        return (
                          <div
                            key={amenity.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleHotelAmenityToggle(amenity.id)}
                          >
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleHotelAmenityToggle(amenity.id)}
                            />
                            <Icon className="h-5 w-5 text-primary" />
                            <span className="text-sm">{amenity.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quartos" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Room Form */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cadastrar Novo Quarto</CardTitle>
                    <CardDescription>Selecione um tipo de quarto e configure os detalhes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Tipo de Quarto</Label>
                      <Select onValueChange={handleRoomTypeSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de quarto" />
                        </SelectTrigger>
                        <SelectContent>
                          {roomTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {currentRoom.name && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="room-name">Nome do Quarto</Label>
                            <Input
                              id="room-name"
                              value={currentRoom.name}
                              onChange={(e) => setCurrentRoom(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="room-size">Tamanho (m²)</Label>
                            <Input
                              id="room-size"
                              type="number"
                              value={currentRoom.size}
                              onChange={(e) => setCurrentRoom(prev => ({ ...prev, size: Number(e.target.value) }))}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="bed-type">Tipo de Cama</Label>
                            <Input
                              id="bed-type"
                              value={currentRoom.bedType}
                              onChange={(e) => setCurrentRoom(prev => ({ ...prev, bedType: e.target.value }))}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="bed-count">Quantidade de Camas</Label>
                            <Input
                              id="bed-count"
                              type="number"
                              value={currentRoom.bedCount}
                              onChange={(e) => setCurrentRoom(prev => ({ ...prev, bedCount: Number(e.target.value) }))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="room-description">Descrição</Label>
                          <Textarea
                            id="room-description"
                            value={currentRoom.description}
                            onChange={(e) => setCurrentRoom(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            placeholder="Descreva as características do quarto..."
                          />
                        </div>

                        <div>
                          <Label className="text-base font-semibold">Comodidades do Quarto</Label>
                          <div className="grid grid-cols-1 gap-2 mt-4">
                            {roomAmenities.map((amenity) => {
                              const Icon = amenity.icon;
                              const isSelected = currentRoom.amenities.includes(amenity.id);
                              
                              return (
                                <div
                                  key={amenity.id}
                                  className={`flex items-center space-x-3 p-2 rounded border cursor-pointer transition-colors ${
                                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => handleRoomAmenityToggle(amenity.id)}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() => handleRoomAmenityToggle(amenity.id)}
                                  />
                                  <Icon className="h-4 w-4 text-primary" />
                                  <span className="text-sm">{amenity.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <Label className="text-base font-semibold">Características do Banheiro</Label>
                          <div className="grid grid-cols-1 gap-2 mt-4">
                            {bathroomFeatures.map((feature) => {
                              const isSelected = currentRoom.bathroomFeatures.includes(feature.id);
                              
                              return (
                                <div
                                  key={feature.id}
                                  className={`flex items-center space-x-3 p-2 rounded border cursor-pointer transition-colors ${
                                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => handleBathroomFeatureToggle(feature.id)}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onChange={() => handleBathroomFeatureToggle(feature.id)}
                                  />
                                  <span className="text-sm">{feature.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="smoking-policy">Política de Fumantes</Label>
                          <Select
                            value={currentRoom.smokingPolicy}
                            onValueChange={(value) => setCurrentRoom(prev => ({ ...prev, smokingPolicy: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Não é permitido fumar">Não é permitido fumar</SelectItem>
                              <SelectItem value="Permitido fumar">Permitido fumar</SelectItem>
                              <SelectItem value="Área designada para fumantes">Área designada para fumantes</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Galeria de Imagens</Label>
                          <div className="mt-2">
                            <Input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="mb-4"
                            />
                            
                            {currentRoom.images.length > 0 && (
                              <div className="grid grid-cols-3 gap-2">
                                {currentRoom.images.map((image, index) => (
                                  <div key={index} className="relative">
                                    <img
                                      src={URL.createObjectURL(image)}
                                      alt={`Quarto ${index + 1}`}
                                      className="w-full h-20 object-cover rounded border"
                                    />
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      className="absolute -top-2 -right-2 h-6 w-6"
                                      onClick={() => removeImage(index)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <Button onClick={handleSaveRoom} disabled={isSavingRoom} className="w-full">
                          {isSavingRoom ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="mr-2 h-4 w-4" />
                          )}
                          {isSavingRoom ? 'Salvando...' : 'Salvar Quarto'}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Saved Rooms */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quartos Cadastrados</CardTitle>
                    <CardDescription>Lista de quartos já configurados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {rooms.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Nenhum quarto cadastrado ainda.</p>
                    ) : (
                      <div className="space-y-4">
                        {rooms.map((room) => (
                          <div key={room.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{room.name}</h4>
                              <Badge variant="outline">{room.size} m²</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {room.bedCount} {room.bedType === 'misto' ? 'camas (misto)' : `cama(s) de ${room.bedType}`}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {room.amenities.slice(0, 3).map((amenityId) => {
                                const amenity = roomAmenities.find(a => a.id === amenityId);
                                return amenity ? (
                                  <Badge key={amenityId} variant="secondary" className="text-xs">
                                    {amenity.label}
                                  </Badge>
                                ) : null;
                              })}
                              {room.amenities.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{room.amenities.length - 3} mais
                                </Badge>
                              )}
                            </div>
                            {room.imageUrls && room.imageUrls.length > 0 && (
                              <div className="grid grid-cols-4 gap-2 mt-2">
                                {room.imageUrls.slice(0, 4).map((imageUrl, imgIndex) => (
                                  <img
                                    key={imgIndex}
                                    src={`${API_BASE_URL}${imageUrl}`}
                                    alt={`${room.name} ${imgIndex + 1}`}
                                    className="w-full h-16 object-cover rounded border"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminCriarQuartos;