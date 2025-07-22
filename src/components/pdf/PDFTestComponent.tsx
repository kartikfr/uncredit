import React from 'react';
import FinalPDFGenerator from './FinalPDFGenerator';

const PDFTestComponent: React.FC = () => {
  const testData = {
    cardName: "HDFC IRCTC Credit Card",
    totalSavings: 6480,
    joiningFees: 500,
    netSavings: 5980,
    categoryBreakdown: [
      {
        displayName: "Amazon Shopping",
        userAmount: 26000,
        savings: 260,
        percentage: 4.0,
        points_earned: 260,
        chartColor: "#3B82F6"
      },
      {
        displayName: "Flipkart Shopping",
        userAmount: 13000,
        savings: 130,
        percentage: 2.0,
        points_earned: 130,
        chartColor: "#F59E0B"
      }
    ],
    savingsBreakdown: [],
    calcValues: {
      amazon_spends: 26000,
      flipkart_spends: 13000
    },
    calcResult: {
      total_savings_yearly: 6480,
      joining_fees: 500
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">PDF Generation Test</h2>
      <FinalPDFGenerator
        cardName={testData.cardName}
        totalSavings={testData.totalSavings}
        joiningFees={testData.joiningFees}
        netSavings={testData.netSavings}
        categoryBreakdown={testData.categoryBreakdown}
        savingsBreakdown={testData.savingsBreakdown}
        calcValues={testData.calcValues}
        calcResult={testData.calcResult}
        className="bg-blue-500 text-white hover:bg-blue-600"
      />
    </div>
  );
};

export default PDFTestComponent; 