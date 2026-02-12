import { getReadingTime } from '../utils/contentLoader'

export default function ReadingTime({ content }: { content: string }) {
  const minutes = getReadingTime(content)
  return (
    <span
      className="meta-pill reading-time"
      title={`Estimated reading time: ${minutes} minute${minutes !== 1 ? 's' : ''}`}
    >
      📖 {minutes} min read
    </span>
  )
}
