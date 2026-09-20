import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { NetworkGraph } from '../features/network/NetworkGraph';
import { getNetworkData } from '../api/network';
import { NetworkGraphData, NetworkFilter } from '../types/network';
import { Button } from '../components/ui/Button';
import { RefreshCw, Share2 } from 'lucide-react';

export const FraudNetworkPage: React.FC = () => {
  const [networkData, setNetworkData] = useState<NetworkGraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNetwork = async (filters?: NetworkFilter) => {
    setIsLoading(true);
    try {
      const data = await getNetworkData(filters);
      setNetworkData(data);
    } catch {
      // Backend not connected yet: null data to trigger empty state
      setNetworkData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Fraud Linkage Network"
        description="Multi-hop entity resolution connecting customers, shared devices, proxies, and transaction clusters"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Fraud Network' },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNetwork()}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync Graph
          </Button>
        }
      />

      {/* Network Visualization Container */}
      <NetworkGraph
        data={networkData}
        isLoading={isLoading}
        onFilterChange={(filters) => fetchNetwork(filters)}
      />
    </div>
  );
};
