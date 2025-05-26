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

const initialVisitSchema = new mongoose.Schema({
  chiefComplaint: { type: String, required: true }, // ✅ REQUIRED
  chiropracticAdjustment: [String],
  chiropracticOther: [String],
  acupuncture: [String],
  acupunctureOther: [String], 
  physiotherapy: [String],
  rehabilitationExercises: [String],
  
  
  durationFrequency: {
    timesPerWeek: { type: Number },
    reEvalInWeeks: { type: Number }
  },

  referrals: [String],

  imaging: {
    xray: [String],
    mri: [String],
    ct: [String]
  },

  diagnosticUltrasound: String,
  nerveStudy: [String],

  restrictions: {
    avoidActivityWeeks: { type: Number },
    liftingLimitLbs: { type: Number },
    avoidProlongedSitting: { type: Boolean }
  },

  disabilityDuration: String,
  otherNotes: String,

  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // visitType: { type: String, enum: ['initial'], default: 'initial' }
}, { timestamps: true });


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
