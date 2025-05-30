import React from 'react';
import Card from './Card';

function CO2Graph({ data }) {
  // Simple canvas-based graph implementation
  // In a real app, you'd use a charting library like Chart.js or Recharts

  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Sort data by timestamp (oldest first for proper display)
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const values = sortedData.map(item => item.co2Level);
    const maxValue = Math.max(...values, 1500); // Set minimum maximum to 1500 for better visualization
    const minValue = Math.min(...values, 400); // Set maximum minimum to 400 for better visualization
    const range = maxValue - minValue;

    // Set up styles
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#4F46E5'; // Indigo color

    // Draw the line
    ctx.beginPath();

    sortedData.forEach((item, index) => {
      const x = (index / (sortedData.length - 1)) * width;
      const y = height - ((item.co2Level - minValue) / range) * (height - 40) - 20; // Leave space for labels

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw threshold lines
    const drawThreshold = (value, color, label) => {
      const y = height - ((value - minValue) / range) * (height - 40) - 20;
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = color;
      ctx.font = '12px sans-serif';
      ctx.fillText(`${value} ppm`, 10, y - 5);
    };

    // Draw threshold lines for different CO2 levels
    drawThreshold(800, '#22c55e', 'Medium'); // Green
    drawThreshold(1200, '#ef4444', 'Dangerous'); // Red

  }, [data]);

  // Format time range for display
  const getTimeRange = () => {
    if (!data || data.length === 0) return { from: '', to: '', duration: '' };

    const timestamps = data.map(d => new Date(d.timestamp));
    const earliest = new Date(Math.min(...timestamps));
    const latest = new Date(Math.max(...timestamps));

    const diffHours = Math.round((latest - earliest) / (1000 * 60 * 60));
    const diffDays = Math.round(diffHours / 24);

    let duration = '';
    if (diffDays > 1) {
      duration = `${diffDays} days`;
    } else if (diffHours > 1) {
      duration = `${diffHours} hours`;
    } else {
      duration = 'Last hour';
    }

    return {
      from: earliest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      to: latest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      duration
    };
  };

  const timeRange = getTimeRange();

  return (
    <Card title={`CO2 Levels Over Time (${data?.length || 0} readings)`} className="mb-6">
      <div className="w-full h-80">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full h-full"
        ></canvas>
      </div>
      <div className="mt-3 px-2">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              800 ppm - Medium threshold
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              1200 ppm - Dangerous threshold
            </span>
          </div>
          <div className="text-right">
            <div className="font-medium text-gray-800">{timeRange.duration}</div>
            <div className="text-xs text-gray-500">
              {timeRange.from} → {timeRange.to}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default CO2Graph;
