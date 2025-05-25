import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
}

const InitialVisitForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [formData, setFormData] = useState({
    chiefComplaint: '',
    historyOfPresentIllness: '',
    vitalSigns: {
      temperature: '',
      heartRate: '',
      respiratoryRate: '',
      bloodPressure: '',
      oxygenSaturation: '',
      height: '',
      weight: ''
    },
    physicalExamination: {
      general: '',
      heent: '',
      cardiovascular: '',
      respiratory: '',
      gastrointestinal: '',
      musculoskeletal: '',
      neurological: '',
      skin: ''
    },
    assessment: '',
    plan: {
      diagnosis: [''],
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      labTests: [''],
      imaging: [''],
      followUpPlan: ''
    },
    notes: ''
  });
  
  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [localFormData, setLocalFormData] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatient = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/patients/${id}`);
        setPatient(response.data);
        
        // Check for locally saved form data
        const savedData = localStorage.getItem(`initialVisit_${id}`);
        if (savedData) {
          setLocalFormData(savedData);
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatient();
    
    // Clean up auto-save timer on unmount
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Set up auto-save
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      localStorage.setItem(`initialVisit_${id}`, JSON.stringify(formData));
      setAutoSaveStatus('Form auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const handleVitalSignsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [name]: value
      }
    }));
    
    // Set up auto-save
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      localStorage.setItem(`initialVisit_${id}`, JSON.stringify(formData));
      setAutoSaveStatus('Form auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const handlePhysicalExamChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      physicalExamination: {
        ...prev.physicalExamination,
        [name]: value
      }
    }));
    
    // Set up auto-save
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      localStorage.setItem(`initialVisit_${id}`, JSON.stringify(formData));
      setAutoSaveStatus('Form auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const handleArrayChange = (category: string, index: number, value: string) => {
    const updatedArray = [...formData.plan[category as 'diagnosis' | 'labTests' | 'imaging'] as string[]];
    updatedArray[index] = value;
    
    setFormData(prev => ({
      ...prev,
      plan: {
        ...prev.plan,
        [category]: updatedArray
      }
    }));
    
    // Set up auto-save
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      localStorage.setItem(`initialVisit_${id}`, JSON.stringify(formData));
      setAutoSaveStatus('Form auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...formData.plan.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      plan: {
        ...prev.plan,
        medications: updatedMedications
      }
    }));
    
    // Set up auto-save
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      localStorage.setItem(`initialVisit_${id}`, JSON.stringify(formData));
      setAutoSaveStatus('Form auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const addArrayItem = (category: string) => {
    if (category === 'medications') {
      setFormData(prev => ({
        ...prev,
        plan: {
          ...prev.plan,
          medications: [...prev.plan.medications, { name: '', dosage: '', frequency: '', duration: '' }]
        }
      }));
    } else {
      const updatedArray = [...formData.plan[category as 'diagnosis' | 'labTests' | 'imaging'] as string[], ''];
      
      setFormData(prev => ({
        ...prev,
        plan: {
          ...prev.plan,
          [category]: updatedArray
        }
      }));
    }
  };

  const removeArrayItem = (category: string, index: number) => {
    if (category === 'medications') {
      const updatedMedications = [...formData.plan.medications];
      updatedMedications.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        plan: {
          ...prev.plan,
          medications: updatedMedications
        }
      }));
    } else {
      const updatedArray = [...formData.plan[category as 'diagnosis' | 'labTests' | 'imaging'] as string[]];
      updatedArray.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        plan: {
          ...prev.plan,
          [category]: updatedArray
        }
      }));
    }
  };

  const loadSavedForm = () => {
    if (localFormData) {
      setFormData(JSON.parse(localFormData));
      setLocalFormData(null);
    }
  };

  const discardSavedForm = () => {
    localStorage.removeItem(`initialVisit_${id}`);
    setLocalFormData(null);
  };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSaving(true);
    
//     try {
//       // await axios.post(`http://localhost:5000/api/patients/${id}/visits/initial`, formData);
//      await axios.post(`http://localhost:5000/api/patients/${id}/visits/initial`, {
//   ...formData,
//   visitType: 'initial',
//   doctor: user?._id,
// });

      
//       // Clear local storage after successful submission
//       localStorage.removeItem(`initialVisit_${id}`);
      
//       navigate(`/patients/${id}`);
//     } catch (error) {
//       console.error('Error saving visit:', error);
//     } finally {
//       setIsSaving(false);
//     }
//   };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSaving(true);

  try {
    const cleanedData = {
      ...formData,
      visitType: 'initial',
      doctor: user?._id,
      vitalSigns: {
        temperature: Number(formData.vitalSigns.temperature),
        heartRate: Number(formData.vitalSigns.heartRate),
        respiratoryRate: Number(formData.vitalSigns.respiratoryRate),
        bloodPressure: formData.vitalSigns.bloodPressure,
        oxygenSaturation: Number(formData.vitalSigns.oxygenSaturation),
        height: Number(formData.vitalSigns.height),
        weight: Number(formData.vitalSigns.weight),
      },
    };

    console.log('Submitting visit data:', cleanedData);
    await axios.post(`http://localhost:5000/api/patients/${id}/visits/initial`, cleanedData);

    localStorage.removeItem(`initialVisit_${id}`);
    navigate(`/patients/${id}`);
  } catch (error) {
    console.error('Error saving visit:', error);
  } finally {
    setIsSaving(false);
  }
};


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">Patient not found</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/patients')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/patients/${id}`)}
          className="mr-4 p-2 rounded-full hover:bg-gray-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Initial Visit</h1>
          <p className="text-gray-600">
            Patient: {patient.firstName} {patient.lastName}
          </p>
        </div>
      </div>

      {localFormData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have an unsaved form. Would you like to continue where you left off?
              </p>
              <div className="mt-2">
                <button
                  onClick={loadSavedForm}
                  className="mr-2 text-sm font-medium text-yellow-700 hover:text-yellow-600"
                >
                  Load saved form
                </button>
                <button
                  onClick={discardSavedForm}
                  className="text-sm font-medium text-gray-600 hover:text-gray-500"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {autoSaveStatus && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-md shadow-md">
          {autoSaveStatus}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="space-y-6">
          {/* Chief Complaint */}
          <div>
            <label htmlFor="chiefComplaint" className="block text-sm font-medium text-gray-700 mb-1">
              Chief Complaint*
            </label>
            <input
              type="text"
              id="chiefComplaint"
              name="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Patient's main concern"
            />
          </div>

          {/* History of Present Illness */}
          <div>
            <label htmlFor="historyOfPresentIllness" className="block text-sm font-medium text-gray-700 mb-1">
              History of Present Illness
            </label>
            <textarea
              id="historyOfPresentIllness"
              name="historyOfPresentIllness"
              value={formData.historyOfPresentIllness}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed description of the illness progression"
            />
          </div>

          {/* Vital Signs */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Vital Signs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (°F)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="temperature"
                  name="temperature"
                  value={formData.vitalSigns.temperature}
                  onChange={handleVitalSignsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  id="heartRate"
                  name="heartRate"
                  value={formData.vitalSigns.heartRate}
                  onChange={handleVitalSignsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="respiratoryRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Respiratory Rate (breaths/min)
                </label>
                <input
                  type="number"
                  id="respiratoryRate"
                  name="respiratoryRate"
                  value={formData.vitalSigns.respiratoryRate}
                  onChange={handleVitalSignsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Pressure (mmHg)
                </label>
                <input
                  type="text"
                  id="bloodPressure"
                  name="bloodPressure"
                  value={formData.vitalSigns.bloodPressure}
                  onChange={handleVitalSignsChange}
                  placeholder="e.g., 120/80"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="oxygenSaturation" className="block text-sm font-medium text-gray-700 mb-1">
                  Oxygen Saturation (%)
                </label>
                <input
                  type="number"
                  id="oxygenSaturation"
                  name="oxygenSaturation"
                  value={formData.vitalSigns.oxygenSaturation}
                  onChange={handleVitalSignsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.vitalSigns.height}
                  onChange={handleVitalSignsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="weight"
                  name="weight"
                  value={formData.vitalSigns.weight}
                  onChange={handleVitalSignsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Physical Examination */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Physical Examination</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="general" className="block text-sm font-medium text-gray-700 mb-1">
                  General
                </label>
                <textarea
                  id="general"
                  name="general"
                  value={formData.physicalExamination.general}
                  onChange={handlePhysicalExamChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="heent" className="block text-sm font-medium text-gray-700 mb-1">
                  HEENT (Head, Eyes, Ears, Nose, Throat)
                </label>
                <textarea
                  id="heent"
                  name="heent"
                  value={formData.physicalExamination.heent}
                  onChange={handlePhysicalExamChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="cardiovascular" className="block text-sm font-medium text-gray-700 mb-1">
                  Cardiovascular
                </label>
                <textarea
                  id="cardiovascular"
                  name="cardiovascular"
                  value={formData.physicalExamination.cardiovascular}
                  onChange={handlePhysicalExamChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="respiratory" className="block text-sm font-medium text-gray-700 mb-1">
                  Respiratory
                </label>
                <textarea
                  id="respiratory"
                  name="respiratory"
                  value={formData.physicalExamination.respiratory}
                  onChange={handlePhysicalExamChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="gastrointestinal" className="block text-sm font-medium text-gray-700 mb-1">
                  Gastrointestinal
                </label>
                <textarea
                  id="gastrointestinal"
                  name="gastrointestinal"
                  value={formData.physicalExamination.gastrointestinal}
                  onChange={handlePhysicalExamChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="musculoskeletal" className="block text-sm font-medium text-gray-700 mb-1">
                  Musculoskeletal
                </label>
                <textarea
                  id="musculoskeletal"
                  name="musculoskeletal"
                  value={formData.physicalExamination.musculoskeletal}
                  onChange={handlePhysicalExamChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="neurological" className="block text-sm font-medium text-gray-700 mb-1">
                  Neurological
                </label>
                <textarea
                  id="neurological"
                  name="neurological"
                  value={formData.physicalExamination.neurological}
                  onChange={handlePhysicalExamChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="skin" className="block text-sm font-medium text-gray-700 mb-1">
                  Skin
                </label>
                <textarea
                  id="skin"
                  name="skin"
                  value={formData.physicalExamination.skin}
                  onChange={handlePhysicalExamChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Assessment */}
          <div>
            <label htmlFor="assessment" className="block text-sm font-medium text-gray-700 mb-1">
              Assessment*
            </label>
            <textarea
              id="assessment"
              name="assessment"
              value={formData.assessment}
              onChange={handleChange}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Clinical assessment and impressions"
            />
          </div>

          {/* Plan */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Plan</h3>
            
            {/* Diagnosis */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
              {formData.plan.diagnosis.map((diagnosis, index) => (
                <div key={`diagnosis-${index}`} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => handleArrayChange('diagnosis', index, e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter diagnosis"
                  />
                  {formData.plan.diagnosis.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('diagnosis', index)}
                      className="ml-2 p-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('diagnosis')}
                className="mt-1 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Diagnosis
              </button>
            </div>
            
            {/* Medications */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
              {formData.plan.medications.map((medication, index) => (
                <div key={`medication-${index}`} className="p-3 border border-gray-200 rounded-md mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Medication Name</label>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Medication name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Dosage</label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 500mg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., twice daily"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Duration</label>
                      <input
                        type="text"
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 7 days"
                      />
                    </div>
                  </div>
                  {formData.plan.medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('medications', index)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove Medication
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('medications')}
                className="mt-1 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Medication
              </button>
            </div>
            
            {/* Lab Tests */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Lab Tests</label>
              {formData.plan.labTests.map((test, index) => (
                <div key={`test-${index}`} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={test}
                    onChange={(e) => handleArrayChange('labTests', index, e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter lab test"
                  />
                  {formData.plan.labTests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('labTests', index)}
                      className="ml-2 p-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('labTests')}
                className="mt-1 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Lab Test
              </button>
            </div>
            
            {/* Imaging */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Imaging</label>
              {formData.plan.imaging.map((image, index) => (
                <div key={`image-${index}`} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => handleArrayChange('imaging', index, e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter imaging study"
                  />
                  {formData.plan.imaging.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('imaging', index)}
                      className="ml-2 p-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('imaging')}
                className="mt-1 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Imaging
              </button>
            </div>
            
            {/* Follow-up Plan */}
            <div>
              <label htmlFor="followUpPlan" className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Plan
              </label>
              <textarea
                id="followUpPlan"
                name="plan.followUpPlan"
                value={formData.plan.followUpPlan}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Follow-up instructions and timeline"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any additional notes or observations"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate(`/patients/${id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Visit
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InitialVisitForm;