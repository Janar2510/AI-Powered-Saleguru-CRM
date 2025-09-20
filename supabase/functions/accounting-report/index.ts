import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.43.4";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(url, key);

interface ReportRequest {
  org_id: string;
  period_code?: string;
  report_type?: 'trial_balance' | 'profit_loss' | 'balance_sheet' | 'general_ledger' | 'aging' | 'vat_summary';
  start_date?: string;
  end_date?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: { 
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  try {
    const { org_id, period_code, report_type = 'all', start_date, end_date }: ReportRequest = await req.json();

    if (!org_id) {
      throw new Error("org_id is required");
    }

    // Get period information
    let period = null;
    if (period_code) {
      const { data: periodData, error: periodError } = await supabase
        .from('acc_periods')
        .select('id, code, start_date, end_date, status')
        .eq('org_id', org_id)
        .eq('code', period_code)
        .single();

      if (periodError && periodError.code !== 'PGRST116') {
        throw new Error(`Period error: ${periodError.message}`);
      }
      period = periodData;
    }

    const reports: any = {};

    // Trial Balance
    if (report_type === 'all' || report_type === 'trial_balance') {
      const { data: trialBalance, error: tbError } = await supabase
        .from('acc_trial_balance_v')
        .select('*')
        .eq('org_id', org_id);

      if (tbError) throw new Error(`Trial balance error: ${tbError.message}`);
      reports.trial_balance = trialBalance;
    }

    // Profit & Loss
    if ((report_type === 'all' || report_type === 'profit_loss') && period_code) {
      const { data: profitLoss, error: plError } = await supabase
        .from('acc_pl_v')
        .select('*')
        .eq('org_id', org_id)
        .eq('code', period_code)
        .single();

      if (plError && plError.code !== 'PGRST116') {
        throw new Error(`Profit & Loss error: ${plError.message}`);
      }
      reports.profit_loss = profitLoss;
    }

    // Balance Sheet
    if ((report_type === 'all' || report_type === 'balance_sheet') && period) {
      const { data: balanceSheet, error: bsError } = await supabase
        .from('acc_balance_sheet_v')
        .select('*')
        .eq('org_id', org_id)
        .eq('period_id', period.id);

      if (bsError) throw new Error(`Balance sheet error: ${bsError.message}`);
      reports.balance_sheet = balanceSheet;
    }

    // General Ledger
    if (report_type === 'all' || report_type === 'general_ledger') {
      let query = supabase
        .from('acc_detailed_gl_v')
        .select('*')
        .eq('org_id', org_id);

      if (period_code) {
        query = query.eq('period_code', period_code);
      }
      if (start_date) {
        query = query.gte('jdate', start_date);
      }
      if (end_date) {
        query = query.lte('jdate', end_date);
      }

      query = query.order('jdate', { ascending: false }).limit(1000);

      const { data: generalLedger, error: glError } = await query;
      if (glError) throw new Error(`General ledger error: ${glError.message}`);
      reports.general_ledger = generalLedger;
    }

    // Aging Analysis
    if (report_type === 'all' || report_type === 'aging') {
      const { data: aging, error: agingError } = await supabase
        .from('acc_aging_v')
        .select('*')
        .eq('org_id', org_id);

      if (agingError) throw new Error(`Aging analysis error: ${agingError.message}`);
      reports.aging = aging;
    }

    // VAT Summary
    if ((report_type === 'all' || report_type === 'vat_summary') && period_code) {
      const { data: vatSummary, error: vatError } = await supabase
        .from('acc_vat_summary_v')
        .select('*')
        .eq('org_id', org_id)
        .eq('period_code', period_code)
        .single();

      if (vatError && vatError.code !== 'PGRST116') {
        throw new Error(`VAT summary error: ${vatError.message}`);
      }
      reports.vat_summary = vatSummary;
    }

    // Include period info in response
    if (period) {
      reports.period = period;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        ...reports,
        generated_at: new Date().toISOString()
      }), 
      { 
        status: 200, 
        headers: { 
          "Access-Control-Allow-Origin": "*", 
          "Content-Type": "application/json"
        }
      }
    );

  } catch (e: any) {
    console.error('Accounting report error:', e);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: String(e?.message || e) 
      }), 
      { 
        status: 500, 
        headers: { 
          "Access-Control-Allow-Origin": "*", 
          "Content-Type": "application/json"
        }
      }
    );
  }
});


