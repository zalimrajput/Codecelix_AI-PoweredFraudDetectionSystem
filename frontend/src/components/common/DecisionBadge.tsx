import React from 'react';
import { Badge } from '../ui/Badge';
import { TransactionDecision } from '../../types/transaction';
import { CheckCircle2, Clock, Ban } from 'lucide-react';

export interface DecisionBadgeProps {
  decision: TransactionDecision;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({
  decision,
  size = 'md',
  showIcon = true,
}) => {
  const config = {
    APPROVED: {
      variant: 'low' as const,
      label: 'APPROVED',
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />,
    },
    REVIEW: {
      variant: 'medium' as const,
      label: 'IN REVIEW',
      icon: <Clock className="w-3 h-3 mr-1" />,
    },
    BLOCKED: {
      variant: 'high' as const,
      label: 'BLOCKED',
      icon: <Ban className="w-3 h-3 mr-1" />,
    },
  };

  const item = config[decision] || config.REVIEW;

  return (
    <Badge variant={item.variant} size={size}>
      <span className="flex items-center">
        {showIcon && item.icon}
        {item.label}
      </span>
    </Badge>
  );
};
