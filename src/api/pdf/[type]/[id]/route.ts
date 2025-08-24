// PDF Generation API Route
// apps/web/src/app/api/pdf/[type]/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey);
};

export async function GET(req: NextRequest, ctx: { params: { type: string; id: string } }) {
  const { type, id } = ctx.params; // 'quote' | 'proforma' | 'invoice'
  const supabase = createSupabaseClient();
  let header: any, lines: any[] = [];

  try {
    // Fetch document data based on type
    if (type === 'quote') {
      const { data: h } = await supabase.from('quotes').select('*').eq('id', id).single();
      const { data: l } = await supabase.from('quote_items').select('*').eq('quote_id', id);
      header = h; 
      lines = l || [];
    } else if (type === 'proforma') {
      const { data: h } = await supabase.from('proformas').select('*').eq('id', id).single();
      const { data: l } = await supabase.from('proforma_items').select('*').eq('proforma_id', id);
      header = h; 
      lines = l || [];
    } else if (type === 'invoice') {
      const { data: h } = await supabase.from('invoices').select('*').eq('id', id).single();
      const { data: l } = await supabase.from('invoice_items').select('*').eq('invoice_id', id);
      header = h; 
      lines = l || [];
    } else {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    if (!header) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    
    doc.on('data', (c) => chunks.push(c as Buffer));
    const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    // Header
    const documentType = type === 'invoice' ? 'INVOICE' : type === 'proforma' ? 'PRO FORMA' : 'QUOTE';
    doc.fontSize(18).text(`${documentType} #${header.number || ''}`, { align: 'right' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Date: ${header.issue_date || new Date().toISOString().slice(0, 10)}`, { align: 'right' });
    
    if (type !== 'quote') {
      const dueDate = header.due_date || header.valid_until || '';
      if (dueDate) {
        doc.text(`Due: ${dueDate}`, { align: 'right' });
      }
    }

    // Seller/Buyer information
    doc.moveDown(1);
    doc.fontSize(12).text('Seller', { underline: true });
    doc.fontSize(10).text('SaleGuru CRM').text('Estonia, EU').text('VAT EE...');
    
    doc.moveDown(0.75);
    doc.fontSize(12).text('Bill To', { underline: true });
    
    if (header.company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('name, address')
        .eq('id', header.company_id)
        .single();
        
      if (company) {
        doc.fontSize(10).text(company.name || '').text(company.address || '');
      }
    }

    // Table header
    doc.moveDown(1);
    doc.fontSize(11).text('Items', { underline: true });
    doc.moveDown(0.25);
    doc.fontSize(10);
    doc.text('Description', 40, doc.y);
    doc.text('Qty', 350, doc.y);
    doc.text('Unit', 400, doc.y);
    doc.text('Total', 470, doc.y);
    doc.moveTo(40, doc.y + 3).lineTo(555, doc.y + 3).strokeColor('#e5e7eb').stroke();

    // Lines
    let total = 0;
    lines.forEach((line) => {
      const qty = Number(line.qty || 0);
      const unit = Number((line.unit_price_cents || 0) / 100);
      const sum = Number((line.line_total_cents ?? Math.round(qty * unit * 100)) / 100);
      total += sum;
      
      doc.moveDown(0.4);
      doc.text(line.description || '', 40, doc.y, { width: 300 });
      doc.text(qty.toString(), 350, doc.y);
      doc.text(unit.toFixed(2), 400, doc.y);
      doc.text(sum.toFixed(2), 470, doc.y);
    });

    // Totals
    doc.moveDown(1);
    const subtotal = (header.subtotal_cents || Math.round(total * 100)) / 100;
    const tax = (header.tax_cents || 0) / 100;
    const grandTotal = (header.total_cents || Math.round(total * 100)) / 100;
    
    doc.text(`Subtotal: ${subtotal.toFixed(2)} €`, { align: 'right' });
    doc.text(`VAT (${header.tax_rate || 0}%): ${tax.toFixed(2)} €`, { align: 'right' });
    doc.fontSize(12).text(`Total: ${grandTotal.toFixed(2)} €`, { align: 'right' });

    doc.end();
    const pdf = await done;

    // Optionally: upload to Supabase Storage and link to documents/portal
    try {
      const path = `pdf/${type}_${header.number || id}.pdf`;
      await supabase.storage
        .from('documents')
        .upload(path, new Blob([pdf], { type: 'application/pdf' }), { upsert: true });
      
      // Optional: insert into documents table to show in portal
      await supabase.from('documents').upsert({
        org_id: header.org_id,
        name: `${type.toUpperCase()} ${header.number || ''}.pdf`,
        portal_path: path,
        deal_id: header.deal_id,
        company_id: header.company_id,
        esign_status: null
      }, { onConflict: 'portal_path' });
    } catch (e) {
      // Non-blocking - PDF generation still works
      console.error('PDF upload failed', e);
    }

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${type}_${header.number || header.id}.pdf"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' }, 
      { status: 500 }
    );
  }
}
