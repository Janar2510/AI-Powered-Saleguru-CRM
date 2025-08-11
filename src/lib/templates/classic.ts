export const classicTemplate = `
<!doctype html><html><head><meta charset="utf-8" />
<style>{{BRAND_CSS}}</style>
</head><body>
<div class="card">
  <div class="h-row">
    <img class="logo" src="{{logo_url}}" />
    <div class="h1">{{doc_title}}</div>
  </div>
  <div class="hr"></div>
  <div class="h-row small">
    <div><strong>Number:</strong> {{doc_number}}</div>
    <div><strong>Date:</strong> {{doc_date}}</div>
    <div><strong>Due:</strong> {{due_date}}</div>
  </div>
  <div class="hr"></div>
  <div class="h-row">
    <div>
      <div class="h2">Customer</div>
      <div><strong>{{customer.name}}</strong></div>
      <div class="small">{{customer.address}}</div>
    </div>
    <div class="small">
      <div><strong>{{company_name}}</strong></div>
      <div>{{company_address}}</div>
      <div>{{company_email}}</div>
    </div>
  </div>
  <table class="table">
    <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
    <tbody>{{ITEM_ROWS}}</tbody>
  </table>
  <div class="total">Subtotal: {{subtotal}} | Tax: {{tax_amount}} | Total: {{total}}</div>
  <div class="small">Thank you for your business.</div>
</div>
</body></html>
`
