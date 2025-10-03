import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getDatabase } from '@/lib/models';
import { COLLECTIONS } from '@/lib/models';

// GET /api/insurance/reports - Get insurance reports and analytics
export async function GET(request) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const reportType = searchParams.get('type') || 'summary';
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      const insurerId = searchParams.get('insurerId');
      const policyId = searchParams.get('policyId');

      const db = await getDatabase();

      // Build date filter
      const dateFilter = {};
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      // Build additional filters
      const additionalFilter = {};
      if (insurerId) additionalFilter.insurerId = insurerId;
      if (policyId) additionalFilter.policyId = policyId;

      switch (reportType) {
        case 'summary':
          return await getSummaryReport(db, dateFilter, additionalFilter);
        case 'premiums':
          return await getPremiumReport(db, dateFilter, additionalFilter);
        case 'claims':
          return await getClaimsReport(db, dateFilter, additionalFilter);
        case 'policies':
          return await getPoliciesReport(db, dateFilter, additionalFilter);
        case 'insurers':
          return await getInsurersReport(db, dateFilter, additionalFilter);
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid report type' },
            { status: 400 }
          );
      }

    } catch (error) {
      console.error('Error generating insurance report:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to generate insurance report' },
        { status: 500 }
      );
    }
  });
}

// Summary Report - Overall insurance metrics
async function getSummaryReport(db, dateFilter, additionalFilter) {
  const [
    totalInsurers,
    totalPolicies,
    totalCustomerPolicies,
    totalPayments,
    totalClaims,
    activePolicies,
    lapsedPolicies,
    cancelledPolicies,
    expiredPolicies,
    premiumRevenue,
    claimsAmount,
    claimsSettled
  ] = await Promise.all([
    // Total counts
    db.collection(COLLECTIONS.INSURERS).countDocuments({ isActive: true }),
    db.collection(COLLECTIONS.POLICIES).countDocuments({ active: true }),
    db.collection(COLLECTIONS.CUSTOMER_POLICIES).countDocuments({ ...dateFilter, ...additionalFilter }),
    db.collection(COLLECTIONS.POLICY_PAYMENTS).countDocuments({ ...dateFilter, ...additionalFilter }),
    db.collection(COLLECTIONS.CLAIMS).countDocuments({ ...dateFilter, ...additionalFilter }),

    // Policy status counts
    db.collection(COLLECTIONS.CUSTOMER_POLICIES).countDocuments({ status: 'active', ...dateFilter, ...additionalFilter }),
    db.collection(COLLECTIONS.CUSTOMER_POLICIES).countDocuments({ status: 'lapsed', ...dateFilter, ...additionalFilter }),
    db.collection(COLLECTIONS.CUSTOMER_POLICIES).countDocuments({ status: 'cancelled', ...dateFilter, ...additionalFilter }),
    db.collection(COLLECTIONS.CUSTOMER_POLICIES).countDocuments({ status: 'expired', ...dateFilter, ...additionalFilter }),

    // Financial metrics
    db.collection(COLLECTIONS.POLICY_PAYMENTS).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray(),
    db.collection(COLLECTIONS.CLAIMS).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      { $group: { _id: null, total: { $sum: '$amountClaimed' } } }
    ]).toArray(),
    db.collection(COLLECTIONS.CLAIMS).countDocuments({ status: 'settled', ...dateFilter, ...additionalFilter })
  ]);

  const premiumRevenueTotal = premiumRevenue[0]?.total || 0;
  const claimsAmountTotal = claimsAmount[0]?.total || 0;

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        totalInsurers,
        totalPolicies,
        totalCustomerPolicies,
        totalPayments,
        totalClaims,
        activePolicies,
        lapsedPolicies,
        cancelledPolicies,
        expiredPolicies,
        premiumRevenue: premiumRevenueTotal,
        claimsAmount: claimsAmountTotal,
        claimsSettled,
        claimsPending: totalClaims - claimsSettled
      }
    }
  });
}

// Premium Report - Premium collection analytics
async function getPremiumReport(db, dateFilter, additionalFilter) {
  const [
    monthlyPayments,
    paymentMethods,
    topInsurers,
    overduePolicies
  ] = await Promise.all([
    // Monthly premium collection
    db.collection(COLLECTIONS.POLICY_PAYMENTS).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]).toArray(),

    // Payment methods breakdown
    db.collection(COLLECTIONS.POLICY_PAYMENTS).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      {
        $group: {
          _id: '$modeOfPayment',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]).toArray(),

    // Top insurers by premium collection
    db.collection(COLLECTIONS.POLICY_PAYMENTS).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      {
        $lookup: {
          from: COLLECTIONS.CUSTOMER_POLICIES,
          localField: 'customerPolicyId',
          foreignField: '_id',
          as: 'customerPolicy'
        }
      },
      { $unwind: '$customerPolicy' },
      {
        $lookup: {
          from: COLLECTIONS.POLICIES,
          localField: 'customerPolicy.policyId',
          foreignField: '_id',
          as: 'policy'
        }
      },
      { $unwind: '$policy' },
      {
        $lookup: {
          from: COLLECTIONS.INSURERS,
          localField: 'policy.insurerId',
          foreignField: '_id',
          as: 'insurer'
        }
      },
      { $unwind: '$insurer' },
      {
        $group: {
          _id: '$insurer.name',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 }
    ]).toArray(),

    // Overdue policies
    db.collection(COLLECTIONS.CUSTOMER_POLICIES).countDocuments({
      status: 'active',
      nextPremiumDueDate: { $lt: new Date() },
      ...additionalFilter
    })
  ]);

  return NextResponse.json({
    success: true,
    data: {
      monthlyPayments,
      paymentMethods,
      topInsurers,
      overduePolicies
    }
  });
}

// Claims Report - Claims analytics
async function getClaimsReport(db, dateFilter, additionalFilter) {
  const [
    claimsByStatus,
    claimsByMonth,
    topClaimants,
    averageClaimAmount
  ] = await Promise.all([
    // Claims by status
    db.collection(COLLECTIONS.CLAIMS).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountClaimed' }
        }
      }
    ]).toArray(),

    // Claims by month
    db.collection(COLLECTIONS.CLAIMS).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      {
        $group: {
          _id: {
            year: { $year: '$dateOfEvent' },
            month: { $month: '$dateOfEvent' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountClaimed' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]).toArray(),

    // Top claimants
    db.collection(COLLECTIONS.CLAIMS).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      {
        $lookup: {
          from: COLLECTIONS.USERS,
          localField: 'claimantId',
          foreignField: '_id',
          as: 'claimant'
        }
      },
      { $unwind: '$claimant' },
      {
        $group: {
          _id: {
            name: { $concat: ['$claimant.firstName', ' ', '$claimant.lastName'] },
            id: '$claimantId'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountClaimed' }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 }
    ]).toArray(),

    // Average claim amount
    db.collection(COLLECTIONS.CLAIMS).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      {
        $group: {
          _id: null,
          averageAmount: { $avg: '$amountClaimed' },
          maxAmount: { $max: '$amountClaimed' },
          minAmount: { $min: '$amountClaimed' }
        }
      }
    ]).toArray()
  ]);

  return NextResponse.json({
    success: true,
    data: {
      claimsByStatus,
      claimsByMonth,
      topClaimants,
      averageClaimAmount: averageClaimAmount[0] || { averageAmount: 0, maxAmount: 0, minAmount: 0 }
    }
  });
}

// Policies Report - Policy performance analytics
async function getPoliciesReport(db, dateFilter, additionalFilter) {
  const [
    policiesByInsurer,
    policiesByStatus,
    policyPerformance
  ] = await Promise.all([
    // Policies by insurer
    db.collection(COLLECTIONS.CUSTOMER_POLICIES).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      {
        $lookup: {
          from: COLLECTIONS.POLICIES,
          localField: 'policyId',
          foreignField: '_id',
          as: 'policy'
        }
      },
      { $unwind: '$policy' },
      {
        $lookup: {
          from: COLLECTIONS.INSURERS,
          localField: 'policy.insurerId',
          foreignField: '_id',
          as: 'insurer'
        }
      },
      { $unwind: '$insurer' },
      {
        $group: {
          _id: '$insurer.name',
          count: { $sum: 1 },
          totalPremium: { $sum: '$premium' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray(),

    // Policies by status
    db.collection(COLLECTIONS.CUSTOMER_POLICIES).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray(),

    // Policy performance metrics
    db.collection(COLLECTIONS.CUSTOMER_POLICIES).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      {
        $group: {
          _id: null,
          totalPolicies: { $sum: 1 },
          activePolicies: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          lapsedPolicies: {
            $sum: { $cond: [{ $eq: ['$status', 'lapsed'] }, 1, 0] }
          },
          averagePremium: { $avg: '$premium' }
        }
      }
    ]).toArray()
  ]);

  return NextResponse.json({
    success: true,
    data: {
      policiesByInsurer,
      policiesByStatus,
      policyPerformance: policyPerformance[0] || {
        totalPolicies: 0,
        activePolicies: 0,
        lapsedPolicies: 0,
        averagePremium: 0
      }
    }
  });
}

// Insurers Report - Insurer performance analytics
async function getInsurersReport(db, dateFilter, additionalFilter) {
  const [
    insurerStats,
    insurerPolicies,
    insurerClaims
  ] = await Promise.all([
    // Insurer statistics
    db.collection(COLLECTIONS.INSURERS).aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: COLLECTIONS.POLICIES,
          localField: '_id',
          foreignField: 'insurerId',
          as: 'policies'
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.CUSTOMER_POLICIES,
          localField: 'policies._id',
          foreignField: 'policyId',
          as: 'customerPolicies'
        }
      },
      {
        $addFields: {
          totalPolicies: { $size: '$policies' },
          totalCustomerPolicies: { $size: '$customerPolicies' },
          activeCustomerPolicies: {
            $size: {
              $filter: {
                input: '$customerPolicies',
                cond: { $eq: ['$$this.status', 'active'] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          totalPolicies: 1,
          totalCustomerPolicies: 1,
          activeCustomerPolicies: 1
        }
      }
    ]).toArray(),

    // Policies per insurer
    db.collection(COLLECTIONS.POLICIES).aggregate([
      { $match: { active: true, ...additionalFilter } },
      {
        $lookup: {
          from: COLLECTIONS.INSURERS,
          localField: 'insurerId',
          foreignField: '_id',
          as: 'insurer'
        }
      },
      { $unwind: '$insurer' },
      {
        $group: {
          _id: '$insurer.name',
          policies: {
            $push: {
              name: '$name',
              premiumAmount: '$premiumAmount',
              termMonths: '$termMonths'
            }
          }
        }
      }
    ]).toArray(),

    // Claims per insurer
    db.collection(COLLECTIONS.CLAIMS).aggregate([
      { $match: { ...dateFilter, ...additionalFilter } },
      {
        $lookup: {
          from: COLLECTIONS.CUSTOMER_POLICIES,
          localField: 'customerPolicyId',
          foreignField: '_id',
          as: 'customerPolicy'
        }
      },
      { $unwind: '$customerPolicy' },
      {
        $lookup: {
          from: COLLECTIONS.POLICIES,
          localField: 'customerPolicy.policyId',
          foreignField: '_id',
          as: 'policy'
        }
      },
      { $unwind: '$policy' },
      {
        $lookup: {
          from: COLLECTIONS.INSURERS,
          localField: 'policy.insurerId',
          foreignField: '_id',
          as: 'insurer'
        }
      },
      { $unwind: '$insurer' },
      {
        $group: {
          _id: '$insurer.name',
          totalClaims: { $sum: 1 },
          totalClaimAmount: { $sum: '$amountClaimed' },
          settledClaims: {
            $sum: { $cond: [{ $eq: ['$status', 'settled'] }, 1, 0] }
          }
        }
      }
    ]).toArray()
  ]);

  return NextResponse.json({
    success: true,
    data: {
      insurerStats,
      insurerPolicies,
      insurerClaims
    }
  });
}
