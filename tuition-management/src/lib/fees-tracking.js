// Comprehensive fees tracking system

export const FEE_STATUS = {
  PAID: 'paid',
  PENDING: 'pending',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
  CHEQUE: 'cheque',
  OTHER: 'other'
};

export const FEE_TYPES = {
  TUITION: 'tuition',
  TRANSPORT: 'transport',
  EXAM: 'exam',
  LIBRARY: 'library',
  SPORTS: 'sports',
  OTHER: 'other'
};

// Calculate fee statistics
export function calculateFeeStatistics(fees) {
  const stats = {
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    cancelled: 0,
    byMethod: {},
    byType: {},
    monthly: {},
    yearly: {}
  };

  fees.forEach(fee => {
    // Total amount
    stats.total += fee.amount || 0;

    // Status counts
    switch (fee.status) {
      case FEE_STATUS.PAID:
        stats.paid += fee.amount || 0;
        break;
      case FEE_STATUS.PENDING:
        stats.pending += fee.amount || 0;
        break;
      case FEE_STATUS.OVERDUE:
        stats.overdue += fee.amount || 0;
        break;
      case FEE_STATUS.CANCELLED:
        stats.cancelled += fee.amount || 0;
        break;
    }

    // Payment method breakdown
    const method = fee.modeOfPayment || 'other';
    stats.byMethod[method] = (stats.byMethod[method] || 0) + (fee.amount || 0);

    // Fee type breakdown
    const type = fee.feeType || 'other';
    stats.byType[type] = (stats.byType[type] || 0) + (fee.amount || 0);

    // Monthly breakdown
    if (fee.date) {
      const month = new Date(fee.date).toISOString().substring(0, 7); // YYYY-MM
      stats.monthly[month] = (stats.monthly[month] || 0) + (fee.amount || 0);
    }

    // Yearly breakdown
    if (fee.date) {
      const year = new Date(fee.date).getFullYear();
      stats.yearly[year] = (stats.yearly[year] || 0) + (fee.amount || 0);
    }
  });

  return stats;
}

// Generate fee reports
export function generateFeeReport(fees, options = {}) {
  const {
    startDate = null,
    endDate = null,
    payerType = null,
    status = null,
    groupBy = 'month'
  } = options;

  // Filter fees based on criteria
  let filteredFees = fees;

  if (startDate) {
    filteredFees = filteredFees.filter(fee => new Date(fee.date) >= new Date(startDate));
  }

  if (endDate) {
    filteredFees = filteredFees.filter(fee => new Date(fee.date) <= new Date(endDate));
  }

  if (payerType) {
    filteredFees = filteredFees.filter(fee => fee.payerType === payerType);
  }

  if (status) {
    filteredFees = filteredFees.filter(fee => fee.status === status);
  }

  // Group fees
  const grouped = {};
  filteredFees.forEach(fee => {
    let key;
    switch (groupBy) {
      case 'month':
        key = new Date(fee.date).toISOString().substring(0, 7);
        break;
      case 'year':
        key = new Date(fee.date).getFullYear().toString();
        break;
      case 'payerType':
        key = fee.payerType;
        break;
      case 'status':
        key = fee.status;
        break;
      default:
        key = 'all';
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(fee);
  });

  // Calculate statistics for each group
  const report = {};
  Object.entries(grouped).forEach(([key, groupFees]) => {
    report[key] = {
      fees: groupFees,
      statistics: calculateFeeStatistics(groupFees),
      count: groupFees.length
    };
  });

  return report;
}

// Check for overdue fees
export function checkOverdueFees(fees) {
  const today = new Date();
  const overdueFees = [];

  fees.forEach(fee => {
    if (fee.status === FEE_STATUS.PENDING && fee.dueDate) {
      const dueDate = new Date(fee.dueDate);
      if (dueDate < today) {
        overdueFees.push({
          ...fee,
          daysOverdue: Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24))
        });
      }
    }
  });

  return overdueFees.sort((a, b) => b.daysOverdue - a.daysOverdue);
}

// Calculate payment trends
export function calculatePaymentTrends(fees, period = 'month') {
  const trends = {};
  const now = new Date();

  fees.forEach(fee => {
    if (fee.status === FEE_STATUS.PAID && fee.date) {
      const feeDate = new Date(fee.date);
      let key;

      switch (period) {
        case 'day':
          key = feeDate.toISOString().substring(0, 10);
          break;
        case 'week':
          const weekStart = new Date(feeDate);
          weekStart.setDate(feeDate.getDate() - feeDate.getDay());
          key = weekStart.toISOString().substring(0, 10);
          break;
        case 'month':
          key = feeDate.toISOString().substring(0, 7);
          break;
        case 'year':
          key = feeDate.getFullYear().toString();
          break;
        default:
          key = 'all';
      }

      if (!trends[key]) {
        trends[key] = {
          amount: 0,
          count: 0,
          date: key
        };
      }

      trends[key].amount += fee.amount || 0;
      trends[key].count += 1;
    }
  });

  return Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));
}

// Generate fee reminders
export function generateFeeReminders(fees, daysBeforeDue = 7) {
  const today = new Date();
  const reminderDate = new Date(today);
  reminderDate.setDate(today.getDate() + daysBeforeDue);

  const reminders = [];

  fees.forEach(fee => {
    if (fee.status === FEE_STATUS.PENDING && fee.dueDate) {
      const dueDate = new Date(fee.dueDate);
      
      // Check if fee is due within the reminder period
      if (dueDate <= reminderDate && dueDate >= today) {
        reminders.push({
          ...fee,
          daysUntilDue: Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)),
          reminderType: dueDate <= today ? 'overdue' : 'upcoming'
        });
      }
    }
  });

  return reminders.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

// Export fees data for external use
export function exportFeesData(fees, format = 'json') {
  const exportData = fees.map(fee => ({
    transactionId: fee.transactionId,
    payerType: fee.payerType,
    payerName: fee.payeeName,
    payerPhone: fee.payeePhone,
    amount: fee.amount,
    currency: fee.currency,
    modeOfPayment: fee.modeOfPayment,
    status: fee.status,
    date: fee.date,
    dueDate: fee.dueDate,
    reference: fee.reference,
    createdAt: fee.createdAt
  }));

  switch (format) {
    case 'csv':
      return convertToCSV(exportData);
    case 'json':
      return JSON.stringify(exportData, null, 2);
    default:
      return exportData;
  }
}

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n');

  return csvContent;
}

// Fee analytics and insights
export function generateFeeInsights(fees) {
  const stats = calculateFeeStatistics(fees);
  const trends = calculatePaymentTrends(fees, 'month');
  const overdueFees = checkOverdueFees(fees);
  const reminders = generateFeeReminders(fees);

  const insights = {
    summary: {
      totalRevenue: stats.total,
      collectionRate: stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(2) : 0,
      pendingAmount: stats.pending,
      overdueAmount: stats.overdue,
      totalFees: fees.length,
      overdueCount: overdueFees.length
    },
    trends: {
      monthly: trends,
      topPaymentMethod: Object.entries(stats.byMethod).reduce((a, b) => stats.byMethod[a[0]] > stats.byMethod[b[0]] ? a : b, ['', 0])[0],
      topFeeType: Object.entries(stats.byType).reduce((a, b) => stats.byType[a[0]] > stats.byType[b[0]] ? a : b, ['', 0])[0]
    },
    alerts: {
      overdueFees: overdueFees.slice(0, 10), // Top 10 overdue
      upcomingReminders: reminders.slice(0, 10) // Next 10 reminders
    }
  };

  return insights;
}
