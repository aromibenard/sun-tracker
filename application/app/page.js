import SunTracker from "@/components/sun-track"


export default async function Home() {
  return (
    <div className="grid  min-h-screen p-8  md:p-24 pb-20 items-center font-[family-name:var(--font-geist-sans)]">
      <SunTracker/>
    </div>
  )
}