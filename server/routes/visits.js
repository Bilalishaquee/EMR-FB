import express from 'express';
import { Visit, InitialVisit, FollowupVisit, DischargeVisit } from '../models/Visit.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a visit based on visitType
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { visitType, ...visitData } = req.body;

    let newVisit;
    if (visitType === 'initial') {
      newVisit = new InitialVisit(visitData);
    } else if (visitType === 'followup') {
      newVisit = new FollowupVisit(visitData);
    } else if (visitType === 'discharge') {
      newVisit = new DischargeVisit(visitData);
    } else {
      return res.status(400).json({ message: 'Invalid visit type' });
    }

    await newVisit.save();
    res.status(201).json(newVisit);
  } catch (error) {
    console.error('Visit creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all visits for a patient
router.get('/patient/:patientId', authenticateToken, async (req, res) => {
  try {
    const visits = await Visit.find({ patient: req.params.patientId })
      .populate('doctor')
      .populate('patient');

    res.json(visits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
