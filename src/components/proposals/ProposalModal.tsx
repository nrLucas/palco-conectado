import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { mockDataManager, Proposal } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";

interface ProposalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetId: string;
  targetName: string;
  currentUserId: string;
  onProposalSent?: () => void;
}

export const ProposalModal = ({ 
  open, 
  onOpenChange, 
  targetId, 
  targetName, 
  currentUserId,
  onProposalSent 
}: ProposalModalProps) => {
  const [date, setDate] = useState<Date>();
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !message || !amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const proposal: Proposal = {
      id: `proposal-${Date.now()}`,
      fromId: currentUserId,
      toId: targetId,
      eventDate: date.toISOString(),
      message,
      amount: parseFloat(amount),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    mockDataManager.saveProposal(proposal);
    
    // Update user's proposal count
    const currentUser = mockDataManager.getCurrentUser();
    if (currentUser && currentUser.type === 'band') {
      const updatedUser = {
        ...currentUser,
        proposalsUsed: (currentUser.proposalsUsed || 0) + 1
      };
      mockDataManager.saveUser(updatedUser);
      mockDataManager.setCurrentUser(updatedUser);
    }

    toast({
      title: "Proposta enviada!",
      description: `Sua proposta foi enviada para ${targetName}`,
    });

    onProposalSent?.();
    onOpenChange(false);
    
    // Reset form
    setDate(undefined);
    setMessage("");
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Proposta</DialogTitle>
          <DialogDescription>
            Envie uma proposta para {targetName}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="date">Data do Evento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor Proposto (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="1500.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Conte mais sobre sua proposta, repertório planejado, equipamentos..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Enviar Proposta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};