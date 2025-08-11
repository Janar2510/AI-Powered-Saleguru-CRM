import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

type Brand = {
  company_name?: string
  logo_url?: string
  primary_color?: string
  accent_color?: string
  text_color?: string
  bg_color?: string
  font_family?: string
  default_template?: 'modern'|'minimal'|'classic'
}

export default function BrandDesigner({ userId, onChange }: { userId: string, onChange?: (b:Brand)=>void }) {
  const [brand, setBrand] = useState<Brand>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('branding').select('*').eq('user_id', userId).single()
      if (data) setBrand(data)
    }
    if (userId) load()
  }, [userId])

  const uploadLogo = async (file: File) => {
    const path = `logos/${userId}-${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('branding').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('branding').getPublicUrl(path)
      setBrand(prev => ({ ...prev, logo_url: data.publicUrl }))
      onChange?.({ ...brand, logo_url: data.publicUrl })
    }
  }

  const save = async () => {
    setSaving(true)
    const payload = { ...brand, user_id: userId, updated_at: new Date().toISOString() }
    await supabase.from('branding').upsert(payload)
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <h3 className="text-lg font-semibold mb-3">Company Branding</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span>Company name</span>
          <input className="border rounded p-2" value={brand.company_name||''}
                 onChange={e=>{const v={...brand, company_name:e.target.value}; setBrand(v); onChange?.(v)}} />
        </label>

        <label className="flex flex-col gap-1">
          <span>Logo</span>
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
          {brand.logo_url && <img src={brand.logo_url} alt="logo" className="h-10 mt-2" />}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span>Primary color</span>
            <input type="color" className="h-10" value={brand.primary_color||'#3B82F6'}
                   onChange={e=>{const v={...brand, primary_color:e.target.value}; setBrand(v); onChange?.(v)}} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Accent color</span>
            <input type="color" className="h-10" value={brand.accent_color||'#111827'}
                   onChange={e=>{const v={...brand, accent_color:e.target.value}; setBrand(v); onChange?.(v)}} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Text color</span>
            <input type="color" className="h-10" value={brand.text_color||'#111827'}
                   onChange={e=>{const v={...brand, text_color:e.target.value}; setBrand(v); onChange?.(v)}} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Background</span>
            <input type="color" className="h-10" value={brand.bg_color||'#ffffff'}
                   onChange={e=>{const v={...brand, bg_color:e.target.value}; setBrand(v); onChange?.(v)}} />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span>Font family</span>
          <input className="border rounded p-2" value={brand.font_family||'Inter, Arial, sans-serif'}
                 onChange={e=>{const v={...brand, font_family:e.target.value}; setBrand(v); onChange?.(v)}} />
        </label>

        <label className="flex flex-col gap-1">
          <span>Default template</span>
          <select className="border rounded p-2" value={brand.default_template||'modern'}
                  onChange={e=>{const v={...brand, default_template:e.target.value as any}; setBrand(v); onChange?.(v)}}>
            <option value="modern">Modern</option>
            <option value="minimal">Minimalist</option>
            <option value="classic">Classic</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="px-4 py-2 rounded bg-gray-100" onClick={()=>onChange?.(brand)}>Preview</button>
        <button className="px-4 py-2 rounded bg-black text-white" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
