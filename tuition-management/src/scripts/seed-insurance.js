const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

// Database connection
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tuition-management';
const client = new MongoClient(uri);

// Collections
const COLLECTIONS = {
  USERS: 'users',
  CUSTOMERS: 'customers',
  INSURERS: 'insurers',
  POLICIES: 'policies',
  CUSTOMER_POLICIES: 'customer_policies',
  POLICY_PAYMENTS: 'policy_payments',
  CLAIMS: 'claims'
};

// Insurance constants
const INSURANCE_CONSTANTS = {
  POLICY_STATUS: {
    ACTIVE: 'active',
    LAPSED: 'lapsed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'
  },
  PREMIUM_FREQUENCY: {
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly'
  },
  CLAIM_STATUS: {
    DRAFT: 'draft',
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SETTLED: 'settled'
  },
  INSURED_PERSON_TYPES: {
    CUSTOMER: 'Customer',
    STUDENT: 'Student',
    TEACHER: 'Teacher'
  },
  POLICY_PAYMENT_MODES: {
    CASH: 'cash',
    UPI: 'upi',
    CARD: 'card',
    BANK_TRANSFER: 'bank_transfer',
    OTHER: 'other'
  },
  CURRENCIES: {
    INR: 'INR',
    USD: 'USD',
    EUR: 'EUR'
  }
};

async function seedInsuranceData() {
  try {
    await client.connect();
    const db = client.db();
    
    // Get admin user for createdBy fields
    const adminUser = await db.collection(COLLECTIONS.USERS).findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('Admin user not found. Please run the main seed script first.');
      return;
    }
    const adminId = adminUser._id;

    console.log('🌱 Seeding insurance data...');

    // 1. Create Insurers
    console.log('Creating insurers...');
    const insurers = [
      {
        name: 'Life Insurance Corporation of India',
        code: 'LIC',
        contactPerson: 'Rajesh Kumar',
        phone: '+91-9876543210',
        email: 'rajesh.kumar@lic.com',
        address: 'Mumbai, Maharashtra, India',
        notes: 'Leading life insurance provider in India',
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ICICI Prudential Life Insurance',
        code: 'ICICI',
        contactPerson: 'Priya Sharma',
        phone: '+91-9876543211',
        email: 'priya.sharma@iciciprulife.com',
        address: 'Mumbai, Maharashtra, India',
        notes: 'Private sector life insurance company',
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'HDFC Life Insurance',
        code: 'HDFC',
        contactPerson: 'Amit Patel',
        phone: '+91-9876543212',
        email: 'amit.patel@hdfclife.com',
        address: 'Mumbai, Maharashtra, India',
        notes: 'Leading private life insurance company',
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bajaj Allianz General Insurance',
        code: 'BAJAJ',
        contactPerson: 'Sunita Reddy',
        phone: '+91-9876543213',
        email: 'sunita.reddy@bajajallianz.com',
        address: 'Pune, Maharashtra, India',
        notes: 'General insurance provider',
        isActive: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const insurerResult = await db.collection(COLLECTIONS.INSURERS).insertMany(insurers);
    console.log(`✅ Created ${insurerResult.insertedCount} insurers`);

    // 2. Create Policies
    console.log('Creating policies...');
    const policies = [
      {
        insurerId: insurerResult.insertedIds[0], // LIC
        name: 'LIC Term Insurance Plan',
        code: 'LIC-TERM-001',
        description: 'Comprehensive term life insurance with high coverage',
        coverageDetails: 'Death benefit up to ₹1 crore, accidental death benefit, terminal illness benefit',
        termMonths: 240, // 20 years
        premiumAmount: 5000,
        premiumFrequency: INSURANCE_CONSTANTS.PREMIUM_FREQUENCY.YEARLY,
        minCoverAmount: 100000,
        maxCoverAmount: 10000000,
        active: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        insurerId: insurerResult.insertedIds[0], // LIC
        name: 'LIC Endowment Plan',
        code: 'LIC-END-001',
        description: 'Traditional endowment plan with savings component',
        coverageDetails: 'Death benefit, maturity benefit, bonus payments',
        termMonths: 180, // 15 years
        premiumAmount: 12000,
        premiumFrequency: INSURANCE_CONSTANTS.PREMIUM_FREQUENCY.YEARLY,
        minCoverAmount: 50000,
        maxCoverAmount: 5000000,
        active: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        insurerId: insurerResult.insertedIds[1], // ICICI
        name: 'ICICI Prudential Term Plan',
        code: 'ICICI-TERM-001',
        description: 'Pure term insurance with flexible premium payment',
        coverageDetails: 'High death benefit, critical illness rider, disability benefit',
        termMonths: 300, // 25 years
        premiumAmount: 3000,
        premiumFrequency: INSURANCE_CONSTANTS.PREMIUM_FREQUENCY.YEARLY,
        minCoverAmount: 200000,
        maxCoverAmount: 20000000,
        active: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        insurerId: insurerResult.insertedIds[2], // HDFC
        name: 'HDFC Life Savings Plan',
        code: 'HDFC-SAV-001',
        description: 'Unit-linked insurance plan with investment options',
        coverageDetails: 'Life cover, investment growth, flexible premium payment',
        termMonths: 120, // 10 years
        premiumAmount: 8000,
        premiumFrequency: INSURANCE_CONSTANTS.PREMIUM_FREQUENCY.YEARLY,
        minCoverAmount: 100000,
        maxCoverAmount: 10000000,
        active: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        insurerId: insurerResult.insertedIds[3], // Bajaj Allianz
        name: 'Bajaj Allianz Health Insurance',
        code: 'BAJAJ-HEALTH-001',
        description: 'Comprehensive health insurance coverage',
        coverageDetails: 'Hospitalization, pre and post hospitalization, day care procedures',
        termMonths: 12, // 1 year
        premiumAmount: 15000,
        premiumFrequency: INSURANCE_CONSTANTS.PREMIUM_FREQUENCY.YEARLY,
        minCoverAmount: 100000,
        maxCoverAmount: 1000000,
        active: true,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const policyResult = await db.collection(COLLECTIONS.POLICIES).insertMany(policies);
    console.log(`✅ Created ${policyResult.insertedCount} policies`);

    // 3. Get some customers for customer policies
    const customers = await db.collection(COLLECTIONS.CUSTOMERS).find({}).limit(3).toArray();
    if (customers.length === 0) {
      console.log('⚠️ No customers found. Please run the main seed script first.');
      return;
    }

    // 4. Create Customer Policies
    console.log('Creating customer policies...');
    const customerPolicies = [
      {
        policyId: policyResult.insertedIds[0], // LIC Term
        insurerId: insurerResult.insertedIds[0],
        customerId: customers[0]._id,
        insuredPersonId: customers[0]._id,
        insuredPersonModel: INSURANCE_CONSTANTS.INSURED_PERSON_TYPES.CUSTOMER,
        policyNumber: 'INS-LIC-2024-0001',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2044-01-01'),
        status: INSURANCE_CONSTANTS.POLICY_STATUS.ACTIVE,
        sumInsured: 1000000,
        premium: 5000,
        premiumFrequency: INSURANCE_CONSTANTS.PREMIUM_FREQUENCY.YEARLY,
        nextPremiumDueDate: new Date('2025-01-01'),
        notes: 'Primary life insurance coverage',
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        policyId: policyResult.insertedIds[1], // LIC Endowment
        insurerId: insurerResult.insertedIds[0],
        customerId: customers[1]._id,
        insuredPersonId: customers[1]._id,
        insuredPersonModel: INSURANCE_CONSTANTS.INSURED_PERSON_TYPES.CUSTOMER,
        policyNumber: 'INS-LIC-2024-0002',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2039-02-01'),
        status: INSURANCE_CONSTANTS.POLICY_STATUS.ACTIVE,
        sumInsured: 500000,
        premium: 12000,
        premiumFrequency: INSURANCE_CONSTANTS.PREMIUM_FREQUENCY.YEARLY,
        nextPremiumDueDate: new Date('2025-02-01'),
        notes: 'Savings and protection plan',
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        policyId: policyResult.insertedIds[4], // Bajaj Health
        insurerId: insurerResult.insertedIds[3],
        customerId: customers[0]._id, // Use first customer since we only have 2
        insuredPersonId: customers[0]._id,
        insuredPersonModel: INSURANCE_CONSTANTS.INSURED_PERSON_TYPES.CUSTOMER,
        policyNumber: 'INS-BAJAJ-2024-0001',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2025-03-01'),
        status: INSURANCE_CONSTANTS.POLICY_STATUS.ACTIVE,
        sumInsured: 500000,
        premium: 15000,
        premiumFrequency: INSURANCE_CONSTANTS.PREMIUM_FREQUENCY.YEARLY,
        nextPremiumDueDate: new Date('2025-03-01'),
        notes: 'Health insurance coverage',
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const customerPolicyResult = await db.collection(COLLECTIONS.CUSTOMER_POLICIES).insertMany(customerPolicies);
    console.log(`✅ Created ${customerPolicyResult.insertedCount} customer policies`);

    // 5. Create Policy Payments
    console.log('Creating policy payments...');
    const policyPayments = [
      {
        transactionId: 'PAY-20240101-0001',
        customerPolicyId: customerPolicyResult.insertedIds[0],
        payerId: adminId,
        amount: 5000,
        currency: INSURANCE_CONSTANTS.CURRENCIES.INR,
        paymentDate: new Date('2024-01-01'),
        modeOfPayment: INSURANCE_CONSTANTS.POLICY_PAYMENT_MODES.BANK_TRANSFER,
        reference: 'LIC Term Insurance Premium - 2024',
        receiptUrl: 'https://example.com/receipts/lic-term-2024.pdf',
        createdBy: adminId,
        createdAt: new Date()
      },
      {
        transactionId: 'PAY-20240201-0001',
        customerPolicyId: customerPolicyResult.insertedIds[1],
        payerId: adminId,
        amount: 12000,
        currency: INSURANCE_CONSTANTS.CURRENCIES.INR,
        paymentDate: new Date('2024-02-01'),
        modeOfPayment: INSURANCE_CONSTANTS.POLICY_PAYMENT_MODES.UPI,
        reference: 'LIC Endowment Premium - 2024',
        receiptUrl: 'https://example.com/receipts/lic-endowment-2024.pdf',
        createdBy: adminId,
        createdAt: new Date()
      },
      {
        transactionId: 'PAY-20240301-0001',
        customerPolicyId: customerPolicyResult.insertedIds[2],
        payerId: adminId,
        amount: 15000,
        currency: INSURANCE_CONSTANTS.CURRENCIES.INR,
        paymentDate: new Date('2024-03-01'),
        modeOfPayment: INSURANCE_CONSTANTS.POLICY_PAYMENT_MODES.CARD,
        reference: 'Bajaj Health Insurance Premium - 2024',
        receiptUrl: 'https://example.com/receipts/bajaj-health-2024.pdf',
        createdBy: adminId,
        createdAt: new Date()
      }
    ];

    const paymentResult = await db.collection(COLLECTIONS.POLICY_PAYMENTS).insertMany(policyPayments);
    console.log(`✅ Created ${paymentResult.insertedCount} policy payments`);

    // 6. Create Claims
    console.log('Creating claims...');
    const claims = [
      {
        claimNumber: 'CLM-202403-0001',
        customerPolicyId: customerPolicyResult.insertedIds[2], // Health insurance
        claimantId: adminId,
        dateOfEvent: new Date('2024-03-15'),
        amountClaimed: 25000,
        amountApproved: 20000,
        status: INSURANCE_CONSTANTS.CLAIM_STATUS.APPROVED,
        supportingDocs: [
          'https://example.com/docs/medical-bills.pdf',
          'https://example.com/docs/hospital-discharge.pdf'
        ],
        notes: 'Hospitalization claim for minor surgery',
        handledBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        claimNumber: 'CLM-202404-0001',
        customerPolicyId: customerPolicyResult.insertedIds[0], // Term insurance
        claimantId: adminId,
        dateOfEvent: new Date('2024-04-10'),
        amountClaimed: 1000000,
        amountApproved: null,
        status: INSURANCE_CONSTANTS.CLAIM_STATUS.UNDER_REVIEW,
        supportingDocs: [
          'https://example.com/docs/death-certificate.pdf',
          'https://example.com/docs/policy-documents.pdf'
        ],
        notes: 'Death claim under review',
        handledBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const claimResult = await db.collection(COLLECTIONS.CLAIMS).insertMany(claims);
    console.log(`✅ Created ${claimResult.insertedCount} claims`);

    console.log('🎉 Insurance data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Insurers: ${insurerResult.insertedCount}`);
    console.log(`   - Policies: ${policyResult.insertedCount}`);
    console.log(`   - Customer Policies: ${customerPolicyResult.insertedCount}`);
    console.log(`   - Policy Payments: ${paymentResult.insertedCount}`);
    console.log(`   - Claims: ${claimResult.insertedCount}`);

  } catch (error) {
    console.error('❌ Error seeding insurance data:', error);
  } finally {
    await client.close();
  }
}

// Run the seeding function
seedInsuranceData().then(() => {
  console.log('Insurance seeding process completed');
  process.exit(0);
}).catch((error) => {
  console.error('Insurance seeding failed:', error);
  process.exit(1);
});