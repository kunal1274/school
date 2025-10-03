// Validation utilities
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone) {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
}

export function validatePassword(password) {
  return password && password.length >= 6;
}

export function validateRequired(value) {
  return value !== null && value !== undefined && value.toString().trim() !== '';
}

export function validateDate(date) {
  return date instanceof Date && !isNaN(date);
}

export function validateAmount(amount) {
  return !isNaN(amount) && parseFloat(amount) >= 0;
}

// User validation
export function validateUserData(data, isUpdate = false) {
  const errors = {};

  if (!isUpdate || data.email !== undefined) {
    if (!validateRequired(data.email)) {
      errors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      errors.email = 'Invalid email format';
    }
  }

  if (!isUpdate || data.password !== undefined) {
    if (!isUpdate && !validateRequired(data.password)) {
      errors.password = 'Password is required';
    } else if (data.password && !validatePassword(data.password)) {
      errors.password = 'Password must be at least 6 characters';
    }
  }

  if (!validateRequired(data.name)) {
    errors.name = 'Name is required';
  }

  if (!validateRequired(data.role)) {
    errors.role = 'Role is required';
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Student validation
export function validateStudentData(data, isUpdate = false) {
  const errors = {};

  if (!validateRequired(data.firstName)) {
    errors.firstName = 'First name is required';
  }

  if (!validateRequired(data.lastName)) {
    errors.lastName = 'Last name is required';
  }

  if (!validateRequired(data.classOrBatch)) {
    errors.classOrBatch = 'Class or batch is required';
  }

  if (!validateRequired(data.parentName)) {
    errors.parentName = 'Parent name is required';
  }

  if (!validateRequired(data.parentPhone)) {
    errors.parentPhone = 'Parent phone is required';
  } else if (!validatePhone(data.parentPhone)) {
    errors.parentPhone = 'Invalid parent phone number format';
  }

  if (data.dob && !validateDate(new Date(data.dob))) {
    errors.dob = 'Invalid date of birth';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Teacher validation
export function validateTeacherData(data, isUpdate = false) {
  const errors = {};

  if (!validateRequired(data.name)) {
    errors.name = 'Name is required';
  }

  if (!validateRequired(data.subjectOrRole)) {
    errors.subjectOrRole = 'Subject or role is required';
  }

  if (!validateRequired(data.phone)) {
    errors.phone = 'Phone is required';
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.joiningDate && !validateDate(new Date(data.joiningDate))) {
    errors.joiningDate = 'Invalid joining date';
  }

  if (data.salary && !validateAmount(data.salary)) {
    errors.salary = 'Invalid salary amount';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Customer validation
export function validateCustomerData(data, isUpdate = false) {
  const errors = {};

  if (!validateRequired(data.name)) {
    errors.name = 'Name is required';
  }

  if (!validateRequired(data.phone)) {
    errors.phone = 'Phone is required';
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  if (data.email && !validateEmail(data.email)) {
    errors.email = 'Invalid email format';
  }

  if (data.status && !['active', 'inactive'].includes(data.status)) {
    errors.status = 'Status must be active or inactive';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Transport customer validation
export function validateTransportCustomerData(data, isUpdate = false) {
  const errors = {};

  if (!validateRequired(data.name)) {
    errors.name = 'Name is required';
  }

  if (!validateRequired(data.phone)) {
    errors.phone = 'Phone is required';
  } else if (!validatePhone(data.phone)) {
    errors.phone = 'Invalid phone number format';
  }

  if (data.fee && !validateAmount(data.fee)) {
    errors.fee = 'Invalid fee amount';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Fee validation
export function validateFeeData(data, isUpdate = false) {
  const errors = {};

  if (!validateRequired(data.payerType)) {
    errors.payerType = 'Payer type is required';
  }

  if (!validateRequired(data.payerId)) {
    errors.payerId = 'Payer ID is required';
  }

  if (!validateRequired(data.amount)) {
    errors.amount = 'Amount is required';
  } else if (!validateAmount(data.amount)) {
    errors.amount = 'Invalid amount';
  }

  if (!validateRequired(data.modeOfPayment)) {
    errors.modeOfPayment = 'Mode of payment is required';
  }

  if (!validateRequired(data.payeeName)) {
    errors.payeeName = 'Payee name is required';
  }

  if (!validateRequired(data.payeePhone)) {
    errors.payeePhone = 'Payee phone is required';
  } else if (!validatePhone(data.payeePhone)) {
    errors.payeePhone = 'Invalid payee phone number format';
  }

  if (!validateRequired(data.date)) {
    errors.date = 'Date is required';
  } else if (!validateDate(new Date(data.date))) {
    errors.date = 'Invalid date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
