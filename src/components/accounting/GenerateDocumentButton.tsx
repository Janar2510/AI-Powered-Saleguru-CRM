import { useNavigate } from 'react-router-dom'

interface GenerateDocumentButtonProps {
  quoteId?: string
  type?: 'invoice' | 'proforma' | 'receipt'
  className?: string
}

export default function GenerateDocumentButton({ 
  quoteId, 
  type = 'invoice', 
  className = '' 
}: GenerateDocumentButtonProps) {
  const navigate = useNavigate()

  const handleGenerateDocument = () => {
    const url = `/documents/new?fromQuote=${quoteId || ''}&type=${type}`
    navigate(url)
  }

  return (
    <button
      onClick={handleGenerateDocument}
      className={`px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-700 text-white hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800 transition-all ${className}`}
    >
      Generate {type.charAt(0).toUpperCase() + type.slice(1)}
    </button>
  )
}


