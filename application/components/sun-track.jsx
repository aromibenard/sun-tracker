'use client'

import { useEffect, useRef, useState } from "react"

const parseTimeString = (timeString) => {
  const date = new Date()
  const [time, modifier] = timeString.split(" ")
  let [hours, minutes, seconds] = time.split(":")

  // Convert hours to 24-hour format
  if (modifier === "PM" && hours !== "12") {
  hours = parseInt(hours, 10) + 12;
  } else if (modifier === "AM" && hours === "12") {
  hours = "0"; // Midnight case
  }

  date.setHours(hours, minutes, seconds)
  return date
}

export default function SunTracker({latitude, longitude, sunset, sunrise}) {
    const [error, setError] = useState(null)

    const sunRise = sunrise ? parseTimeString(sunrise): null
    const sunSet = sunset ? parseTimeString(sunset) : null

    const canvasRef = useRef(null)

    useEffect(() => {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.width = 800
      canvas.height = 500

      // Gradient background for sky
      const drawSky = (percentageOfDay) => {
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        
        // Adjust gradient based on time of day
        if (percentageOfDay < 0.5) { // Morning to noon (brighter sky)
          gradient.addColorStop(0, '#87CEEB'); // Sky blue
          gradient.addColorStop(1, '#FFD700'); // Light golden yellow
        } else { // Afternoon to sunset (darker sky)
          gradient.addColorStop(0, '#FFA500'); // Orange at the top
          gradient.addColorStop(1, '#2E3192'); // Dark blue at the bottom
        }
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height); // Fill background with gradient
      }

       // Draw the sun with a glowing effect
      const drawSun = (xPosition, yPosition) => {
        drawSky(xPosition / canvas.width); // Update sky background

        context.fillStyle = 'yellow';
        const radius = 30;
        
        // Create radial gradient for glowing sun
        const gradient = context.createRadialGradient(xPosition, yPosition, 10, xPosition, yPosition, radius);
        gradient.addColorStop(0, '#FFD700'); // Bright yellow center
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0.5)'); // Glowing edges

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(xPosition, yPosition, radius, 0, Math.PI * 2); // Draw sun
        context.fill();

        // Draw the times for sunrise and sunset
        context.fillStyle = 'black';
        context.font = '18px Arial';
        context.fillText(`Sunrise: ${sunrise}`, 20, canvas.height - 20); // Sunrise text (bottom left)
        context.fillText(`Sunset: ${sunset}`, canvas.width - 150, canvas.height - 20); // Sunset text (bottom right)
      };

      const calculateSunPosition = (currentTime) => {
        if (!sunRise || !sunSet) return { x: 0, y: canvas.height / 2 }; // Default position if times are not available
  
        const dayLength = sunSet - sunRise; // Total daylight in milliseconds
        const timeSinceSunrise = currentTime - sunRise; // Time since sunrise
  
        const totalWidth = canvas.width; // Total width of the canvas
        const percentageOfDay = timeSinceSunrise / dayLength; // Percentage of day passed
  
        // X Position: Map percentage of the day to the canvas width
        const xPosition = percentageOfDay * totalWidth;
  
        // Y Position: Create an arch using a sine function
        const peakHeight = 120; // Peak height of the sun at noon
        const yPosition = canvas.height / 2 - Math.sin(Math.PI * percentageOfDay) * peakHeight; // Sine curve for arc
  
        return { x: Math.max(0, Math.min(xPosition, totalWidth)), y: yPosition }; // Bound X within canvas
      };

      const updateSunPosition = () => {
        const currentTime = new Date(); // Get the current time
        const { x, y } = calculateSunPosition(currentTime); // Get sun position
        drawSun(x, y); // Draw sun at calculated position
      };

      const interval = setInterval(updateSunPosition, 1000)

      return () => clearInterval(interval)
    }, [sunRise, sunSet])

    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      {error && <p>{error}</p>}
      {!error && (
        <>
          <canvas ref={canvasRef} style={{ border: '1px solid black', marginBottom: '20px', borderRadius: '10px' }} />
        </>
      )}
    </div>
    )
}