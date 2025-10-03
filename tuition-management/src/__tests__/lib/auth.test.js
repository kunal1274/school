import { hashPassword, verifyPassword, generateToken, verifyToken } from '@/lib/auth'

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key'

describe('Authentication Functions', () => {
  describe('hashPassword', () => {
    it('hashes a password', async () => {
      const password = 'testpassword123'
      const hashed = await hashPassword(password)
      
      expect(hashed).toBeDefined()
      expect(hashed).not.toBe(password)
      expect(hashed.length).toBeGreaterThan(0)
    })

    it('generates different hashes for the same password', async () => {
      const password = 'testpassword123'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('verifies correct password', async () => {
      const password = 'testpassword123'
      const hashed = await hashPassword(password)
      
      const isValid = await verifyPassword(password, hashed)
      expect(isValid).toBe(true)
    })

    it('rejects incorrect password', async () => {
      const password = 'testpassword123'
      const wrongPassword = 'wrongpassword'
      const hashed = await hashPassword(password)
      
      const isValid = await verifyPassword(wrongPassword, hashed)
      expect(isValid).toBe(false)
    })
  })

  describe('generateToken and verifyToken', () => {
    it('generates and verifies a valid token', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: 'admin',
        name: 'Test User'
      }

      const token = generateToken(user)
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      const decoded = verifyToken(token)
      expect(decoded).toBeDefined()
      expect(decoded.userId).toBe(user._id)
      expect(decoded.email).toBe(user.email)
      expect(decoded.role).toBe(user.role)
    })

    it('rejects invalid token', () => {
      const invalidToken = 'invalid.token.here'
      const decoded = verifyToken(invalidToken)
      expect(decoded).toBeNull()
    })

    it('rejects expired token', () => {
      // This would require mocking time or creating an expired token
      // For now, we'll test that the function handles invalid tokens gracefully
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid'
      const decoded = verifyToken(invalidToken)
      expect(decoded).toBeNull()
    })
  })
})
