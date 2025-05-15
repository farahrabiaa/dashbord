import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getRatingsReport } from '../../lib/ratingsApi';
import { getHijriMonthName } from '../../utils/formatters';
import { RatingStars } from '../Rating';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function RatingsReport() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedType, setSelectedType] = useState('vendor');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const types = [
    { id: 'vendor', label: 'البائعين' },
    { id: 'driver', label: 'السائقين' }
  ];

  const years = [
    selectedYear,
    selectedYear - 1,
    selectedYear - 2
  ];

  useEffect(() => {
    fetchReportData();
  }, [selectedYear, selectedType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getRatingsReport(selectedType, selectedYear);
      
      // Create a complete dataset with all months
      const completeData = [];
      for (let i = 1; i <= 12; i++) {
        const monthData = data.find(item => item.month === i);
        if (monthData) {
          completeData.push(monthData);
        } else {
          completeData.push({
            month: i,
            avg_rating: 0,
            count: 0
          });
        }
      }
      
      setReports(completeData);
    } catch (error) {
      console.error('Error fetching ratings report:', error);
      setError('فشل في تحميل تقرير التقييمات. الرجاء المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: reports.map(report => getHijriMonthName(report.month)),
    datasets: [
      {
        label: 'متوسط التقييم',
        data: reports.map(report => report.count > 0 ? report.avg_rating : null),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const report = reports[context.dataIndex];
            return [
              `متوسط التقييم: ${context.parsed.y}`,
              `عدد التقييمات: ${report.count}`
            ];
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-800">
        <h3 className="text-lg font-semibold mb-2">خطأ</h3>
        <p>{error}</p>
        <button
          onClick={fetchReportData}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">تقرير التقييمات الشهري</h2>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {types.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedType === type.id
                    ? 'bg-white shadow text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          متوسط التقييمات الشهرية لعام {selectedYear}
        </h3>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            تفاصيل التقييمات الشهرية
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الشهر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">متوسط التقييم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عدد التقييمات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التقييم</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map(report => (
                <tr key={report.month} className={report.count === 0 ? 'bg-gray-50 text-gray-400' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getHijriMonthName(report.month)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.count > 0 ? report.avg_rating.toFixed(1) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.count > 0 ? (
                      <div className="flex items-center">
                        <RatingStars rating={report.avg_rating} />
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}