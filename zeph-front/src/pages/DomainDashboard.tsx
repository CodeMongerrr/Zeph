import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe, Play, Pause, Upload, Settings, Copy, Check, ExternalLink } from "lucide-react";
import domainsData from "@/data/domains.json";
import eventsData from "@/data/events.json";

const DomainDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [newOwner, setNewOwner] = useState("");

  const domain = domainsData.find((d) => d.domainId === Number(id));
  const domainEvents = eventsData.find((e) => e.domainId === Number(id))?.events || [];

  if (!domain) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Domain not found</h1>
          <Button onClick={() => navigate("/")}>Back to Registry</Button>
        </div>
      </div>
    );
  }

  const copyPayload = (payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateActionPayload = (action: string, additionalData: any = {}) => {
    return {
      action,
      domainId: domain.domainId,
      timestamp: Math.floor(Date.now() / 1000).toString(),
      ...additionalData,
    };
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <Globe className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{domain.name}</h1>
                <p className="text-sm text-muted-foreground">Domain ID: {domain.domainId}</p>
              </div>
            </div>
            <Badge variant={domain.paused ? "destructive" : "default"} className="h-fit">
              {domain.paused ? "Paused" : "Active"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metadata Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Domain Metadata</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Owner</p>
              <p className="text-foreground font-mono">{truncateAddress(domain.owner)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Token Contract</p>
              <p className="text-foreground font-mono">{truncateAddress(domain.tokenContract)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ops Contract</p>
              <p className="text-foreground font-mono">{truncateAddress(domain.opsContract)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Version</p>
              <p className="text-foreground font-semibold">v{domain.version}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Landing Hash</p>
              <p className="text-foreground font-mono text-xs">{domain.landingHash || "Not set"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Private Hash</p>
              <p className="text-foreground font-mono text-xs">{domain.privateHash || "Not set"}</p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="devops" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
            <TabsTrigger value="devops">DevOps</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="token">Token Info</TabsTrigger>
          </TabsList>

          {/* DevOps Actions Tab */}
          <TabsContent value="devops" className="space-y-4">
            <Card className="p-6 bg-card/50 border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">DevOps Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    const payload = generateActionPayload("DEPLOY_SITE", {
                      versionHash: "0xHASH" + Date.now(),
                      uri: "ipfs://newhash" + Date.now(),
                    });
                    console.log("Deploy Payload:", payload);
                    copyPayload(payload);
                  }}
                >
                  <Upload className="h-4 w-4" />
                  Deploy Site
                </Button>

                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => {
                    const payload = generateActionPayload("PAUSE_SITE");
                    console.log("Pause Payload:", payload);
                    copyPayload(payload);
                  }}
                >
                  <Pause className="h-4 w-4" />
                  Pause Site
                </Button>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    const payload = generateActionPayload("RESUME_SITE");
                    console.log("Resume Payload:", payload);
                    copyPayload(payload);
                  }}
                >
                  <Play className="h-4 w-4" />
                  Resume Site
                </Button>

                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    const payload = generateActionPayload("UPDATE_CONFIG", {
                      configHash: "0xCONFIG" + Date.now(),
                    });
                    console.log("Update Config Payload:", payload);
                    copyPayload(payload);
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Update Config
                </Button>
              </div>
              {copied && (
                <p className="mt-4 text-sm text-primary flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Payload copied to clipboard!
                </p>
              )}
            </Card>
          </TabsContent>

          {/* Access & Ownership Tab */}
          <TabsContent value="access" className="space-y-4">
            <Card className="p-6 bg-card/50 border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Transfer Ownership</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-owner" className="text-foreground">New Owner Address</Label>
                  <Input
                    id="new-owner"
                    placeholder="0x..."
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="bg-background border-border text-foreground mt-2"
                  />
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => {
                    const payload = generateActionPayload("TRANSFER_DOMAIN", {
                      newOwner: newOwner || "0xNEWOWNER",
                    });
                    console.log("Transfer Payload:", payload);
                    copyPayload(payload);
                  }}
                >
                  Transfer Domain
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Access Management</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const payload = generateActionPayload("GRANT_ACCESS", {
                      grantTo: "0xUSERTOGRANT",
                    });
                    console.log("Grant Access Payload:", payload);
                    copyPayload(payload);
                  }}
                >
                  Grant Access
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const payload = generateActionPayload("REVOKE_ACCESS", {
                      revokeFrom: "0xUSERTOREVOKE",
                    });
                    console.log("Revoke Access Payload:", payload);
                    copyPayload(payload);
                  }}
                >
                  Revoke Access
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="p-6 bg-card/50 border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Event History</h3>
              {domainEvents.length > 0 ? (
                <div className="space-y-4">
                  {domainEvents.map((event, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-primary pl-4 pb-4 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {event.event}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-1">{event.details}</p>
                      <p className="text-xs text-muted-foreground">
                        By: {truncateAddress(event.by)} • Version: {event.version}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No events recorded yet.</p>
              )}
            </Card>
          </TabsContent>

          {/* Token Info Tab */}
          <TabsContent value="token" className="space-y-4">
            <Card className="p-6 bg-card/50 border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Token Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Supply</p>
                    <p className="text-foreground text-2xl font-bold">1</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Current Holders</p>
                    <p className="text-foreground text-2xl font-bold">1</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Contract Address</p>
                  <div className="flex items-center gap-2">
                    <code className="text-foreground font-mono text-sm bg-background px-3 py-2 rounded border border-border flex-1">
                      {domain.tokenContract}
                    </code>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DomainDashboard;
