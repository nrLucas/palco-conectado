import { useState } from "react";
import { Plus, Building, Music, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/components/auth/AuthContext";
import { mockDataManager, Band, Establishment } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

export const Profile = () => {
  const { currentUser } = useAuth();
  const [userBands, setUserBands] = useState<Band[]>(() => 
    currentUser ? mockDataManager.getUserBands(currentUser.id) : []
  );
  const [userEstablishments, setUserEstablishments] = useState<Establishment[]>(() => 
    currentUser ? mockDataManager.getUserEstablishments(currentUser.id) : []
  );
  const [showBandModal, setShowBandModal] = useState(false);
  const [showEstablishmentModal, setShowEstablishmentModal] = useState(false);
  const [editingBand, setEditingBand] = useState<Band | null>(null);
  const [editingEstablishment, setEditingEstablishment] = useState<Establishment | null>(null);

  const [bandForm, setBandForm] = useState({
    name: "",
    genre: "",
    description: "",
    location: "",
    members: 1,
    priceRange: ""
  });

  const [establishmentForm, setEstablishmentForm] = useState({
    name: "",
    type: "",
    description: "",
    location: "",
    capacity: 50,
    averageBudget: ""
  });

  const handleCreateBand = () => {
    if (!currentUser) return;

    const newBand: Band = {
      id: `band-${Date.now()}`,
      userId: currentUser.id,
      ...bandForm,
      rating: 5.0,
      totalShows: 0
    };

    mockDataManager.saveBand(newBand);
    setUserBands([...userBands, newBand]);
    setShowBandModal(false);
    setBandForm({ name: "", genre: "", description: "", location: "", members: 1, priceRange: "" });
    
    toast({
      title: "Banda criada!",
      description: "Sua banda foi adicionada ao perfil"
    });
  };

  const handleCreateEstablishment = () => {
    if (!currentUser) return;

    const newEstablishment: Establishment = {
      id: `est-${Date.now()}`,
      userId: currentUser.id,
      ...establishmentForm,
      rating: 5.0,
      totalEvents: 0
    };

    mockDataManager.saveEstablishment(newEstablishment);
    setUserEstablishments([...userEstablishments, newEstablishment]);
    setShowEstablishmentModal(false);
    setEstablishmentForm({ name: "", type: "", description: "", location: "", capacity: 50, averageBudget: "" });
    
    toast({
      title: "Estabelecimento criado!",
      description: "Seu estabelecimento foi adicionado ao perfil"
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Faça login para acessar seu perfil</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas bandas e estabelecimentos</p>
        </div>

        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <p className="font-medium">{currentUser.name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="font-medium">{currentUser.email}</p>
              </div>
              <div>
                <Label>Plano</Label>
                <p className="font-medium capitalize">{currentUser.subscriptionPlan}</p>
              </div>
              <div>
                <Label>Propostas Utilizadas</Label>
                <p className="font-medium">{currentUser.proposalsUsed || 0} / {currentUser.proposalsLimit || 2}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bandas */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Minhas Bandas
              </CardTitle>
              <CardDescription>Gerencie suas bandas e perfis musicais</CardDescription>
            </div>
            <Button onClick={() => setShowBandModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Banda
            </Button>
          </CardHeader>
          <CardContent>
            {userBands.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma banda cadastrada</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userBands.map((band) => (
                  <Card key={band.id} className="relative">
                    <CardHeader>
                      <CardTitle className="text-lg">{band.name}</CardTitle>
                      <CardDescription>{band.genre}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{band.location}</p>
                      <p className="text-sm">{band.priceRange}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-muted-foreground">★ {band.rating}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estabelecimentos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Meus Estabelecimentos
              </CardTitle>
              <CardDescription>Gerencie seus locais e espaços para eventos</CardDescription>
            </div>
            <Button onClick={() => setShowEstablishmentModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Estabelecimento
            </Button>
          </CardHeader>
          <CardContent>
            {userEstablishments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum estabelecimento cadastrado</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userEstablishments.map((establishment) => (
                  <Card key={establishment.id} className="relative">
                    <CardHeader>
                      <CardTitle className="text-lg">{establishment.name}</CardTitle>
                      <CardDescription>{establishment.type}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{establishment.location}</p>
                      <p className="text-sm">Capacidade: {establishment.capacity} pessoas</p>
                      <p className="text-sm">{establishment.averageBudget}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-muted-foreground">★ {establishment.rating}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Nova Banda */}
        <Dialog open={showBandModal} onOpenChange={setShowBandModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Banda</DialogTitle>
              <DialogDescription>Adicione uma nova banda ao seu perfil</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="band-name">Nome da Banda</Label>
                <Input
                  id="band-name"
                  value={bandForm.name}
                  onChange={(e) => setBandForm({...bandForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="band-genre">Gênero Musical</Label>
                <Select value={bandForm.genre} onValueChange={(value) => setBandForm({...bandForm, genre: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                    <SelectItem value="eletronica">Eletrônica</SelectItem>
                    <SelectItem value="sertanejo">Sertanejo</SelectItem>
                    <SelectItem value="mpb">MPB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="band-description">Descrição</Label>
                <Textarea
                  id="band-description"
                  value={bandForm.description}
                  onChange={(e) => setBandForm({...bandForm, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="band-location">Localização</Label>
                <Input
                  id="band-location"
                  value={bandForm.location}
                  onChange={(e) => setBandForm({...bandForm, location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="band-members">Número de Membros</Label>
                <Input
                  id="band-members"
                  type="number"
                  min="1"
                  value={bandForm.members}
                  onChange={(e) => setBandForm({...bandForm, members: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="band-price">Faixa de Preço</Label>
                <Input
                  id="band-price"
                  placeholder="R$ 1.000 - R$ 3.000"
                  value={bandForm.priceRange}
                  onChange={(e) => setBandForm({...bandForm, priceRange: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBandModal(false)}>Cancelar</Button>
              <Button onClick={handleCreateBand}>Criar Banda</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Novo Estabelecimento */}
        <Dialog open={showEstablishmentModal} onOpenChange={setShowEstablishmentModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Estabelecimento</DialogTitle>
              <DialogDescription>Adicione um novo estabelecimento ao seu perfil</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="est-name">Nome do Estabelecimento</Label>
                <Input
                  id="est-name"
                  value={establishmentForm.name}
                  onChange={(e) => setEstablishmentForm({...establishmentForm, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="est-type">Tipo</Label>
                <Select value={establishmentForm.type} onValueChange={(value) => setEstablishmentForm({...establishmentForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="restaurante">Restaurante</SelectItem>
                    <SelectItem value="casa-de-show">Casa de Show</SelectItem>
                    <SelectItem value="cafe">Café</SelectItem>
                    <SelectItem value="centro-cultural">Centro Cultural</SelectItem>
                    <SelectItem value="evento-privado">Evento Privado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="est-description">Descrição</Label>
                <Textarea
                  id="est-description"
                  value={establishmentForm.description}
                  onChange={(e) => setEstablishmentForm({...establishmentForm, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="est-location">Localização</Label>
                <Input
                  id="est-location"
                  value={establishmentForm.location}
                  onChange={(e) => setEstablishmentForm({...establishmentForm, location: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="est-capacity">Capacidade</Label>
                <Input
                  id="est-capacity"
                  type="number"
                  min="1"
                  value={establishmentForm.capacity}
                  onChange={(e) => setEstablishmentForm({...establishmentForm, capacity: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label htmlFor="est-budget">Orçamento Médio</Label>
                <Input
                  id="est-budget"
                  placeholder="R$ 1.000 - R$ 5.000"
                  value={establishmentForm.averageBudget}
                  onChange={(e) => setEstablishmentForm({...establishmentForm, averageBudget: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEstablishmentModal(false)}>Cancelar</Button>
              <Button onClick={handleCreateEstablishment}>Criar Estabelecimento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};