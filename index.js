require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = process.env.PORT || 5000;

// Lazy Prisma instantiation — prevents crash on serverless cold start
let prisma;
function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

// Replace app.use(cors()); with:
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle OPTIONS explicitly
app.options('*', cors());
app.use(express.json());

// ──────────────────────────────────────────────
// Helper Maps for Enum Values
// ──────────────────────────────────────────────
const GENDER_MAP = {
  'Male': 'MALE', 'Female': 'FEMALE',
  'MALE': 'MALE', 'FEMALE': 'FEMALE'
};

const ACADEMIC_YEAR_MAP = {
  // Frontend values
  '1st year': 'FIRST_YEAR',
  '2nd year': 'SECOND_YEAR',
  '3rd year': 'THIRD_YEAR',
  '4th year': 'FOURTH_YEAR',
  '5th year': 'FIFTH_YEAR',
  'Graduate': 'GRADUATE',

  // Also accept capitalized versions
  '1st Year': 'FIRST_YEAR',
  '2nd Year': 'SECOND_YEAR',
  '3rd Year': 'THIRD_YEAR',
  '4th Year': 'FOURTH_YEAR',
  '5th Year': 'FIFTH_YEAR',

  // Already-normalized values
  FIRST_YEAR: 'FIRST_YEAR',
  SECOND_YEAR: 'SECOND_YEAR',
  THIRD_YEAR: 'THIRD_YEAR',
  FOURTH_YEAR: 'FOURTH_YEAR',
  FIFTH_YEAR: 'FIFTH_YEAR',
  GRADUATE: 'GRADUATE',
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

  'Mobile Application': 'MOBILE',
  'Mobile application': 'MOBILE',

  'Frontend (Web)': 'FRONTEND_WEB',
  'Backend': 'BACKEND',
  'Marketing': 'MARKETING',
  'Photography': 'PHOTOGRAPHY',
  'Video Editing': 'VIDEO_EDITING',
  'Graphic Design': 'GRAPHIC_DESIGN',

  // Already-normalized values
  SUPPLY_CHAIN: 'SUPPLY_CHAIN',
  DCR: 'DCR',
  PR: 'PR',
  BD: 'BD',
  PEOPLE_AND_CULTURE: 'PEOPLE_AND_CULTURE',
  QC: 'QC',
  TECHNICAL: 'TECHNICAL',
  MOBILE: 'MOBILE',
  FRONTEND_WEB: 'FRONTEND_WEB',
  BACKEND: 'BACKEND',
  MARKETING: 'MARKETING',
  PHOTOGRAPHY: 'PHOTOGRAPHY',
  VIDEO_EDITING: 'VIDEO_EDITING',
  GRAPHIC_DESIGN: 'GRAPHIC_DESIGN',
};


// ──────────────────────────────────────────────
// Test / Health Endpoint
// ──────────────────────────────────────────────
app.get(['/', '/api/health', '/api/test'], async (req, res) => {
  try {
    const db = getPrisma();
    const applicantCount = await db.applicant.count();
    res.json({
      success: true,
      message: 'STP Board Applications Backend API is active and running!',
      database: 'Connected to Neon PostgreSQL',
      totalApplicationsInDatabase: applicantCount,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Database connection test error:', error);
    res.status(500).json({
      success: false,
      message: 'Backend API is running, but database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ──────────────────────────────────────────────
// POST /api/applications — Submit Application
// ──────────────────────────────────────────────
app.post('/api/applications', async (req, res) => {
  try {
    const db = getPrisma();
    const body = req.body;

    const applicantDetails = body.applicantDetails;
    const stpSelection = body.stpAndCommitteeSelection;
    const experience = body.experienceAndLeadership;
    const situational = body.situationalResponses;

    if (
      !applicantDetails ||
      !stpSelection ||
      !experience ||
      !situational
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application payload',
      });
    }

    const toBoolean = (value) => {
      if (typeof value === 'boolean') {
        return value;
      }

      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();

        if (normalized === 'yes' || normalized === 'true' || normalized === '1') {
          return true;
        }

        if (normalized === 'no' || normalized === 'false' || normalized === '0') {
          return false;
        }
      }

      return null;
    };

    const genderVal = GENDER_MAP[applicantDetails.gender];

    const academicYearVal =
      ACADEMIC_YEAR_MAP[applicantDetails.academicYear];

    const committeeVal =
      COMMITTEE_MAP[stpSelection.appliedCommittee];

    if (!genderVal) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gender value',
      });
    }

    if (!academicYearVal) {
      return res.status(400).json({
        success: false,
        message: 'Invalid academic year value',
      });
    }

    if (!committeeVal) {
      return res.status(400).json({
        success: false,
        message: 'Invalid committee value',
      });
    }

    const beenInStpBefore = toBoolean(
      stpSelection.beenInStpBefore
    );

    const involvedInOtherActivities = toBoolean(
      stpSelection.currentlyInvolvedInOtherActivities
    );

    const previousExperience = toBoolean(
      experience.hasCommitteeExperience
    );

    const ledATeamBefore = toBoolean(
      experience.hasLedTeamBefore
    );

    if (
      beenInStpBefore === null ||
      involvedInOtherActivities === null ||
      previousExperience === null ||
      ledATeamBefore === null
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Yes/No value in application',
      });
    }

    const newApplicant = await db.applicant.create({
      data: {
        // Personal information
        name: applicantDetails.fullName,
        email: applicantDetails.email,
        phone: applicantDetails.phone,
        gender: genderVal,
        university: applicantDetails.university,
        faculty: applicantDetails.faculty,
        academic_year: academicYearVal,
        linkedIn_link: applicantDetails.linkedinProfile,

        // STP and committee selection
        been_a_part_of_STP_before: beenInStpBefore,

        previous_committee_Team:
          stpSelection.previousCommitteeIfApplicable || null,

        previous_position_role:
          stpSelection.previousRoleIfApplicable || null,

        committee: committeeVal,

        involved_in_other_student_activities:
          involvedInOtherActivities,

        // Experience and leadership
        previous_experience: previousExperience,

        brief_about_experience:
          previousExperience
            ? experience.committeeExperienceDetails
            : null,

        led_a_team_before: ledATeamBefore,

        leadership_experience:
          ledATeamBefore
            ? experience.leadershipExperienceDetails
            : null,

        why_interested: experience.whyInterested,

        strongest_skills: experience.strongestSkills,

        vision: experience.visionForCommittee,

        // Situational and personal assessment
        handling_members_not_working:
          situational.uncommittedMembersAction,

        special_contribution:
          situational.specialContribution,

        creative_ideas:
          situational.creativeIdeas,

        area_to_improve:
          situational.areaToImprove,

        latest_achievement:
          situational.latestAchievement,

        why_choose_you:
          situational.whyChooseYou,

        questions:
          situational.questionsForUs || null,
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

// ──────────────────────────────────────────────
// GET /api/applications — Fetch All Applications
// ──────────────────────────────────────────────
app.get('/api/applications', async (req, res) => {
  try {
    const db = getPrisma();
    const applications = await db.applicant.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve applications', error: error.message });
  }
});

// ──────────────────────────────────────────────
// Start server when run directly (local dev)
// ──────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`STP Backend Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
