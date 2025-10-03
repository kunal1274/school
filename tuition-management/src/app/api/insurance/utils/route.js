import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth';
import { getDatabase } from '@/lib/models';
import { COLLECTIONS } from '@/lib/models';

// GET /api/insurance/utils - Utility functions for insurance
export async function GET(request) {
  return withAuth(request, async (user) => {
    try {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action');

      switch (action) {
        case 'generate-policy-number':
          return await generatePolicyNumber(request, user);
        case 'generate-transaction-id':
          return await generateTransactionId(request, user);
        case 'generate-claim-number':
          return await generateClaimNumber(request, user);
        case 'calculate-premium-due':
          return await calculatePremiumDueDate(request, user);
        case 'validate-policy-number':
          return await validatePolicyNumber(request, user);
        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action parameter' },
            { status: 400 }
          );
      }

    } catch (error) {
      console.error('Error in insurance utils:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to process utility request' },
        { status: 500 }
      );
    }
  });
}

// Generate unique policy number
async function generatePolicyNumber(request, user) {
  const { searchParams } = new URL(request.url);
  const insurerCode = searchParams.get('insurerCode');
  const year = searchParams.get('year') || new Date().getFullYear();

  if (!insurerCode) {
    return NextResponse.json(
      { success: false, error: 'Insurer code is required' },
      { status: 400 }
    );
  }

  const db = await getDatabase();
  const collection = db.collection(COLLECTIONS.CUSTOMER_POLICIES);

  // Count existing policies for this insurer and year
  const count = await collection.countDocuments({
    policyNumber: { $regex: `^INS-${insurerCode}-${year}-` }
  });

  const policyNumber = `INS-${insurerCode}-${year}-${String(count + 1).padStart(4, '0')}`;

  return NextResponse.json({
    success: true,
    data: {
      policyNumber,
      insurerCode,
      year,
      sequence: count + 1
    }
  });
}

// Generate unique transaction ID
async function generateTransactionId(request, user) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().slice(0, 10);

  const db = await getDatabase();
  const collection = db.collection(COLLECTIONS.POLICY_PAYMENTS);

  const dateStr = date.replace(/-/g, '');
  const count = await collection.countDocuments({
    transactionId: { $regex: `^PAY-${dateStr}-` }
  });

  const transactionId = `PAY-${dateStr}-${String(count + 1).padStart(4, '0')}`;

  return NextResponse.json({
    success: true,
    data: {
      transactionId,
      date,
      sequence: count + 1
    }
  });
}

// Generate unique claim number
async function generateClaimNumber(request, user) {
  const { searchParams } = new URL(request.url);
  const yearMonth = searchParams.get('yearMonth') || new Date().toISOString().slice(0, 7);

  const db = await getDatabase();
  const collection = db.collection(COLLECTIONS.CLAIMS);

  const yearMonthStr = yearMonth.replace('-', '');
  const count = await collection.countDocuments({
    claimNumber: { $regex: `^CLM-${yearMonthStr}-` }
  });

  const claimNumber = `CLM-${yearMonthStr}-${String(count + 1).padStart(4, '0')}`;

  return NextResponse.json({
    success: true,
    data: {
      claimNumber,
      yearMonth,
      sequence: count + 1
    }
  });
}

// Calculate next premium due date
async function calculatePremiumDueDate(request, user) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const frequency = searchParams.get('frequency');

  if (!startDate || !frequency) {
    return NextResponse.json(
      { success: false, error: 'Start date and frequency are required' },
      { status: 400 }
    );
  }

  const currentDate = new Date(startDate);
  let nextDueDate;

  switch (frequency) {
    case 'monthly':
      nextDueDate = new Date(currentDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDueDate = new Date(currentDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDueDate = new Date(currentDate);
      nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      break;
    case 'one-time':
      nextDueDate = null;
      break;
    default:
      return NextResponse.json(
        { success: false, error: 'Invalid frequency. Must be monthly, quarterly, yearly, or one-time' },
        { status: 400 }
      );
  }

  return NextResponse.json({
    success: true,
    data: {
      startDate: currentDate,
      frequency,
      nextDueDate,
      isOneTime: frequency === 'one-time'
    }
  });
}

// Validate policy number format
async function validatePolicyNumber(request, user) {
  const { searchParams } = new URL(request.url);
  const policyNumber = searchParams.get('policyNumber');

  if (!policyNumber) {
    return NextResponse.json(
      { success: false, error: 'Policy number is required' },
      { status: 400 }
    );
  }

  // Policy number format: INS-{INSURER_CODE}-{YYYY}-{seq}
  const policyNumberRegex = /^INS-[A-Z0-9]+-\d{4}-\d{4}$/;
  const isValid = policyNumberRegex.test(policyNumber);

  if (!isValid) {
    return NextResponse.json({
      success: true,
      data: {
        isValid: false,
        error: 'Invalid policy number format. Expected: INS-{INSURER_CODE}-{YYYY}-{seq}'
      }
    });
  }

  // Check if policy number already exists
  const db = await getDatabase();
  const collection = db.collection(COLLECTIONS.CUSTOMER_POLICIES);
  const existingPolicy = await collection.findOne({ policyNumber });

  return NextResponse.json({
    success: true,
    data: {
      isValid: true,
      exists: !!existingPolicy,
      policyNumber,
      message: existingPolicy ? 'Policy number already exists' : 'Policy number is available'
    }
  });
}
