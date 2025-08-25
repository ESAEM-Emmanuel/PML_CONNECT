// src/components/ChartCard.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

export default function ChartCard({ title, data, options, type }) {
  let ChartComponent;
  switch (type) {
    case 'bar':
      ChartComponent = Bar;
      break;
    case 'pie':
      ChartComponent = Pie;
      break;
    case 'line':
      ChartComponent = Line;
      break;
    default:
      return null;
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <div className="mt-4 h-64">
          <ChartComponent data={data} options={options} />
        </div>
      </div>
    </div>
  );
}