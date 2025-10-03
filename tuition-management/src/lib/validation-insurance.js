import { ObjectId } from 'mongodb';
import { INSURANCE_CONSTANTS } from './models.js';

/**
 * Insurance validation functions
 */

// Generic validation helper
function validateField(value, rules) {
  const errors = [];

  // Required check
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push(rules.message || 'This field is required');
    return errors;
  }

  // Skip other validations if value is empty and not required
  if (!rules.required && (value === undefined || value === null || value === '')) {
    return errors;
  }

  // Type validation
  if (rules.type) {
    switch (rules.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push('Must be a string');
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push('Must be a number');
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push('Must be a boolean');
        }
        break;
      case 'date':
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          errors.push('Must be a valid date');
        }
        break;
      case 'objectId':
        if (!ObjectId.isValid(value)) {
          errors.push('Must be a valid ObjectId');
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          errors.push('Must be an array');
        }
        break;
    }
  }

  // String validations
  if (rules.type === 'string' && typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Must be at least ${rules.minLength} characters long`);
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`Must be no more than ${rules.maxLength} characters long`);
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(rules.patternMessage || 'Invalid format');
    }
  }

  // Number validations
  if (rules.type === 'number' && typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`Must be at least ${rules.min}`);
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`Must be no more than ${rules.max}`);
    }
  }

  // Enum validation
  if (rules.enum && !rules.enum.includes(value)) {
    errors.push(`Must be one of: ${rules.enum.join(', ')}`);
  }

  return errors;
}

// Insurer validation
export function validateInsurerData(data) {
  const errors = {};
  const schema = {
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 100,
      message: 'Insurer name is required and must be 2-100 characters'
    },
    code: {
      required: false,
      type: 'string',
      maxLength: 20,
      pattern: /^[A-Z0-9_\s-]+$/,
      patternMessage: 'Code must contain only uppercase letters, numbers, spaces, hyphens, and underscores'
    },
    contactPerson: {
      required: false,
      type: 'string',
      maxLength: 100
    },
    phone: {
      required: false,
      type: 'string',
      pattern: /^[\+]?[0-9][\d]{0,15}$/,
      patternMessage: 'Phone number must be a valid format'
    },
    email: {
      required: false,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      patternMessage: 'Email must be a valid email address'
    },
    address: {
      required: false,
      type: 'string',
      maxLength: 500
    },
    notes: {
      required: false,
      type: 'string',
      maxLength: 1000
    },
    isActive: {
      required: false,
      type: 'boolean'
    }
  };

  for (const [field, rules] of Object.entries(schema)) {
    const fieldErrors = validateField(data[field], rules);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0]; // Return first error
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Policy validation
export function validatePolicyData(data) {
  const errors = {};
  const schema = {
    insurerId: {
      required: true,
      type: 'objectId',
      message: 'Insurer ID is required'
    },
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 100,
      message: 'Policy name is required and must be 2-100 characters'
    },
    code: {
      required: false,
      type: 'string',
      maxLength: 20,
      pattern: /^[A-Z0-9_\s-]+$/,
      patternMessage: 'Code must contain only uppercase letters, numbers, spaces, hyphens, and underscores'
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 1000
    },
    coverageDetails: {
      required: false,
      type: 'string',
      maxLength: 2000
    },
    termMonths: {
      required: false,
      type: 'number',
      min: 1,
      max: 1200,
      message: 'Term must be between 1 and 1200 months'
    },
    premiumAmount: {
      required: true,
      type: 'number',
      min: 0,
      message: 'Premium amount must be a positive number'
    },
    premiumFrequency: {
      required: false,
      type: 'string',
      enum: Object.values(INSURANCE_CONSTANTS.PREMIUM_FREQUENCY),
      message: 'Premium frequency must be monthly, quarterly, or yearly'
    },
    minCoverAmount: {
      required: false,
      type: 'number',
      min: 0
    },
    maxCoverAmount: {
      required: false,
      type: 'number',
      min: 0
    },
    active: {
      required: false,
      type: 'boolean'
    }
  };

  for (const [field, rules] of Object.entries(schema)) {
    const fieldErrors = validateField(data[field], rules);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0];
    }
  }

  // Business rule: maxCoverAmount should be >= minCoverAmount
  if (data.minCoverAmount && data.maxCoverAmount && data.maxCoverAmount < data.minCoverAmount) {
    errors.maxCoverAmount = 'Maximum cover amount must be greater than or equal to minimum cover amount';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Customer Policy validation
export function validateCustomerPolicyData(data) {
  const errors = {};
  const schema = {
    policyId: {
      required: true,
      type: 'objectId',
      message: 'Policy ID is required'
    },
    insurerId: {
      required: true,
      type: 'objectId',
      message: 'Insurer ID is required'
    },
    customerId: {
      required: true,
      type: 'objectId',
      message: 'Customer ID is required'
    },
    insuredPersonId: {
      required: false,
      type: 'objectId'
    },
    insuredPersonModel: {
      required: false,
      type: 'string',
      enum: Object.values(INSURANCE_CONSTANTS.INSURED_PERSON_TYPES)
    },
    policyNumber: {
      required: true,
      type: 'string',
      minLength: 5,
      maxLength: 50,
      message: 'Policy number is required and must be 5-50 characters'
    },
    startDate: {
      required: false,
      type: 'date'
    },
    endDate: {
      required: false,
      type: 'date'
    },
    status: {
      required: false,
      type: 'string',
      enum: Object.values(INSURANCE_CONSTANTS.POLICY_STATUS)
    },
    sumInsured: {
      required: false,
      type: 'number',
      min: 0
    },
    premium: {
      required: false,
      type: 'number',
      min: 0
    },
    premiumFrequency: {
      required: false,
      type: 'string',
      enum: Object.values(INSURANCE_CONSTANTS.PREMIUM_FREQUENCY)
    },
    nextPremiumDueDate: {
      required: false,
      type: 'date'
    },
    notes: {
      required: false,
      type: 'string',
      maxLength: 1000
    }
  };

  for (const [field, rules] of Object.entries(schema)) {
    const fieldErrors = validateField(data[field], rules);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0];
    }
  }

  // Business rule: endDate should be >= startDate
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (endDate < startDate) {
      errors.endDate = 'End date must be greater than or equal to start date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Policy Payment validation
export function validatePolicyPaymentData(data) {
  const errors = {};
  const schema = {
    transactionId: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 50,
      message: 'Transaction ID is required and must be 10-50 characters'
    },
    customerPolicyId: {
      required: true,
      type: 'objectId',
      message: 'Customer Policy ID is required'
    },
    payerId: {
      required: false,
      type: 'objectId'
    },
    amount: {
      required: true,
      type: 'number',
      min: 0.01,
      message: 'Amount must be a positive number greater than 0'
    },
    currency: {
      required: false,
      type: 'string',
      enum: Object.values(INSURANCE_CONSTANTS.CURRENCIES)
    },
    paymentDate: {
      required: false,
      type: 'date'
    },
    modeOfPayment: {
      required: false,
      type: 'string',
      enum: Object.values(INSURANCE_CONSTANTS.POLICY_PAYMENT_MODES)
    },
    reference: {
      required: false,
      type: 'string',
      maxLength: 200
    },
    receiptUrl: {
      required: false,
      type: 'string',
      maxLength: 500
    }
  };

  for (const [field, rules] of Object.entries(schema)) {
    const fieldErrors = validateField(data[field], rules);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0];
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Claim validation
export function validateClaimData(data) {
  const errors = {};
  const schema = {
    claimNumber: {
      required: true,
      type: 'string',
      minLength: 10,
      maxLength: 50,
      message: 'Claim number is required and must be 10-50 characters'
    },
    customerPolicyId: {
      required: true,
      type: 'objectId',
      message: 'Customer Policy ID is required'
    },
    claimantId: {
      required: false,
      type: 'objectId'
    },
    dateOfEvent: {
      required: false,
      type: 'date'
    },
    amountClaimed: {
      required: false,
      type: 'number',
      min: 0
    },
    amountApproved: {
      required: false,
      type: 'number',
      min: 0
    },
    status: {
      required: false,
      type: 'string',
      enum: Object.values(INSURANCE_CONSTANTS.CLAIM_STATUS)
    },
    supportingDocs: {
      required: false,
      type: 'array'
    },
    notes: {
      required: false,
      type: 'string',
      maxLength: 2000
    },
    handledBy: {
      required: false,
      type: 'objectId'
    }
  };

  for (const [field, rules] of Object.entries(schema)) {
    const fieldErrors = validateField(data[field], rules);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors[0];
    }
  }

  // Business rule: amountApproved should be <= amountClaimed
  if (data.amountClaimed && data.amountApproved && data.amountApproved > data.amountClaimed) {
    errors.amountApproved = 'Approved amount cannot be greater than claimed amount';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Business rule validations
export function validateBusinessRules(data, entityType) {
  const errors = {};

  switch (entityType) {
    case 'customerPolicy':
      // Validate that policy is active when creating customer policy
      if (data.policyId && !data.policyActive) {
        errors.policyId = 'Cannot assign inactive policy to customer';
      }
      break;

    case 'policyPayment':
      // Validate that customer policy is active when making payment
      if (data.customerPolicyId && data.customerPolicyStatus && 
          !['active'].includes(data.customerPolicyStatus)) {
        errors.customerPolicyId = 'Cannot make payment for inactive, lapsed, cancelled, or expired policy';
      }
      break;

    case 'claim':
      // Validate that customer policy is active when creating claim
      if (data.customerPolicyId && data.customerPolicyStatus && 
          !['active'].includes(data.customerPolicyStatus)) {
        errors.customerPolicyId = 'Cannot create claim for inactive, lapsed, cancelled, or expired policy';
      }
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Comprehensive validation function
export function validateInsuranceData(data, entityType) {
  let validation = { isValid: true, errors: {} };

  // Basic field validation
  switch (entityType) {
    case 'insurer':
      validation = validateInsurerData(data);
      break;
    case 'policy':
      validation = validatePolicyData(data);
      break;
    case 'customerPolicy':
      validation = validateCustomerPolicyData(data);
      break;
    case 'policyPayment':
      validation = validatePolicyPaymentData(data);
      break;
    case 'claim':
      validation = validateClaimData(data);
      break;
    default:
      return { isValid: false, errors: { entityType: 'Invalid entity type' } };
  }

  // Business rules validation
  const businessValidation = validateBusinessRules(data, entityType);
  
  return {
    isValid: validation.isValid && businessValidation.isValid,
    errors: { ...validation.errors, ...businessValidation.errors }
  };
}
