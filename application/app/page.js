import SunTracker from "@/components/sun-track"
import { SunMoonIcon } from "lucide-react"
import { Suspense } from "react"


export default function Home() {
  return (
    <div className="grid  min-h-screen p-8  md:p-24 pb-20 items-center font-[family-name:var(--font-geist-sans)]">
      <div>
        <h1 className="flex font-bold bg-clip-text text-transparent bg-gradient-to-r from-lime-300 to-green-400 ">SunTrack<SunMoonIcon className="text-green-500 mx-1"/></h1>
      </div>
      <Suspense fallback={<p>loading..</p>}>
        <SunTracker/>
      </Suspense>
      <div>
        <p className="text-sm">Developed by <span className="underline underline-offset-2 hover:text-green-500 transition hover:cursor-pointer">aromi</span></p>
      </div>
    </div>
  )
}