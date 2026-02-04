import React from 'react';
import Svg, { Text, TSpan } from 'react-native-svg';

interface KynoTextLogoProps {
  size?: number;
  color?: string;
}

/**
 * Texte "KYNO" stylisé
 */
export const KynoTextLogo: React.FC<KynoTextLogoProps> = ({ 
  size = 120, 
  color = '#000000' 
}) => {
  const height = size * 0.4;
  
  return (
    <Svg width={size} height={height} viewBox="0 0 120 48">
      <Text
        x="60"
        y="40"
        textAnchor="middle"
        fontFamily="System"
        fontSize="42"
        fontWeight="900"
        fontStyle="italic"
        fill={color}
      >
        KYNO
      </Text>
    </Svg>
  );
};

export default KynoTextLogo;
