export const minimalTemplate = `
<!doctype html><html><head><meta charset="utf-8" />
<style>{{BRAND_CSS}}</style>
</head><body>
<div style="padding:24px;">
  <div class="h-row">
    <div>
      <div class="h1">{{doc_title}}</div>
      <div class="small">No: {{doc_number}} • Date: {{doc_date}}</div>
    </div>
    <img class="logo" src="{{logo_url}}" />
  </div>
  <div class="hr"></div>
  <div class="h-row">
    <div>
      <div class="h2">To</div>
      <div><strong>{{customer.name}}</strong></div>
      <div class="small">{{customer.address}}</div>
      <div class="small">{{customer.email}}</div>
    </div>
    <div class="small">
      <div><strong>{{company_name}}</strong></div>
      <div>{{company_email}}</div>
    </div>
  </div>
  <table class="table">
    <thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
    <tbody>{{ITEM_ROWS}}</tbody>
  </table>
  <div class="total">Total: {{total}}</div>
</div>
</body></html>
`
