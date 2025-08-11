export const brandCss = (b: {
  primary_color?: string
  accent_color?: string
  text_color?: string
  bg_color?: string
  font_family?: string
}) => `
:root{
  --brand-primary: ${b.primary_color || '#3B82F6'};
  --brand-accent: ${b.accent_color || '#111827'};
  --brand-text: ${b.text_color || '#111827'};
  --brand-bg: ${b.bg_color || '#ffffff'};
  --brand-font: ${b.font_family || 'Inter, Arial, sans-serif'};
}
*{ box-sizing:border-box; }
body{ margin:0; background:var(--brand-bg); color:var(--brand-text); font-family:var(--brand-font); }
.card{ border:1px solid #e5e7eb; border-radius:16px; padding:24px; }
.h-row{ display:flex; justify-content:space-between; align-items:center; gap:16px; }
.badge{ background: var(--brand-primary); color: white; padding:2px 10px; border-radius:999px; font-weight:600; font-size:12px;}
.h1{ font-size:28px; font-weight:700; color:var(--brand-accent); }
.h2{ font-size:18px; font-weight:600; color:var(--brand-accent); }
.table{ width:100%; border-collapse:collapse; margin-top:12px; }
.table th, .table td{ border-bottom:1px solid #eee; padding:10px; text-align:left; }
.total{ text-align:right; font-weight:700; }
.brand-bar{ height:6px; background: linear-gradient(90deg, var(--brand-primary), var(--brand-accent)); border-radius:999px; }
.watermark{ position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-25deg); opacity:0.06; font-size:96px; pointer-events:none; }
.logo{ height:48px; object-fit:contain; }
.small{ color:#6b7280; font-size:12px; }
.hr{ border:0; border-top:1px solid #e5e7eb; margin:16px 0; }
`
