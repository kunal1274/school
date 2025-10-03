import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tuition-management';

async function seedDatabase() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('tuition-management');
    
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('students').deleteMany({});
    await db.collection('teachers').deleteMany({});
    await db.collection('customers').deleteMany({});
    await db.collection('transport_customers').deleteMany({});
    await db.collection('fees').deleteMany({});
    await db.collection('activity_logs').deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const moderatorPassword = await bcrypt.hash('mod123', 12);
    const staffPassword = await bcrypt.hash('staff123', 12);

    const users = [
      {
        email: 'admin@school.com',
        passwordHash: adminPassword,
        role: 'admin',
        name: 'Admin User',
        phone: '+91-9876543210',
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null
      },
      {
        email: 'moderator@school.com',
        passwordHash: moderatorPassword,
        role: 'moderator',
        name: 'Moderator User',
        phone: '+91-9876543211',
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null
      },
      {
        email: 'staff@school.com',
        passwordHash: staffPassword,
        role: 'staff',
        name: 'Staff User',
        phone: '+91-9876543212',
        isActive: true,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null
      }
    ];

    const userResult = await db.collection('users').insertMany(users);
    const adminId = userResult.insertedIds[0];
    console.log('👤 Created users');

    // Create sample students
    const students = [
      {
        studentCode: 'S-0001',
        firstName: 'Rahul',
        lastName: 'Sharma',
        dob: new Date('2008-05-15'),
        gender: 'Male',
        classOrBatch: 'Class 10',
        parentName: 'Suresh Sharma',
        parentPhone: '+91-9876543213',
        address: '123 MG Road, Delhi',
        transportOptIn: true,
        photoUrl: '',
        notes: 'Good student, regular attendance',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminId,
        updatedBy: adminId
      },
      {
        studentCode: 'S-0002',
        firstName: 'Priya',
        lastName: 'Patel',
        dob: new Date('2009-03-22'),
        gender: 'Female',
        classOrBatch: 'Class 9',
        parentName: 'Rajesh Patel',
        parentPhone: '+91-9876543214',
        address: '456 Park Street, Mumbai',
        transportOptIn: false,
        photoUrl: '',
        notes: 'Excellent in mathematics',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminId,
        updatedBy: adminId
      },
      {
        studentCode: 'S-0003',
        firstName: 'Arjun',
        lastName: 'Singh',
        dob: new Date('2007-11-08'),
        gender: 'Male',
        classOrBatch: 'Class 11',
        parentName: 'Vikram Singh',
        parentPhone: '+91-9876543215',
        address: '789 Gandhi Nagar, Pune',
        transportOptIn: true,
        photoUrl: '',
        notes: 'Preparing for JEE',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminId,
        updatedBy: adminId
      }
    ];

    const studentResult = await db.collection('students').insertMany(students);
    console.log('👨‍🎓 Created students');

    // Create sample teachers
    const teachers = [
      {
        teacherCode: 'T-0001',
        name: 'Dr. Anjali Gupta',
        subjectOrRole: 'Mathematics',
        phone: '+91-9876543216',
        email: 'anjali.gupta@school.com',
        address: '321 Teachers Colony, Delhi',
        joiningDate: new Date('2020-06-01'),
        salary: 45000,
        notes: 'PhD in Mathematics, 10 years experience',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminId,
        updatedBy: adminId
      },
      {
        teacherCode: 'T-0002',
        name: 'Prof. Rajesh Kumar',
        subjectOrRole: 'Physics',
        phone: '+91-9876543217',
        email: 'rajesh.kumar@school.com',
        address: '654 Science Block, Mumbai',
        joiningDate: new Date('2019-04-15'),
        salary: 50000,
        notes: 'M.Sc Physics, specializes in JEE preparation',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminId,
        updatedBy: adminId
      }
    ];

    const teacherResult = await db.collection('teachers').insertMany(teachers);
    console.log('👩‍🏫 Created teachers');

    // Create sample customers
    const customers = [
      {
        name: 'Meera Joshi',
        phone: '+91-9876543218',
        email: 'meera.joshi@email.com',
        address: '987 Residential Area, Bangalore',
        relationToStudent: 'Mother of Kavya Joshi',
        notes: 'Interested in online classes',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminId,
        updatedBy: adminId
      },
      {
        name: 'Amit Verma',
        phone: '+91-9876543219',
        email: 'amit.verma@email.com',
        address: '147 Business District, Chennai',
        relationToStudent: 'Father of Rohan Verma',
        notes: 'Prefers weekend batches',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminId,
        updatedBy: adminId
      }
    ];

    const customerResult = await db.collection('customers').insertMany(customers);
    console.log('👥 Created customers');

    // Create sample transport customers
    const transportCustomers = [
      {
        name: 'Ravi Transport Services',
        phone: '+91-9876543220',
        vehicleNo: 'DL-01-AB-1234',
        pickupPoint: 'Connaught Place',
        dropPoint: 'School Campus',
        assignedToStudentId: studentResult.insertedIds[0].toString(),
        fee: 2000,
        notes: 'Morning and evening service',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminId,
        updatedBy: adminId
      },
      {
        name: 'Safe Journey Transport',
        phone: '+91-9876543221',
        vehicleNo: 'MH-02-CD-5678',
        pickupPoint: 'Bandra Station',
        dropPoint: 'School Campus',
        assignedToStudentId: studentResult.insertedIds[2].toString(),
        fee: 2500,
        notes: 'AC bus service',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: adminId,
        updatedBy: adminId
      }
    ];

    const transportResult = await db.collection('transport_customers').insertMany(transportCustomers);
    console.log('🚌 Created transport customers');

    // Create sample fees
    const fees = [
      {
        transactionId: 'TXN-000001',
        payerType: 'student',
        payerId: studentResult.insertedIds[0].toString(),
        amount: 5000,
        currency: 'INR',
        modeOfPayment: 'upi',
        payeeName: 'Rahul Sharma',
        payeePhone: '+91-9876543213',
        reference: 'Monthly tuition fee - October 2024',
        date: new Date('2024-10-01'),
        status: 'paid',
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        transactionId: 'TXN-000002',
        payerType: 'student',
        payerId: studentResult.insertedIds[1].toString(),
        amount: 4500,
        currency: 'INR',
        modeOfPayment: 'cash',
        payeeName: 'Priya Patel',
        payeePhone: '+91-9876543214',
        reference: 'Monthly tuition fee - October 2024',
        date: new Date('2024-10-02'),
        status: 'pending',
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        transactionId: 'TXN-000003',
        payerType: 'transport',
        payerId: transportResult.insertedIds[0].toString(),
        amount: 2000,
        currency: 'INR',
        modeOfPayment: 'bank_transfer',
        payeeName: 'Ravi Transport Services',
        payeePhone: '+91-9876543220',
        reference: 'Monthly transport fee - October 2024',
        date: new Date('2024-10-03'),
        status: 'paid',
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.collection('fees').insertMany(fees);
    console.log('💰 Created fee records');

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('students').createIndex({ studentCode: 1 }, { unique: true });
    await db.collection('students').createIndex({ parentPhone: 1 });
    await db.collection('teachers').createIndex({ teacherCode: 1 }, { unique: true });
    await db.collection('fees').createIndex({ transactionId: 1 }, { unique: true });
    await db.collection('fees').createIndex({ payerId: 1 });
    await db.collection('fees').createIndex({ date: -1 });
    
    console.log('📊 Created database indexes');
    console.log('✅ Database seeding completed successfully!');
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@school.com / admin123');
    console.log('Moderator: moderator@school.com / mod123');
    console.log('Staff: staff@school.com / staff123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
}

// Run the seed function
seedDatabase();
