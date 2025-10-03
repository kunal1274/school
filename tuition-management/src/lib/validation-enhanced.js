// Enhanced validation system with better error handling and custom validators

// Base validation functions
export const validators = {
  required: (value, message = 'This field is required') => {
    if (value === null || value === undefined || value === '') {
      return message;
    }
    return null;
  },

  minLength: (value, min, message = `Must be at least ${min} characters`) => {
    if (value && value.length < min) {
      return message;
    }
    return null;
  },

  maxLength: (value, max, message = `Must be no more than ${max} characters`) => {
    if (value && value.length > max) {
      return message;
    }
    return null;
  },

  email: (value, message = 'Please enter a valid email address') => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  phone: (value, message = 'Please enter a valid phone number') => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (value && !phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      return message;
    }
    return null;
  },

  numeric: (value, message = 'Must be a valid number') => {
    if (value && isNaN(Number(value))) {
      return message;
    }
    return null;
  },

  min: (value, min, message = `Must be at least ${min}`) => {
    if (value && Number(value) < min) {
      return message;
    }
    return null;
  },

  max: (value, max, message = `Must be no more than ${max}`) => {
    if (value && Number(value) > max) {
      return message;
    }
    return null;
  },

  pattern: (value, regex, message = 'Invalid format') => {
    if (value && !regex.test(value)) {
      return message;
    }
    return null;
  },

  custom: (value, validator, message = 'Invalid value') => {
    if (value && !validator(value)) {
      return message;
    }
    return null;
  }
};

// Validation rules for different field types
export const fieldRules = {
  name: [
    { validator: validators.required },
    { validator: validators.minLength, params: [2] },
    { validator: validators.maxLength, params: [50] }
  ],

  email: [
    { validator: validators.required },
    { validator: validators.email }
  ],

  phone: [
    { validator: validators.required },
    { validator: validators.phone }
  ],

  password: [
    { validator: validators.required },
    { validator: validators.minLength, params: [6] },
    { validator: validators.maxLength, params: [50] }
  ],

  amount: [
    { validator: validators.required },
    { validator: validators.numeric },
    { validator: validators.min, params: [0.01] }
  ],

  age: [
    { validator: validators.required },
    { validator: validators.numeric },
    { validator: validators.min, params: [1] },
    { validator: validators.max, params: [120] }
  ],

  date: [
    { validator: validators.required },
    { validator: validators.custom, params: [(value) => !isNaN(Date.parse(value))] }
  ]
};

// Main validation function
export function validateField(value, rules) {
  for (const rule of rules) {
    const error = rule.validator(value, ...(rule.params || []));
    if (error) {
      return error;
    }
  }
  return null;
}

// Validate entire form
export function validateForm(data, schema) {
  const errors = {};
  
  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = data[fieldName];
    const error = validateField(value, rules);
    if (error) {
      errors[fieldName] = error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Enhanced validation for specific entities
export function validateStudentData(data, isUpdate = false) {
  const schema = {
    firstName: fieldRules.name,
    lastName: fieldRules.name,
    dob: fieldRules.date,
    gender: [
      { validator: validators.required },
      { validator: validators.custom, params: [(value) => ['male', 'female', 'other'].includes(value)] }
    ],
    classOrBatch: [
      { validator: validators.required },
      { validator: validators.minLength, params: [1] }
    ],
    parentName: fieldRules.name,
    parentPhone: fieldRules.phone,
    address: [
      { validator: validators.required },
      { validator: validators.minLength, params: [10] }
    ]
  };

  return validateForm(data, schema);
}

export function validateTeacherData(data, isUpdate = false) {
  const schema = {
    firstName: fieldRules.name,
    lastName: fieldRules.name,
    email: fieldRules.email,
    phone: fieldRules.phone,
    subject: [
      { validator: validators.required },
      { validator: validators.minLength, params: [2] }
    ],
    experience: [
      { validator: validators.required },
      { validator: validators.numeric },
      { validator: validators.min, params: [0] }
    ],
    qualification: [
      { validator: validators.required },
      { validator: validators.minLength, params: [2] }
    ]
  };

  return validateForm(data, schema);
}

export function validateUserData(data, isUpdate = false) {
  const schema = {
    name: fieldRules.name,
    email: fieldRules.email,
    role: [
      { validator: validators.required },
      { validator: validators.custom, params: [(value) => ['admin', 'moderator', 'staff'].includes(value)] }
    ],
    phone: fieldRules.phone
  };

  // Only validate password for new users
  if (!isUpdate) {
    schema.password = fieldRules.password;
    schema.confirmPassword = [
      { validator: validators.required },
      { validator: validators.custom, params: [(value) => value === data.password], message: 'Passwords do not match' }
    ];
  }

  return validateForm(data, schema);
}

export function validateFeeData(data, isUpdate = false) {
  const schema = {
    payerType: [
      { validator: validators.required },
      { validator: validators.custom, params: [(value) => ['student', 'teacher', 'customer', 'transport'].includes(value)] }
    ],
    payerId: [
      { validator: validators.required }
    ],
    amount: fieldRules.amount,
    currency: [
      { validator: validators.required },
      { validator: validators.custom, params: [(value) => ['INR', 'USD', 'EUR'].includes(value)] }
    ],
    modeOfPayment: [
      { validator: validators.required },
      { validator: validators.custom, params: [(value) => ['cash', 'card', 'upi', 'netbanking', 'cheque', 'other'].includes(value)] }
    ],
    payeeName: fieldRules.name,
    payeePhone: fieldRules.phone,
    date: fieldRules.date,
    status: [
      { validator: validators.required },
      { validator: validators.custom, params: [(value) => ['paid', 'pending', 'overdue'].includes(value)] }
    ]
  };

  return validateForm(data, schema);
}

// Real-time validation hook
export function useValidation(schema) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (data) => {
    const result = validateForm(data, schema);
    setErrors(result.errors);
    return result;
  };

  const validateField = (fieldName, value) => {
    const fieldRules = schema[fieldName];
    if (fieldRules) {
      const error = validateField(value, fieldRules);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
      return error;
    }
    return null;
  };

  const touchField = (fieldName) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  };

  const clearErrors = () => {
    setErrors({});
    setTouched({});
  };

  return {
    errors,
    touched,
    validate,
    validateField,
    touchField,
    clearErrors,
    hasErrors: Object.keys(errors).length > 0
  };
}
