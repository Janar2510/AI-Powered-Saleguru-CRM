import { useEffect, useRef } from 'react'

export default function DocumentPreview({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    if (!iframeRef.current) return
    const doc = iframeRef.current.contentDocument
    if (!doc) return
    doc.open(); doc.write(html); doc.close()
  }, [html])
  return <iframe ref={iframeRef} className="w-full h-[900px] border rounded-xl bg-white" />
}
