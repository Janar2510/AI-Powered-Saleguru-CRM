export const modernTemplate = `
<!doctype html><html><head><meta charset="utf-8" />
<style>{{BRAND_CSS}}</style>
</head><body>
<div class="watermark">{{company_name}}</div>
<div class="card">
  <div class="h-row">
    <div class="h1">{{doc_title}}</div>
    <div class="badge">{{doc_tag}}</div>
  </div>
  <div class="h-row" style="margin-top:8px;">
    <img class="logo" src="{{logo_url}}" alt="logo" />
    <div class="small">
      <div><strong>{{company_name}}</strong></div>
      <div>{{company_address}}</div>
      <div>{{company_email}}</div>
    </div>
  </div>
  <div class="brand-bar" style="margin:16px 0;"></div>
  <div class="h-row">
    <div>
      <div class="h2">Bill To</div>
      <div><strong>{{customer.name}}</strong></div>
      <div class="small">{{customer.address}}</div>
      <div class="small">{{customer.email}}</div>
    </div>
    <div>
      <div><strong>No:</strong> {{doc_number}}</div>
      <div><strong>Date:</strong> {{doc_date}}</div>
      <div><strong>Due:</strong> {{due_date}}</div>
    </div>
  </div>
  <table class="table">
    <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Line Total</th></tr></thead>
    <tbody>
      {{ITEM_ROWS}}
    </tbody>
  </table>
  <div class="hr"></div>
  <div class="total">Subtotal: {{subtotal}}<br/>Tax ({{tax_rate}}%): {{tax_amount}}<br/>Grand Total: {{total}}</div>
  <div class="hr"></div>
  <div class="small">Notes: {{notes}}</div>
</div>
</body></html>
`
