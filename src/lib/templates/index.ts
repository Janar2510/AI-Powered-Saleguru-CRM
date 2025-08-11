import { brandCss } from './brandCss'
import { modernTemplate } from './modern'
import { minimalTemplate } from './minimal'
import { classicTemplate } from './classic'
import { applyPlaceholders, renderItemsRows } from './helpers'

const map: Record<string,string> = {
  modern: modernTemplate,
  minimal: minimalTemplate,
  classic: classicTemplate,
}

export function renderTemplate(tpl: 'modern'|'minimal'|'classic', data: any, brand: any) {
  const base = map[tpl] || map.modern
  const rows = renderItemsRows(data.items || [])
  const html = base
    .replace('{{BRAND_CSS}}', brandCss(brand))
    .replace('{{ITEM_ROWS}}', rows)
  return applyPlaceholders(html, {
    ...data,
    company_name: brand.company_name || data.company_name,
    logo_url: brand.logo_url || data.logo_url,
  })
}
