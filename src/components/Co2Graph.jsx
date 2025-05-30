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

    // Better dynamic scaling based on actual data
    const dataMax = Math.max(...values);
    const dataMin = Math.min(...values);

    // Set reasonable bounds with some padding
    const padding = (dataMax - dataMin) * 0.1; // 10% padding
    const maxValue = Math.max(dataMax + padding, 1500); // Minimum ceiling of 1500
    const minValue = Math.max(dataMin - padding, 350); // Minimum floor of 350

    // If the range is too small, expand it for better visibility
    const range = maxValue - minValue;
    const adjustedRange = Math.max(range, 400); // Minimum range of 400 ppm

    const finalMaxValue = minValue + adjustedRange;
    const finalRange = adjustedRange;

    // Set up styles
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#4F46E5'; // Indigo color

    // Draw the line
    ctx.beginPath();

    sortedData.forEach((item, index) => {
      const x = (index / (sortedData.length - 1)) * width;
      const y = height - ((item.co2Level - minValue) / finalRange) * (height - 20) - 10;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw threshold lines (without text labels)
    const drawThreshold = (value, color) => {
      // Only draw if the threshold is within our visible range
      if (value >= minValue && value <= finalMaxValue) {
        const y = height - ((value - minValue) / finalRange) * (height - 20) - 10;
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    };

    // Draw threshold lines for different CO2 levels (no text)
    drawThreshold(800, '#22c55e'); // Green - Medium threshold
    drawThreshold(1200, '#ef4444'); // Red - Dangerous threshold

  }, [data]);

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
      {data && data.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          <div className="flex justify-between">
            <span>📅 From: {new Date(Math.min(...data.map(d => new Date(d.timestamp)))).toLocaleString()}</span>
            <span>📅 To: {new Date(Math.max(...data.map(d => new Date(d.timestamp)))).toLocaleString()}</span>
          </div>
        </div>
      )}
    </Card>
  );
}

export default CO2Graph;
