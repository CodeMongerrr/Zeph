import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Globe, User, Shield } from "lucide-react";

interface Domain {
  domainId: number;
  name: string;
  owner: string;
  price: string;
  status: string;
  tokenContract: string;
  opsContract: string;
}

interface DomainCardProps {
  domain: Domain;
  onBuy: (domain: Domain) => void;
  currentUser?: string;
}

export const DomainCard = ({ domain, onBuy, currentUser }: DomainCardProps) => {
  const navigate = useNavigate();
  const isOwned = domain.status === "Owned";
  const isCurrentUserOwner = currentUser && domain.owner.toLowerCase() === currentUser.toLowerCase();

  const handleCardClick = () => {
    if (isCurrentUserOwner) {
      navigate(`/dashboard/${domain.domainId}`);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card 
      className={`group relative overflow-hidden border-border bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] ${isCurrentUserOwner ? 'cursor-pointer' : ''}`}
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">{domain.name}</h3>
          </div>
          <Badge 
            variant={isOwned ? "secondary" : "default"}
            className={isOwned ? "bg-secondary/50" : "bg-primary/20 text-primary"}
          >
            {domain.status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Owner: {truncateAddress(domain.owner)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Price: {domain.price}</span>
          </div>
        </div>

        {!isOwned && (
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              onBuy(domain);
            }}
          >
            Buy Domain
          </Button>
        )}

        {isCurrentUserOwner && (
          <Button 
            variant="secondary"
            className="w-full font-medium"
          >
            Manage Domain →
          </Button>
        )}
      </div>
    </Card>
  );
};
