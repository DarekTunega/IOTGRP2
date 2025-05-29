import React, { useState } from 'react';
import Card from './Card';

function CO2Graph({ data, notifications = [] }) {
  const canvasRef = React.useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // 'all', '7d', '24h'

  // Filter and sort data
  const now = new Date();
  let filteredSortedData = [...data];

  if (timeRange === '7d') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    filteredSortedData = filteredSortedData.filter(item => new Date(item.timestamp) >= sevenDaysAgo);
  } else if (timeRange === '24h') {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    filteredSortedData = filteredSortedData.filter(item => new Date(item.timestamp) >= yesterday);
  }

  filteredSortedData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  React.useEffect(() => {
    if (!canvasRef.current || filteredSortedData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const values = filteredSortedData.map(item => item.co2Level);
    const maxValue = Math.max(...values, 1500);
    const minValue = Math.min(...values, 400);
    const range = maxValue - minValue;

    const pointSpacing = width / (filteredSortedData.length - 1 || 1);
    const points = filteredSortedData.map((item, i) => {
      const x = i * pointSpacing;
      const y = height - ((item.co2Level - minValue) / range) * (height - 20) - 10;
      return { x, y, ...item };
    });

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#4F46E5';
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

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
      ctx.fillStyle = color;
      ctx.font = '10px sans-serif';
      ctx.fillText(`${value} ppm`, 5, y - 5);
    };

    drawThreshold(800, 'green');
    drawThreshold(1200, 'red');

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;

      const closest = points.reduce((prev, curr) =>
        Math.abs(curr.x - mouseX) < Math.abs(prev.x - mouseX) ? curr : prev
      );

      setTooltip({
        graphX: closest.x,
        graphY: closest.y,
        screenX: mouseX,
        screenY: closest.y,
        value: closest.co2Level,
        timestamp: closest.timestamp
      });
    };

    const handleMouseLeave = () => {
      setTooltip(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [filteredSortedData]);

  return (
    <Card title="CO2 Levels Over Time" className="mb-6 relative">
      <div className="flex gap-2 text-sm mb-2">
        <button
          onClick={() => setTimeRange('all')}
          className={`px-2 py-1 rounded ${timeRange === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
        >
          All
        </button>
        <button
          onClick={() => setTimeRange('7d')}
          className={`px-2 py-1 rounded ${timeRange === '7d' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
        >
          Last 7 days
        </button>
        <button
          onClick={() => setTimeRange('24h')}
          className={`px-2 py-1 rounded ${timeRange === '24h' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
        >
          Last 24h
        </button>
      </div>

      <div className="w-full h-80 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="w-full h-full"
        ></canvas>

        {tooltip && (
          <div
            className="absolute bg-white border border-gray-300 text-xs px-2 py-1 rounded shadow"
            style={{
              left: tooltip.screenX,
              top: tooltip.screenY,
              transform: 'translate(-50%, -120%)',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div><strong>{tooltip.value} ppm</strong></div>
            <div>{new Date(tooltip.timestamp).toLocaleDateString()}</div>
            <div>{new Date(tooltip.timestamp).toLocaleTimeString()}</div>
          </div>
        )}
      </div>

      <div className="flex justify-between text-sm text-gray-500 mt-2">
        {filteredSortedData.length > 0 && (
          <>
            <div>{new Date(filteredSortedData[0].timestamp).toLocaleTimeString()}</div>
            <div>{new Date(filteredSortedData[filteredSortedData.length - 1].timestamp).toLocaleTimeString()}</div>
          </>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold mb-2">Notifications</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {notifications.map((n, index) => (
              <li key={index} className="border p-2 rounded bg-gray-50">
                <div className="font-medium text-gray-900">
                  {new Date(n.timestamp).toLocaleDateString()}{' '}
                  {new Date(n.timestamp).toLocaleTimeString()}
                </div>
                <div>{n.message}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default CO2Graph;
