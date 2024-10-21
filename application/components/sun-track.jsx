'use client'

import { useCallback, useEffect, useState }  from "react"
import {Cloud} from "./cloud"

function getUserCoordinates() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          resolve({ latitude, longitude })
        },
        (error) => {
          reject(error)
        }
      )
    } else {
      reject(new Error("Geolocation is not supported by this browser."))
    }
  })
}

async function getSunriseAndSunset() {
  const coords =  await getUserCoordinates()
  const { latitude: lat, longitude: lng } = coords
 
  const results = await fetch(`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}`)
  const data = await results.json()

  const {sunrise, sunset } = data.results
  return {
    sunrise,
    sunset
  }
}

const parseTimeString = (timeString) => {
  const [time, modifier] = timeString.split(' ')
  let [hours, minutes, seconds] = time.split(':')

  // Convert to 24-hour format
  if (modifier === 'PM' && hours !== '12') hours = parseInt(hours, 10) + 12
  if (modifier === 'AM' && hours === '12') hours = '00'

  const date = new Date()
  date.setHours(hours, minutes, seconds)
  return date
}

function formatTime(isoString) {
  const date = new Date(isoString)
 
  let hours = date.getHours()
  let minutes = date.getMinutes()
  
  hours = hours.toString().padStart(2, '0'); // Ensures two digits for hours
  minutes = minutes.toString().padStart(2, '0'); 

  return `${hours}:${minutes}`
}

export default function SunTracker() {
  const [sunPosition, setSunPosition] = useState(0)
  const [isDaytime, setIsDayTime] = useState(true)
  const [sunrise, setSunRise] = useState(null)
  const [sunset, setSunSet] = useState(null)
  const [clientSunrise, setClientSunrise] = useState(null)
  const [clientSunset, setClientSunset] = useState(null)

  const generateCloud = (position, size) => (
    <g
      transform={`translate(${200 + position * 5}, ${
        300 - Math.sin((position / 100) * Math.PI) * 200
      })`}
    >
      {/* Cloud shapes using circles */}
      <circle cx="20" cy="30" r={size * 0.2} fill="white" />
      <circle cx="50" cy="20" r={size * 0.3} fill="white" />
      <circle cx="80" cy="30" r={size * 0.25} fill="white" />
      <circle cx="50" cy="40" r={size * 0.35} fill="white" />
    </g>
  )

  const updateSunPosition = useCallback (() => {
    if (!sunrise || !sunset) return
    const now = new Date()

    const nowhrs = now.getHours()
    const nowmin = now.getMinutes()
    const nowsec = now.getSeconds()
    const nowSeconds = (nowhrs * 3600) + (nowmin * 60) + nowsec

    const hrs = sunrise.getHours()
    const min = sunrise.getMinutes()
    const sec = sunrise.getSeconds()
    const sunriseSeconds = (hrs * 3600) + (min * 60) + sec

    const sethrs = sunset.getHours()
    const setmin = sunset.getMinutes()
    const setsec = sunset.getSeconds()
    const sunsetSeconds = (sethrs * 3600) + (setmin * 60) + setsec

    const dayLength = sunsetSeconds - sunriseSeconds
    
    // Time from sunset today to next sunrise
    const nightLength = (24 * 3600 - sunsetSeconds) + sunriseSeconds

    let position = 0 

    if (nowSeconds >= sunsetSeconds || nowSeconds < sunriseSeconds) { // night
      const elapsedTime = (nowSeconds >= sunsetSeconds) ? nowSeconds - sunsetSeconds 
      : (nowSeconds + 24 * 3600) - sunsetSeconds; // After midnight

      position = Math.min(Math.max(0, (elapsedTime / nightLength ) * 100), 100)
    } else if (nowSeconds >= sunriseSeconds && nowSeconds <= sunsetSeconds) { // day
      const elapsedDayTime = nowSeconds - sunriseSeconds // Time since sunrise
      position = Math.min(Math.max(0, (elapsedDayTime / dayLength) * 100), 100);
    }
    console.log(position)
    setSunPosition(position)
    setIsDayTime(nowSeconds >= sunriseSeconds && nowSeconds <= sunsetSeconds )
  }, [sunrise, sunset])
  

  useEffect(() => {
    const fetchData = async () => {
      const sunData = await getSunriseAndSunset()
      if (sunData) {
        let { sunrise, sunset } = sunData
        sunrise = sunrise ? parseTimeString(sunrise) : null
        sunset = sunset ? parseTimeString(sunset) : null
        setSunRise(sunrise)
        setSunSet(sunset)
        setClientSunrise(formatTime(sunrise));
        setClientSunset(formatTime(sunset))
      }
    }
    fetchData()    
  }, [])

  useEffect(() => {
    if (sunrise && sunset) {
      const interval = setInterval(updateSunPosition, 3500)
      return () => clearInterval(interval)
    }
  }, [sunrise, sunset, updateSunPosition])

    return (
     <div className="flex flex-col items-center py-5 w-full">
      <svg className="w-full h-96">
        
        {/* sky gradient */}
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: isDaytime ? '#87CEEB' : '#0A0A2A', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: isDaytime ? '#FFD700' : '#1A1A5E', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Sun Glow */}
        <defs>
          <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: 'yellow', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'orange', stopOpacity: 0.3 }} />
          </radialGradient>
        </defs>

        {/* Moon Glow */}
        <defs>
          <radialGradient id="moonGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: 'lightgray', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'darkgray', stopOpacity: 0.6 }} />
          </radialGradient>
        </defs>

        {/*sun shadow */}
        <defs>
          <filter id="sunShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="4" dy="4" stdDeviation="10" floodColor="rgba(0,0,0,0.5)" />
          </filter>
        </defs>

        {/*sun core */}
        <defs>
          <radialGradient id="sunCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style={{ stopColor: '#FFFFE0', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          </radialGradient>
        </defs>

        {/* Sky background */}
        <rect width="100%" height="100%" fill="url(#skyGradient)" />

        {/* Ground/Horizon */}
        <rect x="0" y="300" width="100%" height="100" fill="#39FF14" />

         {/* Stars */}
         {!isDaytime && (
          <>
            <circle cx="200" cy="100" r="2" fill="white" />
            <circle cx="400" cy="80" r="3" fill="white" />
            <circle cx="600" cy="50" r="2" fill="white" />
            <circle cx="800" cy="150" r="1.5" fill="white" />
            <circle cx="900" cy="120" r="2.5" fill="white" />
          </>
        )}

        {/* Sun or Moon */}
        {isDaytime ? (
          <g>
            <circle
              cx={`${200 + (sunPosition * 5)}`}
              cy={300 - Math.sin((sunPosition / 100) * Math.PI ) * 200} //arching curve
              r="25"
              fill="url(#sunGradient)"
              stroke="orange"
              strokeWidth="6"
              filter="url(#sunShadow)"
            />

            <circle
              cx={`${200 + (sunPosition * 5)}`}
              cy={300 - Math.sin((sunPosition / 100) * Math.PI ) * 200}
              r="30"
              fill="url(#sunCore)"
            />
          </g>
        ) : (
          // moon 
          <circle
            cx={`${200 + (sunPosition * 5)}`}
            cy={300 - Math.sin((sunPosition / 100) * Math.PI ) * 200} // Moon curve
            r="20"
            fill="url(#moonGradient)"
            stroke="gray"
            strokeWidth="3"
          />
        )}
 
        {/* Sunrise and sunset labels */}
        <text x="180" y="320" className=" fill-slate-800 font-medium">Sunrise: {clientSunrise}</text>
        <text x="700" y="320" className=" fill-slate-800 font-medium">Sunset: {clientSunset}</text>

        {/* Current Time Label */}
        <text
          x={`${200 + (sunPosition * 5)}`}
          y={300 - Math.sin((sunPosition / 100) * Math.PI) * 200 - 34}// Above the sun/moon
          fontSize="14"
          fill="white"
          textAnchor="middle"
        >
          Now 
          {` ( ${(sunPosition.toFixed(2))}% )`}
        </text>
      </svg>
     
      {/* <style jsx>{`
        .cloud {
          animation: moveClouds 200s linear infinite;
        }

        @keyframes moveClouds {
          0% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style> */}

     </div>
    )
}