import React from 'react';
import { Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';

const DoctorAnalytics = () => {
  const progressData = [
    { day: 'Mon', score: 20 },
    { day: 'Tue', score: 45 },
    { day: 'Wed', score: 60 },
  ];

  const chartData = {
    labels: progressData.map((data) => data.day),
    datasets: [
      {
        label: 'Progress Score',
        data: progressData.map((data) => data.score),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
      },
    ],
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Doctor Analytics Report', 10, 10);
    doc.save('doctor-analytics.pdf');
    console.log('Downloading...');
  };

  return (
    <div>
      <h2>Doctor Analytics Dashboard</h2>
      <Line data={chartData} />
      <button onClick={handleDownloadPDF}>Download PDF</button>
    </div>
  );
};

export default DoctorAnalytics;