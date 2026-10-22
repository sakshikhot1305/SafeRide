import React from 'react';

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'navy', // navy, sky, success, warning
}) => {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-content">
        <span className="stat-label">{title}</span>
        <span className="stat-value">{value ?? '--'}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
      {Icon && (
        <div className="stat-icon">
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
