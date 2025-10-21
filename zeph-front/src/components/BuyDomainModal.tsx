import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Domain {
  domainId: number;
  name: string;
  price: string;
}

interface BuyDomainModalProps {
  domain: Domain | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BuyDomainModal = ({ domain, isOpen, onClose }: BuyDomainModalProps) => {
  const [buyerAddress, setBuyerAddress] = useState("");
  const [copied, setCopied] = useState(false);

  if (!domain) return null;

  const generatePayload = () => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    return {
      action: "BUY_DOMAIN",
      domainId: domain.domainId,
      buyer: buyerAddress || "0xUSER",
      timestamp: timestamp,
      price: domain.price,
    };
  };

  const handleCopyPayload = () => {
    const payload = JSON.stringify(generatePayload(), null, 2);
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Buy {domain.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your wallet address to purchase this domain for {domain.price}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="buyer-address" className="text-foreground">
              Your Wallet Address
            </Label>
            <Input
              id="buyer-address"
              placeholder="0x..."
              value={buyerAddress}
              onChange={(e) => setBuyerAddress(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Transaction Payload (JSON)</Label>
            <div className="relative">
              <pre className="p-4 bg-background rounded-lg border border-border text-xs overflow-auto max-h-48 text-foreground">
                {JSON.stringify(generatePayload(), null, 2)}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2"
                onClick={handleCopyPayload}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => {
              console.log("Buy Domain Payload:", generatePayload());
              onClose();
            }}
          >
            Confirm Purchase
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
