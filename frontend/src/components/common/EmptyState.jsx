import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  action = null,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={28} />
      </div>
      <h4>{title}</h4>
      <p>{description}</p>
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;
