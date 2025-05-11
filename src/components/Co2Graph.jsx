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

    // Find min and max values for scaling
    const reversedData = [...data].reverse();
    const values = reversedData.map(item => item.co2Level);
    const maxValue = Math.max(...values, 1500); // Set minimum maximum to 1500 for better visualization
    const minValue = Math.min(...values, 400); // Set maximum minimum to 400 for better visualization
    const range = maxValue - minValue;

    // Set up styles
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#4F46E5'; // Indigo color

    // Draw the line
    ctx.beginPath();

    reversedData.forEach((item, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((item.co2Level - minValue) / range) * (height - 20) - 10; // Leave some padding

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw threshold lines
    const drawThreshold = (value, color) => {
      const y = height - ((value - minValue) / range) * (height - 20) - 10;
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
      ctx.font = '10px sans-serif';
      ctx.fillText(`${value} ppm`, 5, y - 5);
    };

    // Draw threshold lines for different CO2 levels
    drawThreshold(800, 'green'); // Low-Medium threshold
    drawThreshold(1200, 'red'); // Medium-High threshold

  }, [data]);

  return (
    <Card title="CO2 Levels Over Time" className="mb-6">
      <div className="w-full h-80">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full h-full"
        ></canvas>
      </div>
      <div className="flex justify-between text-sm text-gray-500 mt-2">
        {data.length > 0 && (
          <>
            <div>
              {new Date(data[0].timestamp).toLocaleTimeString()}
            </div>
            <div>
              {new Date(data[data.length - 1].timestamp).toLocaleTimeString()}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

export default CO2Graph;
