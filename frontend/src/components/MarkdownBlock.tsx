import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

export default function MarkdownBlock({ src, className }: { src: string, className?: string }){
  const [content, setContent] = useState<string>('')
  useEffect(()=>{
    let alive = true
    // Bypass caches to always fetch latest during demos
    const url = src.includes('?') ? `${src}&t=${Date.now()}` : `${src}?t=${Date.now()}`
    fetch(url, { cache: 'no-store' }).then(r=> r.ok ? r.text() : Promise.resolve(''))
      .then(t=>{ if (alive) setContent(t) })
      .catch(()=>{})
    return ()=>{ alive = false }
  }, [src])
  if (!content) return null
  return (
    <div className={className}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
