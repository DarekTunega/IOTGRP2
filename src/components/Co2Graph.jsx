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
      const y = height - ((item.co2Level - minValue) / range) * (height - 60) - 10; // More padding for labels

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw threshold lines
    const drawThreshold = (value, color, label) => {
      const y = height - ((value - minValue) / range) * (height - 60) - 10;
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
      ctx.fillText(`${value} ppm - ${label}`, 10, y - 5);
    };

    // Draw threshold lines for different CO2 levels
    drawThreshold(800, '#22c55e', 'Medium threshold'); // Green
    drawThreshold(1200, '#ef4444', 'Dangerous threshold'); // Red

    // Draw time axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';

    // Show time labels at key points
    const labelCount = Math.min(6, sortedData.length); // Max 6 labels
    for (let i = 0; i < labelCount; i++) {
      const dataIndex = Math.floor((i / (labelCount - 1)) * (sortedData.length - 1));
      const x = (dataIndex / (sortedData.length - 1)) * width;
      const timestamp = new Date(sortedData[dataIndex].timestamp);

      const timeLabel = timestamp.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Rotate text for better readability
      ctx.save();
      ctx.translate(x, height - 5);
      ctx.rotate(-Math.PI / 4); // 45 degree rotation
      ctx.fillText(timeLabel, -20, 0);
      ctx.restore();
    }

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
      <div className="mt-2 text-xs text-gray-500 text-center">
        {data && data.length > 0 && (
          <div className="flex justify-between">
            <span>📅 From: {new Date(Math.min(...data.map(d => new Date(d.timestamp)))).toLocaleString()}</span>
            <span>📅 To: {new Date(Math.max(...data.map(d => new Date(d.timestamp)))).toLocaleString()}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default CO2Graph;
