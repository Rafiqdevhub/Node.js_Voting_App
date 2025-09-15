// MongoDB initialization script for voting application
// This script runs when the MongoDB container starts for the first time

// Switch to the voting database
db = db.getSiblingDB('voting_db');

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'age', 'email', 'mobile', 'address', 'aadharCardNumber', 'password'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Name is required and must be a string'
        },
        age: {
          bsonType: 'number',
          minimum: 18,
          description: 'Age must be a number and at least 18'
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        mobile: {
          bsonType: 'string',
          description: 'Mobile number is required'
        },
        address: {
          bsonType: 'string',
          description: 'Address is required'
        },
        aadharCardNumber: {
          bsonType: 'string',
          pattern: '^[0-9]{12}$',
          description: 'Aadhar card number must be exactly 12 digits'
        },
        role: {
          bsonType: 'string',
          enum: ['voter', 'admin'],
          description: 'Role must be either voter or admin'
        },
        isVoted: {
          bsonType: 'bool',
          description: 'Voting status must be boolean'
        }
      }
    }
  }
});

db.createCollection('candidates', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'party', 'age'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Candidate name is required'
        },
        party: {
          bsonType: 'string',
          description: 'Party name is required'
        },
        age: {
          bsonType: 'number',
          minimum: 25,
          description: 'Candidate age must be at least 25'
        },
        votes: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            required: ['user', 'votedAt'],
            properties: {
              user: {
                bsonType: 'objectId',
                description: 'User ID who voted'
              },
              votedAt: {
                bsonType: 'date',
                description: 'Timestamp when vote was cast'
              }
            }
          }
        },
        voteCount: {
          bsonType: 'number',
          minimum: 0,
          description: 'Vote count must be non-negative'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ aadharCardNumber: 1 }, { unique: true });
db.users.createIndex({ mobile: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isVoted: 1 });

db.candidates.createIndex({ name: 1 });
db.candidates.createIndex({ party: 1 });
db.candidates.createIndex({ voteCount: -1 }); // For leaderboard queries
db.candidates.createIndex({ 'votes.user': 1 });
db.candidates.createIndex({ 'votes.votedAt': -1 });

// Create a default admin user for development if it doesn't exist
const adminExists = db.users.findOne({ role: 'admin' });
if (!adminExists) {
  // Using bcrypt hash for 'admin123' password (development only)
  const adminPassword = '$2b$10$rOvAXoDnN7L.4iYxc/uS8OjAD0.VYZjFBbqhXYkqqNZjC2IkXb1yW';
  
  db.users.insertOne({
    name: 'Development Admin',
    age: 30,
    email: 'admin@votingapp.com',
    mobile: '1234567890',
    address: 'Development Environment',
    aadharCardNumber: '123456789012',
    password: adminPassword,
    role: 'admin',
    isVoted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  print('✅ Default admin user created for development');
  print('📧 Email: admin@votingapp.com');
  print('🔑 Password: admin123');
}

// Create sample candidates for development testing
const candidateCount = db.candidates.countDocuments();
if (candidateCount === 0) {
  db.candidates.insertMany([
    {
      name: 'Alice Johnson',
      party: 'Democratic Party',
      age: 45,
      votes: [],
      voteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Bob Smith',
      party: 'Republican Party',
      age: 52,
      votes: [],
      voteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Carol Williams',
      party: 'Independent',
      age: 38,
      votes: [],
      voteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  print('✅ Sample candidates created for development');
}

// Create some test voters for development (optional)
const voterCount = db.users.countDocuments({ role: 'voter' });
if (voterCount === 0) {
  // Using bcrypt hash for 'voter123' password (development only)
  const voterPassword = '$2b$10$8Zi7H9ydTxS5EdyQ1xNvHOjLfNQr5xJL7qzM4XJKWNfRxkpV8yI8C';
  
  db.users.insertMany([
    {
      name: 'Test Voter 1',
      age: 25,
      email: 'voter1@example.com',
      mobile: '9876543210',
      address: '123 Test Street, Dev City',
      aadharCardNumber: '234567890123',
      password: voterPassword,
      role: 'voter',
      isVoted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Test Voter 2',
      age: 30,
      email: 'voter2@example.com',
      mobile: '9876543211',
      address: '456 Test Avenue, Dev City',
      aadharCardNumber: '345678901234',
      password: voterPassword,
      role: 'voter',
      isVoted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  print('✅ Sample voters created for development');
  print('📧 Test Voters: voter1@example.com, voter2@example.com');
  print('🔑 Password: voter123');
}

print('🎉 MongoDB initialization completed successfully!');
print('📊 Database: voting_db');
print('👥 Collections: users, candidates');
print('🔍 Ready for development testing');
