import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';

interface Visit {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  date: string;
  visitType: string;
  notes: string;
  __t: string;
  
  // Initial Visit fields
// Initial Visit fields (new structure)
chiefComplaint?: string;
chiropracticAdjustment?: string[];
chiropracticOther?: string;
acupuncture?: string[];
acupunctureOther?: string;
physiotherapy?: string[];
rehabilitationExercises?: string[];

durationFrequency?: {
  timesPerWeek?: number;
  reEvalInWeeks?: number;
};

referrals?: string[];

imaging?: {
  xray?: string[];
  mri?: string[];
  ct?: string[];
};

diagnosticUltrasound?: string;
nerveStudy?: string[];

restrictions?: {
  avoidActivityWeeks?: number;
  liftingLimitLbs?: number;
  avoidProlongedSitting?: boolean;
};

disabilityDuration?: string;
otherNotes?: string;

  
  // Follow-up Visit fields
  previousVisit?: string;
  progressNotes?: string;
  currentSymptoms?: string[];
  assessmentUpdate?: string;
  planUpdate?: {
    medications: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      changes: string;
    }[];
    newTests: string[];
    nextFollowUp: string;
  };
  
  // Discharge Visit fields
  treatmentSummary?: string;
  dischargeDiagnosis?: string[];
  medicationsAtDischarge?: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  followUpInstructions?: string;
  returnPrecautions?: string[];
  dischargeStatus?: string;
}

const VisitDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [visit, setVisit] = useState<Visit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisit = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/visits/${id}`);
        setVisit(response.data);
      } catch (error) {
        console.error('Error fetching visit:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVisit();
  }, [id]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Visit_${visit?.visitType}_${new Date(visit?.date || '').toLocaleDateString()}`,
  });

  const generatePDF = () => {
    if (!visit) return;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`${visit.visitType.charAt(0).toUpperCase() + visit.visitType.slice(1)} Visit`, 105, 15, { align: 'center' });
    
    // Add patient name
    doc.setFontSize(16);
    doc.text(`${visit.patient.firstName} ${visit.patient.lastName}`, 105, 25, { align: 'center' });
    
    // Add visit info
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(visit.date).toLocaleDateString()}`, 20, 40);
    doc.text(`Provider: Dr. ${visit.doctor.firstName} ${visit.doctor.lastName}`, 20, 50);
    
    // Add visit details based on type
    if (visit.__t === 'InitialVisit' && visit.chiefComplaint) {
      doc.text('Chief Complaint:', 20, 65);
      doc.text(visit.chiefComplaint, 30, 75);
      
      if (visit.assessment) {
        doc.text('Assessment:', 20, 90);
        doc.text(visit.assessment, 30, 100);
      }
    } else if (visit.__t === 'FollowupVisit' && visit.progressNotes) {
      doc.text('Progress Notes:', 20, 65);
      doc.text(visit.progressNotes, 30, 75);
      
      if (visit.assessmentUpdate) {
        doc.text('Assessment Update:', 20, 90);
        doc.text(visit.assessmentUpdate, 30, 100);
      }
    } else if (visit.__t === 'DischargeVisit' && visit.treatmentSummary) {
      doc.text('Treatment Summary:', 20, 65);
      doc.text(visit.treatmentSummary, 30, 75);
      
      if (visit.followUpInstructions) {
        doc.text('Follow-up Instructions:', 20, 90);
        doc.text(visit.followUpInstructions, 30, 100);
      }
    }
    
    // Save the PDF
    doc.save(`Visit_${visit.visitType}_${new Date(visit.date).toLocaleDateString()}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">Visit not found</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <button
            onClick={() => navigate(`/patients/${visit.patient._id}`)}
            className="mr-4 p-2 rounded-full hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {visit.visitType === 'initial' ? 'Initial Visit' : 
               visit.visitType === 'followup' ? 'Follow-up Visit' : 
               'Discharge Visit'}
            </h1>
            <p className="text-gray-600">
              {visit.patient.firstName} {visit.patient.lastName} • {new Date(visit.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </button>
          <button
            onClick={generatePDF}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div ref={printRef} className="bg-white shadow-md rounded-lg p-6">
        {/* Visit Header */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Patient</p>
              <p className="font-medium">
                {visit.patient.firstName} {visit.patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Provider</p>
              <p className="font-medium">
                Dr. {visit.doctor.firstName} {visit.doctor.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{new Date(visit.date).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

       {/* Initial Visit Content */}
       {visit.visitType === 'initial' && (
  <div className="space-y-6">

    {/* Chief Complaint */}
    {visit.chiefComplaint && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chief Complaint</h3>
        <p className="text-gray-800">{visit.chiefComplaint}</p>
      </div>
    )}

    {/* Chiropractic Adjustment */}
    {visit.chiropracticAdjustment?.length > 0 && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chiropractic Adjustment</h3>
        <ul className="list-disc pl-5 text-gray-800">
          {visit.chiropracticAdjustment.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
        {visit.chiropracticOther && <p className="text-gray-800 mt-1"><strong>Other:</strong> {visit.chiropracticOther}</p>}
      </div>
    )}

    {/* Acupuncture */}
    {visit.acupuncture?.length > 0 && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acupuncture (Cupping)</h3>
        <ul className="list-disc pl-5 text-gray-800">
          {visit.acupuncture.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
        {visit.acupunctureOther && <p className="text-gray-800 mt-1"><strong>Other:</strong> {visit.acupunctureOther}</p>}
      </div>
    )}

    {/* Physiotherapy */}
    {visit.physiotherapy?.length > 0 && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Physiotherapy</h3>
        <ul className="list-disc pl-5 text-gray-800">
          {visit.physiotherapy.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Rehabilitation Exercises */}
    {visit.rehabilitationExercises?.length > 0 && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Rehabilitation Exercises</h3>
        <ul className="list-disc pl-5 text-gray-800">
          {visit.rehabilitationExercises.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Duration & Re-evaluation */}
    {visit.durationFrequency && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Duration & Re-evaluation</h3>
        <p className="text-gray-800">
          {visit.durationFrequency.timesPerWeek} times/week, Re-evaluation in {visit.durationFrequency.reEvalInWeeks} week(s)
        </p>
      </div>
    )}

    {/* Referrals */}
    {visit.referrals?.length > 0 && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Referrals</h3>
        <ul className="list-disc pl-5 text-gray-800">
          {visit.referrals.map((ref, idx) => (
            <li key={idx}>{ref}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Imaging */}
    {visit.imaging && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Imaging</h3>
        {['xray', 'mri', 'ct'].map((modality) => (
          visit.imaging[modality]?.length > 0 && (
            <div key={modality}>
              <p className="font-semibold capitalize">{modality}</p>
              <ul className="list-disc pl-5 text-gray-800">
                {visit.imaging[modality].map((part, idx) => (
                  <li key={idx}>{part}</li>
                ))}
              </ul>
            </div>
          )
        ))}
      </div>
    )}

    {/* Diagnostic Ultrasound */}
    {visit.diagnosticUltrasound && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Diagnostic Ultrasound</h3>
        <p className="text-gray-800">{visit.diagnosticUltrasound}</p>
      </div>
    )}

    {/* Nerve Study */}
    {visit.nerveStudy?.length > 0 && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nerve Study</h3>
        <ul className="list-disc pl-5 text-gray-800">
          {visit.nerveStudy.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Restrictions */}
    {visit.restrictions && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Restrictions</h3>
        <ul className="list-disc pl-5 text-gray-800">
          <li>Avoid Activity: {visit.restrictions.avoidActivityWeeks} week(s)</li>
          <li>Lifting Limit: {visit.restrictions.liftingLimitLbs} lbs</li>
          {visit.restrictions.avoidProlongedSitting && <li>Avoid prolonged sitting/standing</li>}
        </ul>
      </div>
    )}

    {/* Disability Duration */}
    {visit.disabilityDuration && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Disability Duration</h3>
        <p className="text-gray-800">{visit.disabilityDuration}</p>
      </div>
    )}

    {/* Other Notes */}
    {visit.otherNotes && (
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Other Notes</h3>
        <p className="text-gray-800 whitespace-pre-line">{visit.otherNotes}</p>
      </div>
    )}

  </div>
)}


        {/* Follow-up Visit Content */}
        {visit.visitType === 'Followup' && (
          <div className="space-y-6">
            {/* Progress Notes */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Progress Notes</h3>
              <p className="text-gray-800 whitespace-pre-line">{visit.progressNotes}</p>
            </div>

            {/* Vital Signs */}
            {visit.vitalSigns && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Vital Signs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visit.vitalSigns.temperature && (
                    <div>
                      <p className="text-sm text-gray-500">Temperature</p>
                      <p className="font-medium">{visit.vitalSigns.temperature} °F</p>
                    </div>
                  )}
                  {visit.vitalSigns.heartRate && (
                    <div>
                      <p className="text-sm text-gray-500">Heart Rate</p>
                      <p className="font-medium">{visit.vitalSigns.heartRate} bpm</p>
                    </div>
                  )}
                  {visit.vitalSigns.respiratoryRate && (
                    <div>
                      <p className="text-sm text-gray-500">Respiratory Rate</p>
                      <p className="font-medium">{visit.vitalSigns.respiratoryRate} breaths/min</p>
                    </div>
                  )}
                  {visit.vitalSigns.bloodPressure && (
                    <div>
                      <p className="text-sm text-gray-500">Blood Pressure</p>
                      <p className="font-medium">{visit.vitalSigns.bloodPressure} mmHg</p>
                    </div>
                  )}
                  {visit.vitalSigns.oxygenSaturation && (
                    <div>
                      <p className="text-sm text-gray-500">Oxygen Saturation</p>
                      <p className="font-medium">{visit.vitalSigns.oxygenSaturation}%</p>
                    </div>
                  )}
                  {visit.vitalSigns.weight && (
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium">{visit.vitalSigns.weight} kg</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Current Symptoms */}
            {visit.currentSymptoms && visit.currentSymptoms.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Current Symptoms</h3>
                <ul className="list-disc pl-5 text-gray-800">
                  {visit.currentSymptoms.map((symptom, index) => (
                    symptom && <li key={index}>{symptom}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Assessment Update */}
            {visit.assessmentUpdate && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment Update</h3>
                <p className="text-gray-800 whitespace-pre-line">{visit.assessmentUpdate}</p>
              </div>
            )}

            {/* Plan Update */}
            {visit.planUpdate && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Plan Update</h3>
                
                {/* Medications */}
                {visit.planUpdate.medications && visit.planUpdate.medications.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-800 mb-1">Medications</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Medication
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Dosage
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Frequency
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Changes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {visit.planUpdate.medications.map((medication, index) => (
                            medication.name && (
                              <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                                  {medication.name}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                                  {medication.dosage}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                                  {medication.frequency}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                                  {medication.duration}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                                  {medication.changes}
                                </td>
                              </tr>
                            )
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* New Tests */}
                {visit.planUpdate.newTests && visit.planUpdate.newTests.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-800 mb-1">New Tests</h4>
                    <ul className="list-disc pl-5 text-gray-800">
                      {visit.planUpdate.newTests.map((test, index) => (
                        test && <li key={index}>{test}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Next Follow-up */}
                {visit.planUpdate.nextFollowUp && (
                  <div>
                    <h4 className="text-md font-medium text-gray-800 mb-1">Next Follow-up</h4>
                    <p className="text-gray-800">
                      {new Date(visit.planUpdate.nextFollowUp).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Discharge Visit Content */}
        {visit.__t === 'DischargeVisit' && (
          <div className="space-y-6">
            {/* Treatment Summary */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Treatment Summary</h3>
              <p className="text-gray-800 whitespace-pre-line">{visit.treatmentSummary}</p>
            </div>

            {/* Discharge Diagnosis */}
            {visit.dischargeDiagnosis && visit.dischargeDiagnosis.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Discharge Diagnosis</h3>
                <ul className="list-disc pl-5 text-gray-800">
                  {visit.dischargeDiagnosis.map((diagnosis, index) => (
                    diagnosis && <li key={index}>{diagnosis}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medications at Discharge */}
            {visit.medicationsAtDischarge && visit.medicationsAtDischarge.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Medications at Discharge</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Medication
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dosage
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frequency
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {visit.medicationsAtDischarge.map((medication, index) => (
                        medication.name && (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                              {medication.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                              {medication.dosage}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                              {medication.frequency}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">
                              {medication.duration}
                            </td>
                          </tr>
                        )
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Follow-up Instructions */}
            {visit.followUpInstructions && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Follow-up Instructions</h3>
                <p className="text-gray-800 whitespace-pre-line">{visit.followUpInstructions}</p>
              </div>
            )}

            {/* Return Precautions */}
            {visit.returnPrecautions && visit.returnPrecautions.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Return Precautions</h3>
                <ul className="list-disc pl-5 text-gray-800">
                  {visit.returnPrecautions.map((precaution, index) => (
                    precaution && <li key={index}>{precaution}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Discharge Status */}
            {visit.dischargeStatus && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Discharge Status</h3>
                <p className="text-gray-800 capitalize">{visit.dischargeStatus}</p>
              </div>
            )}
          </div>
        )}

        {/* Additional Notes */}
        {visit.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Additional Notes</h3>
            <p className="text-gray-800 whitespace-pre-line">{visit.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitDetails;