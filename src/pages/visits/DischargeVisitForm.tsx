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

const DischargeVisitForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [formData, setFormData] = useState({
    treatmentSummary: '',
    dischargeDiagnosis: [''],
    medicationsAtDischarge: [{ name: '', dosage: '', frequency: '', duration: '' }],
    followUpInstructions: '',
    returnPrecautions: [''],
    dischargeStatus: 'improved',
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
        const savedData = localStorage.getItem(`dischargeVisit_${id}`);
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
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Set up auto-save
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      localStorage.setItem(`dischargeVisit_${id}`, JSON.stringify(formData));
      setAutoSaveStatus('Form auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const handleArrayChange = (category: string, index: number, value: string) => {
    if (category === 'dischargeDiagnosis') {
      const updatedArray = [...formData.dischargeDiagnosis];
      updatedArray[index] = value;
      
      setFormData(prev => ({
        ...prev,
        dischargeDiagnosis: updatedArray
      }));
    } else if (category === 'returnPrecautions') {
      const updatedArray = [...formData.returnPrecautions];
      updatedArray[index] = value;
      
      setFormData(prev => ({
        ...prev,
        returnPrecautions: updatedArray
      }));
    }
    
    // Set up auto-save
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      localStorage.setItem(`dischargeVisit_${id}`, JSON.stringify(formData));
      setAutoSaveStatus('Form auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...formData.medicationsAtDischarge];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    
    setFormData(prev => ({
      ...prev,
      medicationsAtDischarge: updatedMedications
    }));
    
    // Set up auto-save
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    const timer = setTimeout(() => {
      localStorage.setItem(`dischargeVisit_${id}`, JSON.stringify(formData));
      setAutoSaveStatus('Form auto-saved');
      setTimeout(() => setAutoSaveStatus(''), 2000);
    }, 2000);
    
    setAutoSaveTimer(timer);
  };

  const addArrayItem = (category: string) => {
    if (category === 'medicationsAtDischarge') {
      setFormData(prev => ({
        ...prev,
        medicationsAtDischarge: [...prev.medicationsAtDischarge, { name: '', dosage: '', frequency: '', duration: '' }]
      }));
    } else if (category === 'dischargeDiagnosis') {
      setFormData(prev => ({
        ...prev,
        dischargeDiagnosis: [...prev.dischargeDiagnosis, '']
      }));
    } else if (category === 'returnPrecautions') {
      setFormData(prev => ({
        ...prev,
        returnPrecautions: [...prev.returnPrecautions, '']
      }));
    }
  };

  const removeArrayItem = (category: string, index: number) => {
    if (category === 'medicationsAtDischarge') {
      const updatedMedications = [...formData.medicationsAtDischarge];
      updatedMedications.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        medicationsAtDischarge: updatedMedications
      }));
    } else if (category === 'dischargeDiagnosis') {
      const updatedDiagnoses = [...formData.dischargeDiagnosis];
      updatedDiagnoses.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        dischargeDiagnosis: updatedDiagnoses
      }));
    } else if (category === 'returnPrecautions') {
      const updatedPrecautions = [...formData.returnPrecautions];
      updatedPrecautions.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        returnPrecautions: updatedPrecautions
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
    localStorage.removeItem(`dischargeVisit_${id}`);
    setLocalFormData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await axios.post(`http://localhost:5000/api/patients/${id}/visits/discharge`, formData);
      
      // Clear local storage after successful submission
      localStorage.removeItem(`dischargeVisit_${id}`);
      
      navigate(`/patients/${id}`);
    } catch (error) {
      console.error('Error saving discharge visit:', error);
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
          <h1 className="text-2xl font-semibold text-gray-800">Discharge Visit</h1>
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
          {/* Treatment Summary */}
          <div>
            <label htmlFor="treatmentSummary" className="block text-sm font-medium text-gray-700 mb-1">
              Treatment Summary*
            </label>
            <textarea
              id="treatmentSummary"
              name="treatmentSummary"
              value={formData.treatmentSummary}
              onChange={handleChange}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Summary of treatment provided during the course of care"
            />
          </div>

          {/* Discharge Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discharge Diagnosis*</label>
            {formData.dischargeDiagnosis.map((diagnosis, index) => (
              <div key={`diagnosis-${index}`} className="flex items-center mb-2">
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => handleArrayChange('dischargeDiagnosis', index, e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter diagnosis"
                  required={index === 0}
                />
                {formData.dischargeDiagnosis.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('dischargeDiagnosis', index)}
                    className="ml-2 p-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('dischargeDiagnosis')}
              className="mt-1 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Diagnosis
            </button>
          </div>

          {/* Medications at Discharge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medications at Discharge</label>
            {formData.medicationsAtDischarge.map((medication, index) => (
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
                {formData.medicationsAtDischarge.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('medicationsAtDischarge', index)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Medication
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('medicationsAtDischarge')}
              className="mt-1 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Medication
            </button>
          </div>

          {/* Follow-up Instructions */}
          <div>
            <label htmlFor="followUpInstructions" className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Instructions*
            </label>
            <textarea
              id="followUpInstructions"
              name="followUpInstructions"
              value={formData.followUpInstructions}
              onChange={handleChange}
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Instructions for follow-up care"
            />
          </div>

          {/* Return Precautions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Return Precautions</label>
            {formData.returnPrecautions.map((precaution, index) => (
              <div key={`precaution-${index}`} className="flex items-center mb-2">
                <input
                  type="text"
                  value={precaution}
                  onChange={(e) => handleArrayChange('returnPrecautions', index, e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter return precaution"
                />
                {formData.returnPrecautions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('returnPrecautions', index)}
                    className="ml-2 p-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('returnPrecautions')}
              className="mt-1 text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Precaution
            </button>
          </div>

          {/* Discharge Status */}
          <div>
            <label htmlFor="dischargeStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Discharge Status*
            </label>
            <select
              id="dischargeStatus"
              name="dischargeStatus"
              value={formData.dischargeStatus}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="improved">Improved</option>
              <option value="stable">Stable</option>
              <option value="other">Other</option>
            </select>
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
                  Complete Discharge
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DischargeVisitForm;