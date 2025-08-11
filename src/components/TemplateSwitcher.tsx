export default function TemplateSwitcher({ value, onChange }:{
  value: 'modern'|'minimal'|'classic',
  onChange: (v:'modern'|'minimal'|'classic')=>void
}) {
  return (
    <div className="flex gap-2">
      {(['modern','minimal','classic'] as const).map(k => (
        <button key={k}
          className={`px-3 py-1 rounded border ${value===k?'bg-black text-white':'bg-white'}`}
          onClick={()=>onChange(k)}>{k}</button>
      ))}
    </div>
  )
}
