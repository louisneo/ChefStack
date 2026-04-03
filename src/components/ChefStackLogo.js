import React from 'react';
import Svg, { Rect, G, Path, Ellipse, Circle } from 'react-native-svg';

/**
 * ChefStack SVG Logo — crisp at any resolution.
 * Reproduces the stacked plates with leaf design.
 * @param {number} size - Width and height of the logo
 * @param {boolean} withBackground - Show the rounded green square background
 */
export default function ChefStackLogo({ size = 120, withBackground = true, style }) {
  const s = size;
  const pad = s * 0.15;
  const innerSize = s - pad * 2;

  return (
    <Svg width={s} height={s} viewBox="0 0 512 512" style={style}>
      {/* Background circular to match homescreen icon */}
      {withBackground && (
        <Circle
          cx="256" cy="256" r="256"
          fill="#2D6A4F"
        />
      )}

      {/* Stack of plates (bottom to top) */}
      <G>
        {/* Bottom plate (5th - widest, at bottom) */}
        <Ellipse cx="256" cy="370" rx="135" ry="28" fill="rgba(255,255,255,0.5)" />
        <Ellipse cx="256" cy="365" rx="135" ry="28" fill="white" />

        {/* 4th plate */}
        <Ellipse cx="256" cy="330" rx="130" ry="26" fill="rgba(255,255,255,0.5)" />
        <Ellipse cx="256" cy="325" rx="130" ry="26" fill="white" />

        {/* 3rd plate */}
        <Ellipse cx="256" cy="290" rx="125" ry="24" fill="rgba(255,255,255,0.5)" />
        <Ellipse cx="256" cy="285" rx="125" ry="24" fill="white" />

        {/* 2nd plate */}
        <Ellipse cx="256" cy="250" rx="120" ry="22" fill="rgba(255,255,255,0.5)" />
        <Ellipse cx="256" cy="245" rx="120" ry="22" fill="white" />

        {/* Top plate (1st - topmost) */}
        <Ellipse cx="256" cy="215" rx="140" ry="30" fill="rgba(255,255,255,0.5)" />
        <Ellipse cx="256" cy="208" rx="140" ry="30" fill="white" />

        {/* Rim line on top plate */}
        <Ellipse cx="256" cy="208" rx="115" ry="20" fill="none" stroke="#2D6A4F" strokeWidth="3" />
      </G>

      {/* Leaves on top */}
      <G>
        {/* Left leaf */}
        <Path
          d="M240 195 Q220 155, 235 130 Q255 155, 240 195Z"
          fill="#4CAF50"
        />
        {/* Left leaf vein */}
        <Path
          d="M238 190 Q228 162, 236 138"
          fill="none"
          stroke="#388E3C"
          strokeWidth="2"
        />

        {/* Right leaf */}
        <Path
          d="M272 195 Q292 155, 277 130 Q257 155, 272 195Z"
          fill="#66BB6A"
        />
        {/* Right leaf vein */}
        <Path
          d="M274 190 Q284 162, 276 138"
          fill="none"
          stroke="#43A047"
          strokeWidth="2"
        />
      </G>
    </Svg>
  );
}
