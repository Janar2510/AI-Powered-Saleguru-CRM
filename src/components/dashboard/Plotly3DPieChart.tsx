import React from 'react';
import Plot from 'react-plotly.js';

interface Plotly3DPieChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  height?: number;
  isLoading?: boolean;
}

const BRAND_COLORS = [
  '#a259ff', // Brand purple
  '#377dff', // Brand blue
  '#43e7ad', // Brand green
  '#f59e0b', // Brand yellow
  '#ef4444', // Brand red
  '#b0b0d0', // Brand gray
];

const Plotly3DPieChart: React.FC<Plotly3DPieChartProps> = ({ data, title = '', height = 350, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-4 flex items-center justify-center min-h-[200px]">
        <div className="w-10 h-10 border-4 border-[#a259ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  const labels = data.map(d => d.name);
  const values = data.map(d => d.value);

  return (
    <div className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-4">
      {title && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <Plot
        data={[
          {
            type: 'pie',
            labels,
            values,
            marker: {
              colors: BRAND_COLORS,
              line: { width: 2, color: '#23233a' },
            },
            hole: 0.45, // donut style
            pull: 0.04,
            textinfo: 'label+percent',
            textfont: { color: '#fff', size: 14 },
            hoverinfo: 'label+value+percent',
            rotation: 45,
            sort: false,
          },
        ]}
        layout={{
          autosize: true,
          height,
          paper_bgcolor: 'rgba(35,35,58,0.4)',
          plot_bgcolor: 'rgba(35,35,58,0.0)',
          font: { color: '#fff', family: 'Inter, sans-serif' },
          margin: { l: 20, r: 20, t: 30, b: 20 },
          showlegend: false,
          title: '',
          transition: { duration: 500, easing: 'cubic-in-out' },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height }}
      />
    </div>
  );
};

export default Plotly3DPieChart; 