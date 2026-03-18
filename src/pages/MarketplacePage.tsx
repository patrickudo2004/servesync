import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ShiftSwapMarketplace } from '../components/ShiftSwapMarketplace';

export const MarketplacePage: React.FC = () => {
  const me = useQuery(api.users.me);

  if (!me) return null;

  return (
    <div style={{ paddingBottom: '80px' }}>
      <ShiftSwapMarketplace 
        churchId={me.churchId!} 
        userSubunit={me.subunit} 
      />
    </div>
  );
};
