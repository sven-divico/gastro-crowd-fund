import { getAssetsBase } from '../lib/config'

type Hero = {
  image?: string
  video?: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
}

export default function HeroMedia({ hero }: { hero?: Hero | null }) {
  if (!hero) return null
  const { image, video, autoplay = false, muted = true, loop = true } = hero
  if (video) {
    return (
      <div className="w-full aspect-video bg-base-200">
        <video
          className="w-full h-full object-cover"
          src={`${getAssetsBase()}/media/${video}`}
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          playsInline
        />
      </div>
    )
  }
  if (image) {
    return (
      <div className="w-full">
        <img src={`${getAssetsBase()}/media/${image}`} alt="Hero" className="w-full h-56 md:h-72 object-cover" />
      </div>
    )
  }
  return null
}
