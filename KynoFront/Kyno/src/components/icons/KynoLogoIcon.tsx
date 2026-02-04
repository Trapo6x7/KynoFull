import React from 'react';
import Svg, { Circle, Path, G } from 'react-native-svg';

interface KynoLogoIconProps {
  size?: number;
}

/**
 * Logo des deux chiens qui s'enlacent (noir et blanc)
 */
export const KynoLogoIcon: React.FC<KynoLogoIconProps> = ({ size = 200 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {/* Cercle de fond rose */}
      <Circle cx="100" cy="100" r="95" fill="#F8BBD9" />
      
      {/* Chien blanc (gauche) */}
      <G>
        {/* Corps */}
        <Path
          d="M60 70 C40 70, 30 90, 35 110 C40 130, 55 145, 80 145 C95 145, 105 135, 100 120 L100 100 C100 85, 85 70, 60 70"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Oreille */}
        <Path
          d="M45 60 C35 45, 50 35, 60 50 C65 58, 55 65, 45 60"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Museau */}
        <Circle cx="50" cy="95" r="8" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        {/* Nez */}
        <Circle cx="42" cy="93" r="4" fill="#000000" />
        {/* Œil */}
        <Circle cx="55" cy="80" r="3" fill="#000000" />
        {/* Bras qui enlace */}
        <Path
          d="M95 110 C110 105, 120 115, 115 130 C112 140, 100 145, 90 140"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2"
        />
      </G>
      
      {/* Chien noir (droite) */}
      <G>
        {/* Corps */}
        <Path
          d="M140 70 C160 70, 170 90, 165 110 C160 130, 145 145, 120 145 C105 145, 95 135, 100 120 L100 100 C100 85, 115 70, 140 70"
          fill="#000000"
        />
        {/* Oreille */}
        <Path
          d="M155 60 C165 45, 150 35, 140 50 C135 58, 145 65, 155 60"
          fill="#000000"
        />
        {/* Museau */}
        <Circle cx="150" cy="95" r="8" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        {/* Nez */}
        <Circle cx="158" cy="93" r="4" fill="#000000" />
        {/* Œil */}
        <Circle cx="145" cy="80" r="3" fill="#FFFFFF" />
        {/* Bras qui enlace */}
        <Path
          d="M105 110 C90 105, 80 115, 85 130 C88 140, 100 145, 110 140"
          fill="#000000"
        />
      </G>
    </Svg>
  );
};

export default KynoLogoIcon;
