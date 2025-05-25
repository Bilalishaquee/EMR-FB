// import mongoose from 'mongoose';

// const patientSchema = new mongoose.Schema({
//   firstName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   lastName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   dateOfBirth: {
//     type: Date,
//     required: true
//   },
//   gender: {
//     type: String,
//     enum: ['male', 'female', 'other'],
//     required: true
//   },
//   email: {
//     type: String,
//     required: true,
//     trim: true,
//     lowercase: true
//   },
//   phone: {
//     type: String,
//     required: true
//   },
//   address: {
//     street: String,
//     city: String,
//     state: String,
//     zipCode: String,
//     country: String
//   },
//   emergencyContact: {
//     name: String,
//     relationship: String,
//     phone: String
//   },
//   insuranceInfo: {
//     provider: String,
//     policyNumber: String,
//     groupNumber: String,
//     primaryInsured: String
//   },
//   medicalHistory: {
//     allergies: [String],
//     medications: [String],
//     conditions: [String],
//     surgeries: [String],
//     familyHistory: [String]
//   },
//   subjective: {
//   fullName: String,
//   date: String,
//   physical: [String],
//   sleep: [String],
//   cognitive: [String],
//   digestive: [String],
//   emotional: [String],
//   bodyPart: [String],
//   severity: String,
//   quality: [String],
//   timing: String,
//   context: String,
//   exacerbatedBy: [String],
//   symptoms: [String],
//   notes: String,
//   radiatingTo: String,
//   radiatingRight: Boolean,
//   radiatingLeft: Boolean,
//   sciaticaRight: Boolean,
//   sciaticaLeft: Boolean
// },

//   assignedDoctor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['active', 'inactive', 'discharged'],
//     default: 'active'
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// // Update the updatedAt field on save
// patientSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// const Patient = mongoose.model('Patient', patientSchema);

// export default Patient;

import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  dateOfBirth: String,
  gender: String,
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    primaryInsured: String
  },
  medicalHistory: {
    allergies: [String],
    medications: [String],
    conditions: [String],
    surgeries: [String],
    familyHistory: [String]
  },
  subjective: {
    fullName: String,
    date: String,
    physical: [String],
    sleep: [String],
    cognitive: [String],
    digestive: [String],
    emotional: [String],
    bodyPart: [String],
    severity: String,
    quality: [String],
    timing: String,
    context: String,
    exacerbatedBy: [String],
    symptoms: [String],
    notes: String,
    radiatingTo: String,
    radiatingRight: Boolean,
    radiatingLeft: Boolean,
    sciaticaRight: Boolean,
    sciaticaLeft: Boolean
  },
  assignedDoctor: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true  // ✅ add this if doctors must be assigned
}
,
  status: {
    type: String,
    default: 'active'
  }
}, {
  timestamps: true
});

const Patient = mongoose.model('Patient', PatientSchema);
export default Patient;
