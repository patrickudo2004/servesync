import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { HallOfFame } from '../components/HallOfFame';

export const HallOfFamePage: React.FC = () => {
  const me = useQuery(api.users.me);

  if (!me) return null;

  return (
    <div style={{ paddingBottom: '80px' }}>
      <HallOfFame churchId={me.churchId!} />
    </div>
  );
};
