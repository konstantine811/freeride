import PlayIcon from './PlayIcon'
import VideoPlayer from './VideoPlayer'

interface VideoPreviewProps { image: string; title: string }
export default function VideoPreview({ image, title }: VideoPreviewProps) {
  return <VideoPlayer className="video-preview" title={title} poster={image}>
    <img src={image} alt={title} loading="lazy" />
    <span className="youtube-play" aria-hidden="true"><PlayIcon /></span>
    <span className="video-caption">Дивитися відео <strong><PlayIcon /></strong><span>↗︎</span></span>
  </VideoPlayer>
}
