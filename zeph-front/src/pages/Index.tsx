import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DomainCard } from "@/components/DomainCard";
import { BuyDomainModal } from "@/components/BuyDomainModal";
import { Search, Filter, Zap } from "lucide-react";
import domainsData from "@/data/domains.json";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Available" | "Owned">("All");
  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser] = useState("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"); // Mock current user

  const filteredDomains = useMemo(() => {
    return domainsData.filter((domain) => {
      const matchesSearch = domain.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "All" || domain.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStatus]);

  const handleBuyDomain = (domain: any) => {
    setSelectedDomain(domain);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.1),transparent_50%)]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">On-Chain DevOps</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Zeph Domain Registry
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Decentralized domain management with blockchain-powered DevOps. 
              Own, deploy, and manage your Web3 infrastructure.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border text-foreground"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "All" ? "default" : "outline"}
                onClick={() => setFilterStatus("All")}
                className={filterStatus === "All" ? "bg-primary text-primary-foreground" : ""}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "Available" ? "default" : "outline"}
                onClick={() => setFilterStatus("Available")}
                className={filterStatus === "Available" ? "bg-primary text-primary-foreground" : ""}
              >
                Available
              </Button>
              <Button
                variant={filterStatus === "Owned" ? "default" : "outline"}
                onClick={() => setFilterStatus("Owned")}
                className={filterStatus === "Owned" ? "bg-primary text-primary-foreground" : ""}
              >
                Owned
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>
              Showing {filteredDomains.length} of {domainsData.length} domains
            </span>
          </div>
        </div>

        {/* Domain Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDomains.map((domain) => (
            <DomainCard
              key={domain.domainId}
              domain={domain}
              onBuy={handleBuyDomain}
              currentUser={currentUser}
            />
          ))}
        </div>

        {filteredDomains.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No domains found matching your criteria.</p>
          </div>
        )}
      </div>

      <BuyDomainModal
        domain={selectedDomain}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Index;
