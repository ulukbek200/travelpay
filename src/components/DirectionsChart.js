import React from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';

const data = [
  { name: 'Круизы', value: 40 },
  { name: 'Туры', value: 35 },
  { name: 'Апартаменты', value: 25 },
];

const COLORS = ['#fca311', '#1d3557', '#a8dadc'];

const DirectionsChart = () => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
      <h3 style={{ color: '#1d3557' }}>Наши направления</h3>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </div>
  );
};

export default DirectionsChart;
