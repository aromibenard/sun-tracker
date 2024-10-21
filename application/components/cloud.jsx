import React from 'react';

export const Cloud = ({ position, size }) => {
  const cloudStyle = {
    animation: `moveClouds ${Math.random() * 50 + 150}s linear infinite`,
  };

  // Generate cloud shapes using circles for a "fluffy" effect
  const generateCloudShape = () => (
    <>
      <circle cx="20" cy="30" r="20" fill="white" />
      <circle cx="50" cy="20" r="30" fill="white" />
      <circle cx="80" cy="30" r="25" fill="white" />
      <circle cx="50" cy="40" r="35" fill="white" />
    </>
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 80" // Adjusted viewbox to fit cloud shape
      width={size} // Cloud size passed dynamically
      height={size * 0.67} // Maintain aspect ratio for cloud shape
      style={cloudStyle}
    >
      <g
        transform={`translate(${200 + position * 5}, ${
          300 - Math.sin((position / 100) * Math.PI) * 200
        })`} // Position along the sun's arc
      >
        {generateCloudShape()} {/* Render cloud shape */}
      </g>
    </svg>
  );
};

