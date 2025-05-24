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

interface Visit {
  _id: string;
  date: string;
  visitType: string;
  __t: string;
}

const FollowupVisitForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [previousVisits, setPreviousVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [formData, setFormData] = useState({
    previousVisit: '',
    progressNotes: '',
    vitalSigns: {
      temperature: '',
      heartRate: '',
      respiratoryRate: '',
      bloodPressure: '',
      oxygenSaturation: '',
      weight: ''
    },
    currentSymptoms: [''],
    assessmentUpdate: '',
    planUpdate: {
      medications: [{ name: '', dosage: '', frequency: '', duration: '', changes: '' }],
      newTests: [''],
      nextFollowUp: ''
    },
    notes: ''
  });
  
  // Auto-save timer
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [localFormData, setLocalFormData] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch patient data
        const patientResponse = await axios.get(`http://localhost:5000/api/patients/${id}`);
        setPatient(patientResponse.data);
        
        // Fetch previous visits
        const visitsResponse = await axios.get(`http://localhost:5000/api/patients/${id}/visits`);
        setPreviousVisits(visitsResponse.data);
        
        // Check for locally saved form data
        const savedData = localStorage.getItem(`followupVisit_${id}`);
        if (savedData) {
          setLocalFormData(savedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
    
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
      localStorage.setItem(`followupVisit_${id}`, JSON.stringify(formData));
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
      localStorage.setItem(`followupVisit_${id}`, JSON.stringify(formData));
      setAutoSaveStatus('Form auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const handleArrayChange = (category: string, index: number, value: string) => {
    if (category === 'currentSymptoms') {
      const updatedArray = [...formData.currentSymptoms];
      updatedArray[index] = value;
      
      setFormData(prev => ({
        ...prev,
        currentSymptoms: updatedArray
      }));
    } else if (category === 'newTests') {
      const updatedArray = [...formData.planUpdate.newTests];
      updatedArray[index] = value;
      
      setFormData(prev => ({
        ...prev,
        planUpdate: {
          ...prev.planUpdate,
          newTests: updatedArray
        }
      }));
    }
    
    // Set up auto-save
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      localStorage.setItem(`followupVisit_${id}`, JSON.stringify(formData));
      setAutoSaveStatus('Form auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...formData.planUpdate.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      planUpdate: {
        ...prev.planUpdate,
        medications: updatedMedications
      }
    }));
    
    // Set up auto-save
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      localStorage.setItem(`followupVisit_${id}`, JSON.stringify(formData));
      setAutoSaveStatus('Form auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const addArrayItem = (category: string) => {
    if (category === 'medications') {
      setFormData(prev => ({
        ...prev,
        planUpdate: {
          ...prev.planUpdate,
          medications: [...prev.planUpdate.medications, { name: '', dosage: '', frequency: '', duration: '', changes: '' }]
        }
      }));
    } else if (category === 'currentSymptoms') {
      setFormData(prev => ({
        ...prev,
        currentSymptoms: [...prev.currentSymptoms, '']
      }));
    } else if (category === 'newTests') {
      setFormData(prev => ({
        ...prev,
        planUpdate: {
          ...prev.planUpdate,
          newTests: [...prev.planUpdate.newTests, '']
        }
      }));
    }
  };

  const removeArrayItem = (category: string, index: number) => {
    if (category === 'medications') {
      const updatedMedications = [...formData.planUpdate.medications];
      updatedMedications.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        planUpdate: {
          ...prev.planUpdate,
          medications: updatedMedications
        }
      }));
    } else if (category === 'currentSymptoms') {
      const updatedSymptoms = [...formData.currentSymptoms];
      updatedSymptoms.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        currentSymptoms: updatedSymptoms
      }));
    } else if (category === 'newTests') {
      const updatedTests = [...formData.planUpdate.newTests];
      updatedTests.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        planUpdate: {
          ...prev.planUpdate,
          newTests: updatedTests
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
    localStorage.removeItem(`followupVisit_${id}`);
    setLocalFormData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.previousVisit) {
      alert('Please select a previous visit');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await axios.post(`http://localhost:5000/api/patients/${id}/visits/followup`, formData);
      
      // Clear local storage after successful submission
      localStorage.removeItem(`followupVisit_${id}`);
      
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

  if (previousVisits.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No previous visits found for this patient. Please create an initial visit first.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => navigate(`/patients/${id}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patient
          </button>
          <button
            onClick={() => navigate(`/patients/${id}/visits/initial`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Initial Visit
          </button>
        </div>
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
          <h1 className="text-2xl font-semibold text-gray-800">Follow-up Visit</h1>
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
          {/* Previous Visit Selection */}
          <div>
            <label htmlFor="previousVisit" className="block text-sm font-medium text-gray-700 mb-1">
              Previous Visit*
            </label>
            <select
              id="previousVisit"
              name="previousVisit"
              value={formData.previousVisit}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select previous visit</option>
              {previousVisits.map((visit) => (
                <option key={visit._id} value={visit._id}>
                  {new Date(visit.date).toLocaleDateString()} - {visit.visitType === 'initial' ? 'Initial Visit' : 'Follow-up'}
                </option>
              ))}
            </select>
          </div>

          {/* Progress Notes */}
          <div>
            <label htmlFor="progressNotes" className="block text-sm font-medium text-gray-700 mb-1">
              Progress Notes*
            </label>
            <textarea
              id="progressNotes"
              name="progressNotes"
              value={formData.progressNotes}
              onChange={handleChange}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Progress since last visit"
            />
          </div>

          {/* Vital Signs */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Vital Signs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Current Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Symptoms</label>
            {formData.currentSymptoms.map((symptom, index) => (
              <div key={`symptom-${index}`} className="flex items-center mb-2">
                <input
                  type="text"
                  value={symptom}
                  onChange={(e) => handleArrayChange('currentSymptoms', index, e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter symptom"
                />
                {formData.currentSymptoms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('currentSymptoms', index)}
                    className="ml-2 p-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('currentSymptoms')}
              className="mt-1 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Symptom
            </button>
          </div>

          {/* Assessment Update */}
          <div>
            <label htmlFor="assessmentUpdate" className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Update*
            </label>
            <textarea
              id="assessmentUpdate"
              name="assessmentUpdate"
              value={formData.assessmentUpdate}
              onChange={handleChange}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Updated clinical assessment"
            />
          </div>

          {/* Plan Update */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Plan Update</h3>
            
            {/* Medications */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Medications</label>
              {formData.planUpdate.medications.map((medication, index) => (
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
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Changes from Previous</label>
                      <input
                        type="text"
                        value={medication.changes}
                        onChange={(e) => handleMedicationChange(index, 'changes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., increased dosage, new medication, discontinued"
                      />
                    </div>
                  </div>
                  {formData.planUpdate.medications.length > 1 && (
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
            
            {/* New Tests */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Tests</label>
              {formData.planUpdate.newTests.map((test, index) => (
                <div key={`test-${index}`} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={test}
                    onChange={(e) => handleArrayChange('newTests', index, e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new test or imaging"
                  />
                  {formData.planUpdate.newTests.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('newTests', index)}
                      className="ml-2 p-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('newTests')}
                className="mt-1 text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Test
              </button>
            </div>
            
            {/* Next Follow-up */}
            <div>
              <label htmlFor="nextFollowUp" className="block text-sm font-medium text-gray-700 mb-1">
                Next Follow-up
              </label>
              <input
                type="date"
                id="nextFollowUp"
                name="planUpdate.nextFollowUp"
                value={formData.planUpdate.nextFollowUp}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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

export default FollowupVisitForm;