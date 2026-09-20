import React from 'react';
import { Badge } from '../ui/Badge';
import { RiskLevel } from '../../types/transaction';

export interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showDot = true,
  size = 'md',
}) => {
  const variantMap: Record<RiskLevel, 'low' | 'medium' | 'high'> = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  };

  const labelMap: Record<RiskLevel, string> = {
    LOW: 'LOW RISK',
    MEDIUM: 'MED RISK',
    HIGH: 'HIGH RISK',
  };

  return (
    <Badge variant={variantMap[level]} size={size} dot={showDot}>
      {score !== undefined ? `${labelMap[level]} (${score})` : labelMap[level]}
    </Badge>
  );
};
