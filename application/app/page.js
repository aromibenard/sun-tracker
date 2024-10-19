import SunTracker from "@/components/sun-track"

async function getLocation() {
  const response = await fetch ('http://ip-api.com/json/')
  const data = await response.json()

  if (data.status !== 'fail') {
    return {
      latitude: data.lat,
      longitude: data.lon
    }
  }

  return {
    latitude: null,
    longitude: null
  }
}

async function getSunriseAndSunset() {
  const coords = await getLocation()
  const {latitude, longitude} = coords
 
  const results = await fetch(`https://api.sunrisesunset.io/json?lat=${latitude}&lng=${longitude}`)
  const data = await results.json()

  console.log(data)

  const {sunrise, sunset } = data.results

  return {
    latitude,
    longitude,
    sunrise,
    sunset
  }
}

export default async function Home() {
  const data = await getSunriseAndSunset()
  const {sunrise, sunset, latitude, longitude} = data
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <SunTracker
        sunrise={sunrise}
        sunset={sunset}
        latitude={latitude}
        longitude={longitude}
      />
    </div>
  )
}