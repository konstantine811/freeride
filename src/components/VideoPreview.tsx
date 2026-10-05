import VideoPlayer from './VideoPlayer'

interface VideoPreviewProps { image: string; title: string }
export default function VideoPreview({ image, title }: VideoPreviewProps) {
  return <VideoPlayer className="video-preview" title={title}>
    <img src={image} alt={title} loading="lazy" />
    <span className="youtube-play" aria-hidden="true">▶</span>
    <span className="video-caption">Дивитися відео <strong>▶</strong><span>↗</span></span>
  </VideoPlayer>
}
