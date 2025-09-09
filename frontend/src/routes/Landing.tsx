import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getAssetsBase } from '../lib/config'
import MarkdownBlock from '../components/MarkdownBlock'

export default function Landing() {
  return (
    <div className="space-y-8">
      {/* Hero area */}
      <div className="hero relative min-h-[40vh] bg-base-200 rounded-lg overflow-hidden">
        <div className="absolute inset-0 opacity-60 pointer-events-none">
          <video className="w-full h-full object-cover" src={`${getAssetsBase()}/media/hero-event-italian.mp4`} autoPlay muted loop playsInline />
        </div>
        <div className="hero-content text-center relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold">Tischlein deck di</h1>
            <p className="py-4 opacity-80">Gemeinsam besondere Abende möglich machen – buch' deinen Platz und hilf mit, die Mindestanzahl zu erreichen.</p>
            <div className="flex justify-center">
              <Link to="/events" className="btn btn-primary gap-2 transition-transform active:scale-95">
                <ArrowRight size={18}/> Jetzt Entdecken
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Short description */}
      <MarkdownBlock className="prose mx-auto lg:max-w-[50vw]" src={`${getAssetsBase()}/content/landing-short.md`} />

      <div className="flex justify-center">
        <Link to="/events" className="btn btn-secondary gap-2 transition-transform active:scale-95"><ArrowRight size={18}/> Jetzt Entdecken</Link>
      </div>

      {/* Longer description */}
      <MarkdownBlock className="prose mx-auto lg:max-w-[50vw]" src={`${getAssetsBase()}/content/landing-long.md`} />

      <div className="flex justify-center">
        <Link to="/events" className="btn btn-primary gap-2 transition-transform active:scale-95"><ArrowRight size={18}/> Jetzt Entdecken</Link>
      </div>
    </div>
  )
}
