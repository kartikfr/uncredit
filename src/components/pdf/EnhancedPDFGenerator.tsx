import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface EnhancedPDFGeneratorProps {
  cardName: string;
  totalSavings: number;
  joiningFees: number;
  netSavings: number;
  categoryBreakdown: any[];
  savingsBreakdown: any[];
  calcValues: Record<string, number>;
  calcResult: any;
  className?: string;
}

const EnhancedPDFGenerator: React.FC<EnhancedPDFGeneratorProps> = ({ 
  cardName, 
  totalSavings, 
  joiningFees, 
  netSavings, 
  categoryBreakdown, 
  savingsBreakdown, 
  calcValues, 
  calcResult, 
  className 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  // Prepare chart data
  const pieChartData = {
    labels: categoryBreakdown.map(item => item.displayName),
    datasets: [
      {
        data: categoryBreakdown.map(item => item.savings),
        backgroundColor: categoryBreakdown.map(item => item.chartColor),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const barChartData = {
    labels: categoryBreakdown.map(item => item.displayName),
    datasets: [
      {
        label: 'Savings',
        data: categoryBreakdown.map(item => item.savings),
        backgroundColor: categoryBreakdown.map(item => item.chartColor),
        borderColor: categoryBreakdown.map(item => item.chartColor),
        borderWidth: 1,
      },
      {
        label: 'Amount Spent',
        data: categoryBreakdown.map(item => item.userAmount),
        backgroundColor: 'rgba(156, 163, 175, 0.5)',
        borderColor: 'rgba(156, 163, 175, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const pieChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  const generatePDF = async () => {
    if (!pdfRef.current) {
      console.error('PDF reference not found');
      return;
    }

    setIsGenerating(true);
    try {
      // Wait for charts to render properly
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 210 * 3.779527559, // Convert mm to pixels (210mm A4 width)
        height: 297 * 3.779527559, // Convert mm to pixels (297mm A4 height)
        scrollX: 0,
        scrollY: 0,
        windowWidth: 210 * 3.779527559,
        windowHeight: 297 * 3.779527559,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `card-savings-${cardName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF generated successfully:', fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <>
      <Button
        onClick={generatePDF}
        disabled={isGenerating}
        variant="outline"
        size="sm"
        className={`flex items-center space-x-2 ${className}`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span>Download PDF</span>
          </>
        )}
      </Button>

      {/* Hidden PDF Content */}
      <div 
        ref={pdfRef} 
        className="fixed top-0 left-0 w-[210mm] h-[297mm] bg-white p-8 opacity-0 pointer-events-none"
        style={{ 
          transform: 'scale(0.5)', 
          transformOrigin: 'top left',
          zIndex: -9999,
          position: 'absolute',
          left: '-9999px',
          top: '-9999px'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Card Savings Report</h1>
          <h2 className="text-xl text-gray-600 mb-1">{cardName}</h2>
          <p className="text-sm text-gray-500">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Executive Summary */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Executive Summary
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-semibold text-green-800 mb-1">Total Annual Savings</h4>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
              <p className="text-xs text-green-600">Per year</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="text-sm font-semibold text-red-800 mb-1">Joining Fees</h4>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(joiningFees)}</p>
              <p className="text-xs text-red-600">One-time</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-1">Net Savings</h4>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(netSavings)}</p>
              <p className="text-xs text-blue-600">After fees</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Visual Analysis
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Savings Distribution
              </h4>
              <div className="h-48">
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Spending vs Savings
              </h4>
              <div className="h-48">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryBreakdown.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
              Category-wise Breakdown
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount Spent</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Savings</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Percentage</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Points Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map((item, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{item.displayName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(item.userAmount)}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-semibold">{formatCurrency(item.savings)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatPercentage(item.percentage)}</td>
                      <td className="px-4 py-3 text-sm text-purple-600 font-medium">
                        {(item.points_earned || 0).toLocaleString()} R.P
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Spending Details */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Your Spending Details
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Monthly Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Annual Amount</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(calcValues)
                  .filter(([_, value]) => value > 0)
                  .map(([key, value], index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(value)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(value * 12)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-200 pb-2">
            Key Insights
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Best Performing Category
              </h4>
              {categoryBreakdown.length > 0 && (
                <div>
                  <p className="text-lg font-bold text-yellow-700">
                    {categoryBreakdown[0].displayName}
                  </p>
                  <p className="text-sm text-yellow-600">
                    {formatCurrency(categoryBreakdown[0].savings)} savings
                  </p>
                </div>
              )}
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">ROI Analysis</h4>
              <p className="text-lg font-bold text-blue-700">
                {joiningFees > 0 ? ((netSavings / joiningFees) * 100).toFixed(1) : 'N/A'}%
              </p>
              <p className="text-sm text-blue-600">Return on joining fees</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t border-gray-200">
          <p>Generated by Card Genius - Your trusted credit card comparison platform</p>
          <p className="mt-1">This report is based on your provided spending patterns and current card benefits</p>
        </div>
      </div>
    </>
  );
};

export default EnhancedPDFGenerator; 