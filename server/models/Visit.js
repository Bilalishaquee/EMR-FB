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
  chiefComplaint: { type: String, required: true },

  vitals: {
    height: String,
    weight: String,
    temp: String,
    bp: String,
    pulse: String
  },

  grip: {
    right1: String,
    right2: String,
    right3: String,
    left1: String,
    left2: String,
    left3: String
  },

  appearance: [String],
  appearanceOther: String,

  orientation: {
    timePlacePerson: Boolean,
    otherChecked: Boolean,
    other: String
  },

  posture: [String],
  gait: [String],
  gaitDevice: String,

  dtr: [String],
  dtrOther: String,

  dermatomes: [String],
  dermatomesHypoArea: String,
  dermatomesHyperArea: String,

  muscleStrength: [String],
  strength: {
    C5: String,
    C6: String,
    C7: String,
    C8: String,
    T1: String,
    L2: String,
    L3: String,
    L4: String,
    L5: String,
    S1: String
  },

  oriented: Boolean,
  neuroNote: String,
  coordination: Boolean,
  romberg: [String],
  rombergNotes: String,
  pronatorDrift: String,
  neuroTests: [String],
  walkTests: [String],
  painLocation: [String],
  radiatingTo: String,

  jointDysfunction: [String],
  jointOther: String,

  chiropracticAdjustment: [String],
  chiropracticOther: String,
  acupuncture: [String],
  acupunctureOther: String,
  physiotherapy: [String],
  rehabilitationExercises: [String],

  durationFrequency: {
    timesPerWeek: Number,
    reEvalInWeeks: Number
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
    avoidActivityWeeks: Number,
    liftingLimitLbs: Number,
    avoidProlongedSitting: Boolean
  },

  disabilityDuration: String,
  otherNotes: String,

  arom: mongoose.Schema.Types.Mixed,  // object of { bodyPart: { movement: { wnl, exam, pain } } }
  ortho: mongoose.Schema.Types.Mixed, // object of { test: { left, right, ligLaxity? } }

  tenderness: mongoose.Schema.Types.Mixed, // object of { region: [labels] }
  spasm: mongoose.Schema.Types.Mixed,      // object of { region: [labels] }

  lumbarTouchingToesMovement: {
    pain: Boolean,
    painTS: Boolean,
    painLS: Boolean,
    acceleration: Boolean,
    accelerationTSPain: Boolean,
    accelerationLSPain: Boolean,
    deceleration: Boolean,
    decelerationTSPain: Boolean,
    decelerationLSPain: Boolean,
    gowersSign: Boolean,
    gowersSignTS: Boolean,
    gowersSignLS: Boolean,
    deviatingLumbopelvicRhythm: Boolean,
    deviatingFlexionRotation: Boolean,
    deviatingExtensionRotation: Boolean
  },

  cervicalAROMCheckmarks: {
    pain: Boolean,
    poorCoordination: Boolean,
    abnormalJointPlay: Boolean,
    motionNotSmooth: Boolean,
    hypomobilityThoracic: Boolean,
    fatigueHoldingHead: Boolean
  },

  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }

}, { timestamps: true });




// Follow-up Visit Schema
const followupVisitSchema = new mongoose.Schema({
  previousVisit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit',
    required: true
  },
  // Fields based on EXAM FORM---REEVALUATION template
  areas: { type: String },
  areasImproving: { type: Boolean },
  areasExacerbated: { type: Boolean },
  areasSame: { type: Boolean },
  musclePalpation: { type: String },
  painRadiating: { type: String },
  romWnlNoPain: { type: Boolean },
  romWnlWithPain: { type: Boolean },
  romImproved: { type: Boolean },
  romDecreased: { type: Boolean },
  romSame: { type: Boolean },
  orthos: {
    tests: { type: String },
    result: { type: String }
  },
  activitiesCausePain: { type: String },
  activitiesCausePainOther: { type: String },
  treatmentPlan: {
    treatments: { type: String },
    timesPerWeek: { type: String }
  },
  overallResponse: {
    improving: { type: Boolean },
    worse: { type: Boolean },
    same: { type: Boolean }
  },
  referrals: { type: String },
  diagnosticStudy: {
    study: { type: String },
    bodyPart: { type: String },
    result: { type: String }
  },
  homeCare: { type: String },
  // Notes field is in the base schema
});


// Discharge Visit Schema
const dischargeVisitSchema = new mongoose.Schema({
  areasImproving: Boolean,
  areasExacerbated: Boolean,
  areasSame: Boolean,

  musclePalpation: String,
  painRadiating: String,
  romPercent: Number,
  orthos: {
    tests: String,
    result: String
  },
  activitiesCausePain: String,
  otherNotes: String,

  prognosis: String, // selected prognosis
  diagnosticStudy: {
    study: String,
    bodyPart: String,
    result: String
  },
  futureMedicalCare: [String],
  croftCriteria: String,
  amaDisability: String,
  homeCare: [String],
  referralsNotes: String
});


// Discriminators (no `visitType` manually added here)
const InitialVisit = Visit.discriminator('initial', initialVisitSchema);
const FollowupVisit = Visit.discriminator('followup', followupVisitSchema);
const DischargeVisit = Visit.discriminator('discharge', dischargeVisitSchema);



export { Visit, InitialVisit, FollowupVisit, DischargeVisit };
