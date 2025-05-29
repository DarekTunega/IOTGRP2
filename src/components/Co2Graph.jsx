import React, { useState } from 'react';
import Card from './Card';

function CO2Graph({ data = [], notifications = [] }) {
  const canvasRef = React.useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day');

  const formatDate = (date) => date.toISOString().split('T')[0];

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - (viewMode === 'week' ? 7 : 1));
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + (viewMode === 'week' ? 7 : 1));
    setSelectedDate(next);
  };

  let filteredSortedData = [];
  let dateRangeLabel = '';

  if (viewMode === 'day') {
    const dayString = formatDate(selectedDate);
    filteredSortedData = data
      .filter(item => item.timestamp.startsWith(dayString))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    dateRangeLabel = selectedDate.toLocaleDateString();
  } else if (viewMode === 'week') {
    const endDate = new Date(selectedDate);
    const startDate = new Date(selectedDate);
    startDate.setDate(endDate.getDate() - 6);

    filteredSortedData = data
      .filter(item => {
        const date = new Date(item.timestamp);
        return date >= startDate && date <= endDate;
      })
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    dateRangeLabel = `${startDate.toLocaleDateString()} – ${endDate.toLocaleDateString()}`;
  }

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 300;

    ctx.clearRect(0, 0, width, height);

    if (filteredSortedData.length === 0) return;

    const values = filteredSortedData.map(item => item.co2Level);
    const maxValue = Math.max(...values, 1500);
    const minValue = Math.min(...values, 400);
    const range = maxValue - minValue;

    const pointSpacing = filteredSortedData.length <= 1 ? width / 2 : width / (filteredSortedData.length - 1);
    const points = filteredSortedData.map((item, i) => {
      const x = i * pointSpacing;
      const y = height - ((item.co2Level - minValue) / range) * (height - 20) - 10;
      return { x, y, ...item };
    });

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
    <Card title="CO2 Levels">
      <div className="flex justify-center gap-2 text-sm mb-2">
        <button
          onClick={() => setViewMode('day')}
          className={`px-3 py-1 rounded ${viewMode === 'day' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          Today
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
        >
          Last 7 Days
        </button>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm mb-4">
        <button onClick={goToPreviousDay} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">←</button>
        <div className="font-medium text-gray-700">{dateRangeLabel}</div>
        <button onClick={goToNextDay} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300">→</button>
      </div>

      <div className="relative overflow-hidden" style={{ height: '300px' }}>
        <canvas ref={canvasRef} className="w-full h-full" />
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

      {filteredSortedData.length === 0 && (
        <div className="text-center text-gray-400 text-sm mt-4">
          No CO₂ data for this {viewMode === 'day' ? 'day' : 'week'}.
        </div>
      )}

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
                  {new Date(n.timestamp).toLocaleDateString()} {new Date(n.timestamp).toLocaleTimeString()}
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
