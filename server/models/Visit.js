// import mongoose from 'mongoose';

// // Base schema for all visit types
// const baseVisitSchema = {
//   patient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Patient',
//     required: true
//   },
//   doctor: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   date: {
//     type: Date,
//     required: true,
//     default: Date.now
//   },
//   visitType: {
//     type: String,
//     enum: ['initial', 'followup', 'discharge'],
//     required: true
//   },
//   notes: String,
//   createdAt: {
//     type: Date,
//     default: Date.now
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now
//   }
// };

// // Initial Visit Schema
// const initialVisitSchema = new mongoose.Schema({
//   ...baseVisitSchema,
//   chiefComplaint: {
//     type: String,
//     required: true
//   },
//   historyOfPresentIllness: String,
//   vitalSigns: {
//     temperature: Number,
//     heartRate: Number,
//     respiratoryRate: Number,
//     bloodPressure: String,
//     oxygenSaturation: Number,
//     height: Number,
//     weight: Number
//   },
//   physicalExamination: {
//     general: String,
//     heent: String, // Head, Eyes, Ears, Nose, Throat
//     cardiovascular: String,
//     respiratory: String,
//     gastrointestinal: String,
//     musculoskeletal: String,
//     neurological: String,
//     skin: String
//   },
//   assessment: String,
//   plan: {
//     diagnosis: [String],
//     medications: [{
//       name: String,
//       dosage: String,
//       frequency: String,
//       duration: String
//     }],
//     labTests: [String],
//     imaging: [String],
//     followUpPlan: String
//   }
// });

// // Follow-up Visit Schema
// const followupVisitSchema = new mongoose.Schema({
//   ...baseVisitSchema,
//   previousVisit: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Visit',
//     required: true
//   },
//   progressNotes: String,
//   vitalSigns: {
//     temperature: Number,
//     heartRate: Number,
//     respiratoryRate: Number,
//     bloodPressure: String,
//     oxygenSaturation: Number,
//     weight: Number
//   },
//   currentSymptoms: [String],
//   assessmentUpdate: String,
//   planUpdate: {
//     medications: [{
//       name: String,
//       dosage: String,
//       frequency: String,
//       duration: String,
//       changes: String
//     }],
//     newTests: [String],
//     nextFollowUp: Date
//   }
// });

// // Discharge Visit Schema
// const dischargeVisitSchema = new mongoose.Schema({
//   ...baseVisitSchema,
//   treatmentSummary: String,
//   dischargeDiagnosis: [String],
//   medicationsAtDischarge: [{
//     name: String,
//     dosage: String,
//     frequency: String,
//     duration: String
//   }],
//   followUpInstructions: String,
//   returnPrecautions: [String],
//   dischargeStatus: {
//     type: String,
//     enum: ['improved', 'stable', 'other'],
//     required: true
//   }
// });

// // Create a discriminator key for different visit types
// const visitSchema = new mongoose.Schema(baseVisitSchema, {
//   discriminatorKey: 'visitType',
//   collection: 'visits',
//   timestamps: true  // optional, since you're already managing createdAt/updatedAt manually
// });


// // Update the updatedAt field on save
// visitSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

// const Visit = mongoose.model('Visit', visitSchema);

// // Create discriminators for different visit types
// const InitialVisit = Visit.discriminator('InitialVisit', initialVisitSchema);
// const FollowupVisit = Visit.discriminator('FollowupVisit', followupVisitSchema);
// const DischargeVisit = Visit.discriminator('DischargeVisit', dischargeVisitSchema);

// export { Visit, InitialVisit, FollowupVisit, DischargeVisit };


import mongoose from 'mongoose';

// Base schema for all visits
const baseVisitSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: String
  },
  {
    discriminatorKey: 'visitType', // ✅ Mongoose will add this automatically
    collection: 'visits',
    timestamps: true // ✅ for createdAt and updatedAt
  }
);

const Visit = mongoose.model('Visit', baseVisitSchema);

// Initial Visit Schema
const initialVisitSchema = new mongoose.Schema({
  chiefComplaint: { type: String, required: true },
  historyOfPresentIllness: String,
  vitalSigns: {
    temperature: Number,
    heartRate: Number,
    respiratoryRate: Number,
    bloodPressure: String,
    oxygenSaturation: Number,
    height: Number,
    weight: Number
  },
  physicalExamination: {
    general: String,
    heent: String,
    cardiovascular: String,
    respiratory: String,
    gastrointestinal: String,
    musculoskeletal: String,
    neurological: String,
    skin: String
  },
  assessment: String,
  plan: {
    diagnosis: [String],
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    labTests: [String],
    imaging: [String],
    followUpPlan: String
  }
});

// Follow-up Visit Schema
const followupVisitSchema = new mongoose.Schema({
  previousVisit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit',
    required: true
  },
  progressNotes: String,
  vitalSigns: {
    temperature: Number,
    heartRate: Number,
    respiratoryRate: Number,
    bloodPressure: String,
    oxygenSaturation: Number,
    weight: Number
  },
  currentSymptoms: [String],
  assessmentUpdate: String,
  planUpdate: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      changes: String
    }],
    newTests: [String],
    nextFollowUp: Date
  }
});

// Discharge Visit Schema
const dischargeVisitSchema = new mongoose.Schema({
  treatmentSummary: String,
  dischargeDiagnosis: [String],
  medicationsAtDischarge: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  followUpInstructions: String,
  returnPrecautions: [String],
  dischargeStatus: {
    type: String,
    enum: ['improved', 'stable', 'other'],
    required: true
  }
});

// Discriminators (no `visitType` manually added here)
const InitialVisit = Visit.discriminator('initial', initialVisitSchema);
const FollowupVisit = Visit.discriminator('followup', followupVisitSchema);
const DischargeVisit = Visit.discriminator('discharge', dischargeVisitSchema);

export { Visit, InitialVisit, FollowupVisit, DischargeVisit };
