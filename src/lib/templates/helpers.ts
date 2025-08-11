export const applyPlaceholders = (html: string, data: Record<string, any>) =>
  html.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    const parts = key.split('.')
    let v: any = data
    for (const p of parts) v = v?.[p]
    return (v ?? '').toString()
  })

export const renderItemsRows = (items: any[]) =>
  items.map(it => `
    <tr>
      <td>${it.name}</td>
      <td>${it.qty}</td>
      <td>${Number(it.price).toFixed(2)}</td>
      <td>${(Number(it.qty)*Number(it.price)).toFixed(2)}</td>
    </tr>
  `).join('')
