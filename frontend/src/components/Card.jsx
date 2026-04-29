import React from 'react';

const Card = ({ children, title, subtitle, icon: Icon, extra, className = "" }) => {
  return (
    <div className={`glass-card p-6 flex flex-col relative overflow-hidden group ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            {Icon && <Icon size={14} className="text-accent-green" />}
            {title}
          </h3>
          {subtitle && (
            <p className="text-xl font-bold mt-1 text-white leading-tight">
              {subtitle}
            </p>
          )}
        </div>
        {extra && <div className="relative z-10">{extra}</div>}
      </div>

      {/* Content */}
      <div className="flex-1 relative z-10">
        {children}
      </div>

      {/* Subtle Gradient Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 blur-3xl -z-10 group-hover:bg-accent-green/10 transition-colors" />
    </div>
  );
};

export default Card;
