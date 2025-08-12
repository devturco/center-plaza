import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Home,
  Calendar,
  BarChart3,
  TrendingUp,
  ArrowLeft,
  Upload,
  MapPin,
  Users,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminHospedagens = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const accommodations = [
    {
      id: 1,
      name: "Chalé das Montanhas",
      location: "Serra da Mantiqueira",
      maxGuests: 6,
      price: 320,
      status: "ativo",
      bookings: 12,
      rating: 4.9,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Casa de Vidro",
      location: "Vale Encantado", 
      maxGuests: 4,
      price: 450,
      status: "ativo",
      bookings: 8,
      rating: 4.8,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Refúgio de Pedra",
      location: "Picos da Serra",
      maxGuests: 8,
      price: 380,
      status: "manutenção",
      bookings: 15,
      rating: 4.9,
      image: "/placeholder.svg"
    }
  ];

  const filteredAccommodations = accommodations.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Gerenciar Hospedagens</h1>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Hospedagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Hospedagem</DialogTitle>
                <DialogDescription>
                  Adicione uma nova propriedade ao seu catálogo
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Hospedagem</Label>
                    <Input id="name" placeholder="Ex: Chalé das Montanhas" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input id="location" placeholder="Ex: Serra da Mantiqueira" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxGuests">Máx. Hóspedes</Label>
                    <Input id="maxGuests" type="number" placeholder="6" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço/Noite (R$)</Label>
                    <Input id="price" type="number" placeholder="320" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rooms">Quartos</Label>
                    <Input id="rooms" type="number" placeholder="3" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" placeholder="Descreva a hospedagem..." rows={3} />
                </div>

                <div className="space-y-2">
                  <Label>Imagens</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Clique para fazer upload ou arraste as imagens</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Hospedagem</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
            <Button variant="default" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Hospedagens
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/admin/reservas")}>
              <Calendar className="mr-2 h-4 w-4" />
              Reservas
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/admin/relatorios")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Search */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar hospedagens..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{accommodations.length}</p>
                    </div>
                    <Home className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ativas</p>
                      <p className="text-2xl font-bold text-green-600">
                        {accommodations.filter(a => a.status === "ativo").length}
                      </p>
                    </div>
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="h-3 w-3 bg-green-600 rounded-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ocupação Média</p>
                      <p className="text-2xl font-bold">78%</p>
                    </div>
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avaliação Média</p>
                      <p className="text-2xl font-bold">4.9</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500 fill-current" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Accommodations List */}
            <Card>
              <CardHeader>
                <CardTitle>Hospedagens ({filteredAccommodations.length})</CardTitle>
                <CardDescription>Gerencie suas propriedades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAccommodations.map((accommodation) => (
                    <div key={accommodation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg"></div>
                        <div>
                          <h3 className="font-semibold">{accommodation.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {accommodation.location}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {accommodation.maxGuests} hóspedes
                            </span>
                            <span className="text-sm">R$ {accommodation.price}/noite</span>
                            <Badge variant={accommodation.status === "ativo" ? "default" : "secondary"}>
                              {accommodation.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHospedagens;