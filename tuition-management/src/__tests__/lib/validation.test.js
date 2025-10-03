import { validateStudentData, validateTeacherData, validateCustomerData } from '@/lib/validation'

describe('Validation Functions', () => {
  describe('validateStudentData', () => {
    it('validates correct student data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        dob: '2010-01-01',
        gender: 'male',
        classOrBatch: '10th Grade',
        parentName: 'Jane Doe',
        parentPhone: '+91-9876543210',
        address: '123 Main St',
        status: 'active'
      }

      const result = validateStudentData(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('returns errors for missing required fields', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        // Missing other required fields
      }

      const result = validateStudentData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors.firstName).toBeDefined()
      expect(result.errors.dob).toBeDefined()
      expect(result.errors.gender).toBeDefined()
    })

    it('validates phone number format', () => {
      const dataWithInvalidPhone = {
        firstName: 'John',
        lastName: 'Doe',
        dob: '2010-01-01',
        gender: 'male',
        classOrBatch: '10th Grade',
        parentName: 'Jane Doe',
        parentPhone: 'invalid-phone',
        address: '123 Main St',
        status: 'active'
      }

      const result = validateStudentData(dataWithInvalidPhone)
      expect(result.isValid).toBe(false)
      expect(result.errors.parentPhone).toBeDefined()
    })
  })

  describe('validateTeacherData', () => {
    it('validates correct teacher data', () => {
      const validData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+91-9876543210',
        subjects: ['Math', 'Science'],
        experience: 5,
        status: 'active'
      }

      const result = validateTeacherData(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('validates email format', () => {
      const dataWithInvalidEmail = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'invalid-email',
        phone: '+91-9876543210',
        subjects: ['Math'],
        experience: 5,
        status: 'active'
      }

      const result = validateTeacherData(dataWithInvalidEmail)
      expect(result.isValid).toBe(false)
      expect(result.errors.email).toBeDefined()
    })
  })

  describe('validateCustomerData', () => {
    it('validates correct customer data', () => {
      const validData = {
        name: 'John Customer',
        email: 'john@example.com',
        phone: '+91-9876543210',
        address: '123 Main St',
        status: 'active'
      }

      const result = validateCustomerData(validData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
    })

    it('returns errors for missing required fields', () => {
      const invalidData = {
        name: '',
        // Missing other required fields
      }

      const result = validateCustomerData(invalidData)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
    })
  })
})
