import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const DischargeVisitForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    areasImproving: false,
    areasExacerbated: false,
    areasSame: false,
    musclePalpation: '',
    painRadiating: '',
    romPercent: '',
    orthos: {
      tests: '',
      result: ''
    },
    activitiesCausePain: '',
    otherNotes: '',
    prognosis: '',
    diagnosticStudy: {
      study: '',
      bodyPart: '',
      result: ''
    },
    futureMedicalCare: [],
    croftCriteria: '',
    amaDisability: '',
    homeCare: [],
    referralsNotes: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleMultiSelect = (field, options) => {
    setFormData((prev) => ({ ...prev, [field]: options }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/visits', {
        ...formData,
        visitType: 'discharge',
        patient: id
      });
      
      navigate(`/patients/${id}`);
    } catch (err) {
      console.error('Error submitting form', err);
      alert('Form submission failed. Check console for details.');
    }
  };
  

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-semibold">EXAM FORM — DISCHARGE</h2>

      <div className="flex gap-4">
        <label><input type="checkbox" name="areasImproving" checked={formData.areasImproving} onChange={handleChange} /> Improving</label>
        <label><input type="checkbox" name="areasExacerbated" checked={formData.areasExacerbated} onChange={handleChange} /> Exacerbated</label>
        <label><input type="checkbox" name="areasSame" checked={formData.areasSame} onChange={handleChange} /> Same</label>
      </div>

      <textarea name="musclePalpation" value={formData.musclePalpation} onChange={handleChange} placeholder="Muscle Palpation Results" className="w-full border p-2" />
      <textarea name="painRadiating" value={formData.painRadiating} onChange={handleChange} placeholder="Pain Radiating" className="w-full border p-2" />
      <input type="number" name="romPercent" value={formData.romPercent} onChange={handleChange} placeholder="ROM % Pre-injury" className="w-full border p-2" />

      <input type="text" value={formData.orthos.tests} onChange={(e) => handleNestedChange('orthos', 'tests', e.target.value)} placeholder="Orthos Tests" className="w-full border p-2" />
      <input type="text" value={formData.orthos.result} onChange={(e) => handleNestedChange('orthos', 'result', e.target.value)} placeholder="Orthos Result" className="w-full border p-2" />

      <textarea name="activitiesCausePain" value={formData.activitiesCausePain} onChange={handleChange} placeholder="Activities That Cause Pain" className="w-full border p-2" />
      <textarea name="otherNotes" value={formData.otherNotes} onChange={handleChange} placeholder="Other Notes" className="w-full border p-2" />

      <h2 className="text-xl font-semibold">ASSESSMENT AND PLAN</h2>

      <select name="prognosis" value={formData.prognosis} onChange={handleChange} className="w-full border p-2">
        <option value="">Select Prognosis</option>
        <option>The patient has reached a plateau...</option>
        <option>The patient has received maximum benefits...</option>
      </select>

      <input type="text" value={formData.diagnosticStudy.study} onChange={(e) => handleNestedChange('diagnosticStudy', 'study', e.target.value)} placeholder="Study Type" className="w-full border p-2" />
      <input type="text" value={formData.diagnosticStudy.bodyPart} onChange={(e) => handleNestedChange('diagnosticStudy', 'bodyPart', e.target.value)} placeholder="Body Part" className="w-full border p-2" />
      <input type="text" value={formData.diagnosticStudy.result} onChange={(e) => handleNestedChange('diagnosticStudy', 'result', e.target.value)} placeholder="Result" className="w-full border p-2" />

      <input type="text" name="croftCriteria" value={formData.croftCriteria} onChange={handleChange} placeholder="Croft Criteria Grade" className="w-full border p-2" />

      <select name="amaDisability" value={formData.amaDisability} onChange={handleChange} className="w-full border p-2">
        <option value="">Select AMA Disability Grade</option>
        <option>Grade I</option>
        <option>Grade II</option>
        <option>Grade III</option>
        <option>Grade IV</option>
      </select>

      <textarea name="referralsNotes" value={formData.referralsNotes} onChange={handleChange} placeholder="Referrals / Recommendations / Notes" className="w-full border p-2" />

      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
    </form>
  );
};

export default DischargeVisitForm;
