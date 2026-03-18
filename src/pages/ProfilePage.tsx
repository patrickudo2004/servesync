import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { VolunteerProfile } from '../components/VolunteerProfile';

export const ProfilePage: React.FC = () => {
  const me = useQuery(api.users.me);

  if (!me) return null;

  return (
    <div style={{ paddingBottom: '80px' }}>
      <VolunteerProfile userId={me._id} />
    </div>
  );
};
