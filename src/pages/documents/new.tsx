import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import BrandDesigner from '../../components/BrandDesigner'
import TemplateSwitcher from '../../components/TemplateSwitcher'
import DocumentPreview from '../../components/DocumentPreview'
import { renderTemplate } from '../../lib/templates'

export default function NewDocument() {
  const [searchParams] = useSearchParams()
  const fromQuote = searchParams.get('fromQuote')
  const type = searchParams.get('type') || 'invoice'
  
  const [brand, setBrand] = useState<any>({})
  const [tpl, setTpl] = useState<'modern'|'minimal'|'classic'>('modern')
  const [userId, setUserId] = useState<string>('')
  const [data, setData] = useState<any>({ 
    doc_title: type.charAt(0).toUpperCase() + type.slice(1), 
    doc_tag: type.toUpperCase(), 
    doc_number: `DOC-${Date.now()}`,
    doc_date: new Date().toLocaleDateString(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    items: [], 
    subtotal: '0.00', 
    tax_rate: '20', 
    tax_amount: '0.00', 
    total: '0.00',
    notes: '',
    customer: {
      name: '',
      address: '',
      email: ''
    },
    company_name: 'SaleToru CRM',
    company_address: '123 Business Street, City, Country',
    company_email: 'contact@saletoru.com'
  })
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBrand = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        setUserId(user.id)
        
        const { data: brandData } = await supabase.from('branding').select('*').eq('user_id', user.id).single()
        if (brandData) { 
          setBrand(brandData)
          setTpl(brandData.default_template || 'modern')
        }
        
        // Load quote data if fromQuote is present
        if (fromQuote) {
          // Here you would load the quote data and prefill the form
          // For now, we'll use mock data
          setData((prev: any) => ({
            ...prev,
            doc_title: type.charAt(0).toUpperCase() + type.slice(1),
            doc_tag: type.toUpperCase(),
            items: [
              { name: 'Sample Product', qty: 1, price: 100.00 },
              { name: 'Another Product', qty: 2, price: 50.00 }
            ],
            subtotal: '200.00',
            tax_amount: '40.00',
            total: '240.00',
            customer: {
              name: 'Sample Customer',
              address: '123 Customer Street, City, Country',
              email: 'customer@example.com'
            }
          }))
        }
      } catch (error) {
        console.error('Error loading brand data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadBrand()
  }, [fromQuote, type])

  useEffect(() => {
    if (!loading) {
      setHtml(renderTemplate(tpl, data, brand))
    }
  }, [tpl, data, brand, loading])

  const exportDoc = async (format: 'pdf'|'docx'|'html') => {
    if (format === 'html') {
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.doc_title || 'document'}.html`
      a.click()
      URL.revokeObjectURL(url)
      return
    }
    
    // For PDF and DOCX, you would call your export API
    // For now, we'll just show an alert
    alert(`${format.toUpperCase()} export would be implemented here`)
  }

  const saveDocument = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const payload = {
        user_id: user.id,
        title: data.doc_title,
        type: type,
        template: tpl,
        html_content: html,
        data: data,
        brand_data: brand
      }
      
      const { error } = await supabase.from('documents').insert(payload)
      if (error) throw error
      
      alert('Document saved successfully!')
    } catch (error) {
      console.error('Error saving document:', error)
      alert('Error saving document')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Create New Document</h1>
          <p className="text-gray-300">Design and generate professional documents with your branding</p>
        </div>
        
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          <div className="space-y-4">
            {userId && <BrandDesigner userId={userId} onChange={setBrand} />}
            
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <h3 className="text-lg font-semibold mb-3 text-white">Template</h3>
              <TemplateSwitcher value={tpl} onChange={setTpl} />
            </div>
            
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <h3 className="text-lg font-semibold mb-3 text-white">Document Header</h3>
              <input 
                className="border border-[#23233a]/50 rounded-lg p-2 w-full mb-2 bg-[#23233a]/20 text-white placeholder-gray-400" 
                placeholder="Document Title" 
                value={data.doc_title} 
                onChange={e=>setData({...data, doc_title:e.target.value})}
              />
              <input 
                className="border border-[#23233a]/50 rounded-lg p-2 w-full bg-[#23233a]/20 text-white placeholder-gray-400" 
                placeholder="Tag (INVOICE/PRO FORMA/RECEIPT)" 
                value={data.doc_tag} 
                onChange={e=>setData({...data, doc_tag:e.target.value})}
              />
            </div>
            
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <h3 className="text-lg font-semibold mb-3 text-white">Customer Information</h3>
              <input 
                className="border border-[#23233a]/50 rounded-lg p-2 w-full mb-2 bg-[#23233a]/20 text-white placeholder-gray-400" 
                placeholder="Customer Name" 
                value={data.customer?.name || ''} 
                                 onChange={e=>setData({...data, customer: {...data.customer, name: e.target.value}})}
               />
               <input 
                 className="border border-[#23233a]/50 rounded-lg p-2 w-full mb-2 bg-[#23233a]/20 text-white placeholder-gray-400" 
                 placeholder="Customer Address" 
                 value={data.customer?.address || ''} 
                 onChange={e=>setData({...data, customer: {...data.customer, address: e.target.value}})}
               />
               <input 
                 className="border border-[#23233a]/50 rounded-lg p-2 w-full bg-[#23233a]/20 text-white placeholder-gray-400" 
                 placeholder="Customer Email" 
                 value={data.customer?.email || ''} 
                 onChange={e=>setData({...data, customer: {...data.customer, email: e.target.value}})}
              />
            </div>
            
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <h3 className="text-lg font-semibold mb-3 text-white">Totals</h3>
              <div className="grid grid-cols-3 gap-2">
                <input 
                  className="border border-[#23233a]/50 rounded-lg p-2 bg-[#23233a]/20 text-white placeholder-gray-400" 
                  placeholder="Subtotal" 
                  value={data.subtotal} 
                  onChange={e=>setData({...data, subtotal:e.target.value})}
                />
                <input 
                  className="border border-[#23233a]/50 rounded-lg p-2 bg-[#23233a]/20 text-white placeholder-gray-400" 
                  placeholder="Tax %" 
                  value={data.tax_rate} 
                  onChange={e=>setData({...data, tax_rate:e.target.value})}
                />
                <input 
                  className="border border-[#23233a]/50 rounded-lg p-2 bg-[#23233a]/20 text-white placeholder-gray-400" 
                  placeholder="Total" 
                  value={data.total} 
                  onChange={e=>setData({...data, total:e.target.value})}
                />
              </div>
            </div>
            
            <div className="bg-[#23233a]/40 backdrop-blur-sm rounded-xl border border-[#23233a]/50 p-6">
              <h3 className="text-lg font-semibold mb-3 text-white">Actions</h3>
              <div className="flex gap-2 mb-2">
                <button 
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-700 text-white hover:from-purple-600 hover:via-purple-700 hover:to-indigo-800" 
                  onClick={()=>exportDoc('pdf')}>
                  Export PDF
                </button>
                <button 
                  className="px-3 py-2 rounded-lg border border-[#23233a]/50 text-white hover:bg-[#23233a]/40" 
                  onClick={()=>exportDoc('docx')}>
                  Export DOCX
                </button>
                <button 
                  className="px-3 py-2 rounded-lg border border-[#23233a]/50 text-white hover:bg-[#23233a]/40" 
                  onClick={()=>exportDoc('html')}>
                  Download HTML
                </button>
              </div>
              <button 
                className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 text-white hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-800" 
                onClick={saveDocument}>
                Save Document
              </button>
            </div>
          </div>
          
          <DocumentPreview html={html} />
        </div>
      </div>
    </div>
  )
} 