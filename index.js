require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper maps for Enum values
const GENDER_MAP = {
  'Male': 'MALE',
  'Female': 'FEMALE',
  'MALE': 'MALE',
  'FEMALE': 'FEMALE'
};

const ACADEMIC_YEAR_MAP = {
  '1st Year': 'FIRST_YEAR',
  '2nd Year': 'SECOND_YEAR',
  '3rd Year': 'THIRD_YEAR',
  '4th Year': 'FOURTH_YEAR',
  '5th Year': 'FIFTH_YEAR',
  'Graduate': 'GRADUATE',
  'FIRST_YEAR': 'FIRST_YEAR',
  'SECOND_YEAR': 'SECOND_YEAR',
  'THIRD_YEAR': 'THIRD_YEAR',
  'FOURTH_YEAR': 'FOURTH_YEAR',
  'FIFTH_YEAR': 'FIFTH_YEAR',
  'GRADUATE': 'GRADUATE'
};

const COMMITTEE_MAP = {
  'Supply Chain': 'SUPPLY_CHAIN',
  'DCR': 'DCR',
  'PR': 'PR',
  'BD': 'BD',
  'People & Culture (HR)': 'PEOPLE_AND_CULTURE',
  'People & Culture': 'PEOPLE_AND_CULTURE',
  'QC': 'QC',
  'Technical': 'TECHNICAL',
  'Frontend for Mobile Applications': 'MOBILE',
  'Frontend for Websites': 'FRONTEND_WEB',
  'Backend': 'BACKEND',
  'Marketing': 'MARKETING',
  'Photography': 'PHOTOGRAPHY',
  'Editing': 'EDITING',
  'SUPPLY_CHAIN': 'SUPPLY_CHAIN',
  'PEOPLE_AND_CULTURE': 'PEOPLE_AND_CULTURE',
  'MOBILE': 'MOBILE',
  'FRONTEND_WEB': 'FRONTEND_WEB',
  'BACKEND': 'BACKEND',
  'MARKETING': 'MARKETING',
  'PHOTOGRAPHY': 'PHOTOGRAPHY',
  'EDITING': 'EDITING'
};

const parseBoolean = (val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    return val.trim().toLowerCase() === 'yes' || val.trim() === 'true' || val.trim() === '1';
  }
  return false;
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Submit Application Endpoint
app.post('/api/applications', async (req, res) => {
  try {
    const body = req.body;

    // Handle nested payload structure or flat structure
    const payload = body.applicantDetails ? {
      name: body.applicantDetails.fullName,
      email: body.applicantDetails.email,
      phone: body.applicantDetails.phone,
      gender: body.applicantDetails.gender,
      university: body.applicantDetails.university,
      faculty: body.applicantDetails.faculty,
      academic_year: body.applicantDetails.academicYear,
      linkedIn_link: body.applicantDetails.linkedinProfile,
      been_a_part_of_STP_before: body.stpAndCommitteeSelection.beenInStpBefore,
      previous_committee_Team: body.stpAndCommitteeSelection.previousCommitteeIfApplicable,
      previous_position_role: body.stpAndCommitteeSelection.previousRoleIfApplicable,
      committee: body.stpAndCommitteeSelection.appliedCommittee,
      involved_in_other_student_activities: body.stpAndCommitteeSelection.currentlyInvolvedInOtherActivities,
      previous_experience: body.experienceAndLeadership.hasCommitteeExperience,
      brief_about_experience: body.experienceAndLeadership.committeeExperienceDetails,
      led_a_team_before: body.experienceAndLeadership.hasLedTeamBefore,
      leadership_experience: body.experienceAndLeadership.leadershipExperienceDetails,
      why_interested: body.experienceAndLeadership.whyInterested,
      strongest_skills: body.experienceAndLeadership.strongestSkills,
      vision: body.experienceAndLeadership.visionForCommittee,
      handling_members_not_working: body.situationalResponses.uncommittedMembersAction,
      handling_members_leaving: body.situationalResponses.suddenDepartureAction,
      handling_dissagreement_with_VP: body.situationalResponses.disagreementWithVpAction,
      latest_achievement: body.situationalResponses.latestAchievement,
      value: body.situationalResponses.whyChooseYou,
      questions: body.situationalResponses.questionsForUs,
    } : body;

    const genderVal = GENDER_MAP[payload.gender || payload.genderVal] || 'MALE';
    const academicYearVal = ACADEMIC_YEAR_MAP[payload.academic_year || payload.academicYear] || 'FIRST_YEAR';
    const committeeVal = COMMITTEE_MAP[payload.committee || payload.appliedCommittee] || 'BACKEND';

    const newApplicant = await prisma.applicant.create({
      data: {
        name: payload.name || payload.fullName || '',
        email: payload.email || '',
        phone: payload.phone || '',
        gender: genderVal,
        university: payload.university || '',
        faculty: payload.faculty || '',
        academic_year: academicYearVal,
        linkedIn_link: payload.linkedIn_link || payload.linkedin || payload.linkedinProfile || '',
        been_a_part_of_STP_before: parseBoolean(payload.been_a_part_of_STP_before || payload.beenInStpBefore),
        previous_committee_Team: payload.previous_committee_Team || payload.previousCommitteeIfApplicable || null,
        previous_position_role: payload.previous_position_role || payload.previousRoleIfApplicable || null,
        committee: committeeVal,
        involved_in_other_student_activities: parseBoolean(payload.involved_in_other_student_activities || payload.involvedInOtherActivities),
        previous_experience: parseBoolean(payload.previous_experience || payload.hasCommitteeExperience),
        brief_about_experience: payload.brief_about_experience || payload.committeeExperienceDetails || null,
        led_a_team_before: parseBoolean(payload.led_a_team_before || payload.hasLedTeamBefore),
        leadership_experience: payload.leadership_experience || payload.leadershipExperienceDetails || null,
        why_interested: payload.why_interested || payload.whyInterested || '',
        strongest_skills: payload.strongest_skills || payload.strongestSkills || '',
        vision: payload.vision || payload.visionForCommittee || '',
        handling_members_not_working: payload.handling_members_not_working || payload.uncommittedMembersAction || '',
        handling_members_leaving: payload.handling_members_leaving || payload.suddenDepartureAction || '',
        handling_dissagreement_with_VP: payload.handling_dissagreement_with_VP || payload.disagreementWithVpAction || '',
        latest_achievement: payload.latest_achievement || payload.latestAchievement || '',
        value: payload.value || payload.whyChooseYou || '',
        questions: payload.questions || payload.questionsForUs || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: newApplicant,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while saving application',
      error: error.message,
    });
  }
});

// Fetch All Applications
app.get('/api/applications', async (req, res) => {
  try {
    const applications = await prisma.applicant.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve applications', error: error.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`STP Backend Server running on port ${PORT}`);
  });
}

module.exports = app;
