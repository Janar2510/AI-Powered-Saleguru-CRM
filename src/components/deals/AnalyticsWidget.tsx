import React from 'react';

const AnalyticsWidget: React.FC<{ deals: any[] }> = ({ deals }) => {
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const wonDeals = deals.filter(d => d.status === 'won').length;
  const winRate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : '0';
  const closedDeals = deals.filter(d => d.expected_close_date);
  let totalDays = 0;
  closedDeals.forEach(d => {
    if (d.created_at && d.expected_close_date) {
      const createDate = new Date(d.created_at);
      const closeDate = new Date(d.expected_close_date);
      totalDays += Math.round((closeDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24));
    }
  });
  const avgDealCycle = closedDeals.length > 0 ? Math.round(totalDays / closedDeals.length) : 0;

  return (
    <div className="flex gap-4 mb-6">
      <div className="bg-white rounded shadow p-4 flex-1">
        <div className="text-xs text-gray-500">Total Deals</div>
        <div className="text-2xl font-bold">{totalDeals}</div>
      </div>
      <div className="bg-white rounded shadow p-4 flex-1">
        <div className="text-xs text-gray-500">Total Value</div>
        <div className="text-2xl font-bold">${totalValue}</div>
      </div>
      <div className="bg-white rounded shadow p-4 flex-1">
        <div className="text-xs text-gray-500">Win Rate</div>
        <div className="text-2xl font-bold">{winRate}%</div>
      </div>
      <div className="bg-white rounded shadow p-4 flex-1">
        <div className="text-xs text-gray-500">Avg Deal Cycle</div>
        <div className="text-2xl font-bold">{avgDealCycle} days</div>
      </div>
    </div>
  );
};

export default AnalyticsWidget; 