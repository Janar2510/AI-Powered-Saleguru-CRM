import React, { useState } from 'react';
import Plot from 'react-plotly.js';

interface Plotly3DBarChartProps {
  data: Array<{ x: string; y: number; z?: number } | { name: string; value: number }>;
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

const CHART_TYPES = [
  { value: 'bar', label: 'Bar (Horizontal)' },
  { value: 'column', label: 'Column (Vertical)' },
  { value: 'donut', label: 'Donut (Glow)' },
  { value: 'gauge', label: 'Gauge (KPI)' },
  { value: 'scatter3d', label: '3D Scatter (Glow)' },
  { value: 'surface', label: '3D Surface (Neon)' },
];

const DEMO_DATA = [
  { name: 'Qualified', value: 10 },
  { name: 'Lead', value: 7 },
  { name: 'Proposal', value: 5 },
  { name: 'Negotiation', value: 3 },
  { name: 'Closed Won', value: 2 }
];

const Plotly3DBarChart: React.FC<Plotly3DBarChartProps> = ({ data, title = '', height = 350, isLoading = false }) => {
  const [chartType, setChartType] = useState<'bar' | 'column' | 'donut' | 'gauge' | 'scatter3d' | 'surface'>('bar');
  const [modalOpen, setModalOpen] = useState(false);

  let chartData = data;
  if (!data || data.length === 0 || data.every(d => ('value' in d ? d.value : d.y) === 0)) {
    chartData = DEMO_DATA;
  }
  // Normalize data
  const x = chartData.map(d => 'x' in d ? d.x : d.name);
  const y = chartData.map(d => 'y' in d ? d.y : d.value);

  // Pie/Donut data
  const labels = x;
  const values = y;

  // Chart data config
  let plotData: any[] = [];
  if (chartType === 'bar') {
    plotData = [{
      type: 'bar',
      x: y,
      y: x,
      orientation: 'h',
      marker: {
        color: BRAND_COLORS,
        line: { width: 2, color: '#23233a' },
        opacity: 0.95,
      },
    }];
  } else if (chartType === 'column') {
    plotData = [{
      type: 'bar',
      x,
      y,
      marker: {
        color: BRAND_COLORS,
        line: { width: 2, color: '#23233a' },
        opacity: 0.95,
      },
    }];
  } else if (chartType === 'donut') {
    plotData = [{
      type: 'pie',
      labels,
      values,
      marker: {
        colors: BRAND_COLORS,
        line: { width: 4, color: '#a259ff' },
        opacity: 0.98,
      },
      hole: 0.45,
      pull: 0.06,
      textinfo: 'label+percent',
      textfont: { color: '#fff', size: 16 },
      hoverinfo: 'label+value+percent',
      rotation: 45,
      sort: false,
    }];
  } else if (chartType === 'gauge') {
    const total = y.reduce((a, b) => a + b, 0);
    const max = Math.max(...y, 1);
    const percent = Math.round((total / (max * y.length)) * 100);
    plotData = [{
      type: 'indicator',
      mode: 'gauge+number',
      value: percent,
      gauge: {
        axis: { range: [0, 100], tickcolor: '#b0b0d0' },
        bar: { color: '#a259ff', thickness: 0.3 },
        bgcolor: 'rgba(35,35,58,0.0)',
        borderwidth: 2,
        bordercolor: '#23233a',
        steps: [
          { range: [0, 50], color: '#23233a' },
          { range: [50, 100], color: '#377dff' },
        ],
        threshold: {
          line: { color: '#43e7ad', width: 4 },
          thickness: 0.75,
          value: percent,
        },
      },
      number: { suffix: '%', font: { color: '#fff', size: 36 } },
      domain: { x: [0, 1], y: [0, 1] },
    }];
  } else if (chartType === 'scatter3d') {
    // Demo 3D scatter data
    const scatterData = [
      { x: [100, 300, 500, 700, 900, 200, 400, 600, 800],
        y: [100, 300, 500, 700, 900, 800, 600, 400, 200],
        z: [200, 400, 600, 800, 900, 700, 500, 300, 100],
        mode: 'markers+lines',
        type: 'scatter3d',
        marker: {
          size: 16,
          color: ['#a259ff', '#a259ff', '#a259ff', '#a259ff', '#ff9900', '#ff9900', '#a259ff', '#a259ff', '#ff9900'],
          opacity: 0.95,
          line: { color: '#fff', width: 2 },
          symbol: 'circle',
          showscale: false,
        },
        line: {
          color: ['#a259ff', '#a259ff', '#a259ff', '#a259ff', '#ff9900', '#ff9900', '#a259ff', '#a259ff', '#ff9900'],
          width: 4,
        },
        hoverinfo: 'x+y+z',
      }
    ];
    plotData = scatterData;
  } else if (chartType === 'surface') {
    // Demo 3D surface data
    const surfaceZ = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 2, 3, 4, 3, 2, 1, 0, 0],
      [0, 2, 4, 6, 8, 6, 4, 2, 0, 0],
      [0, 3, 6, 9, 12, 9, 6, 3, 0, 0],
      [0, 4, 8, 12, 16, 12, 8, 4, 0, 0],
      [0, 3, 6, 9, 12, 9, 6, 3, 0, 0],
      [0, 2, 4, 6, 8, 6, 4, 2, 0, 0],
      [0, 1, 2, 3, 4, 3, 2, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    plotData = [{
      type: 'surface',
      z: surfaceZ,
      colorscale: [
        [0, '#a259ff'],
        [0.5, '#ff3cac'],
        [1, '#ff9900']
      ],
      showscale: false,
      opacity: 0.98,
      lighting: { ambient: 0.7, diffuse: 0.9, specular: 1, roughness: 0.5, fresnel: 0.2 },
      hoverinfo: 'x+y+z',
    }];
  }

  if (isLoading) {
    return (
      <div className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-4 flex items-center justify-center min-h-[200px]">
        <div className="w-10 h-10 border-4 border-[#a259ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const Chart = (
    <div className="relative cursor-pointer group" onClick={() => setModalOpen(true)}>
      <div className="flex items-center justify-between mb-2">
        {title && <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>}
        <select
          value={chartType}
          onChange={e => setChartType(e.target.value as any)}
          className="bg-[#23233a]/60 border border-[#23233a]/40 rounded-lg text-white text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
        >
          {CHART_TYPES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          height,
          paper_bgcolor: 'rgba(35,35,58,0.4)',
          plot_bgcolor: 'rgba(35,35,58,0.0)',
          font: { color: '#fff', family: 'Inter, sans-serif' },
          margin: { l: 40, r: 20, t: 30, b: 40 },
          showlegend: false,
          transition: { duration: 500, easing: 'cubic-in-out' },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height }}
      />
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
        <span className="text-white text-xs font-medium">Click to expand</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-[#23233a]/40 backdrop-blur-sm border border-[#23233a]/50 rounded-xl shadow-lg p-4 min-h-[340px]">
        {Chart}
        <div className="mt-2 text-xs text-secondary-400">
          <div>Chart type: <span className="font-mono text-white">{chartType}</span></div>
          <div>Data: <span className="font-mono text-white">{JSON.stringify(chartData)}</span></div>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-[#23233a]/90 backdrop-blur-md border border-[#23233a]/50 rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 min-h-[340px]">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3 text-[#b0b0d0] hover:text-white text-xl font-bold focus:outline-none"
              aria-label="Close"
            >
              ×
            </button>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">{title}</h2>
              <select
                value={chartType}
                onChange={e => setChartType(e.target.value as any)}
                className="bg-[#23233a]/60 border border-[#23233a]/40 rounded-lg text-white text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#a259ff]"
              >
                {CHART_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <Plot
              data={plotData}
              layout={{
                autosize: true,
                height: 500,
                paper_bgcolor: 'rgba(35,35,58,0.4)',
                plot_bgcolor: 'rgba(35,35,58,0.0)',
                font: { color: '#fff', family: 'Inter, sans-serif' },
                margin: { l: 40, r: 20, t: 30, b: 40 },
                showlegend: false,
                transition: { duration: 500, easing: 'cubic-in-out' },
              }}
              config={{ displayModeBar: true, responsive: true }}
              style={{ width: '100%', height: 500 }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Plotly3DBarChart; 