-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "AcademicYear" AS ENUM ('FIRST_YEAR', 'SECOND_YEAR', 'THIRD_YEAR', 'FOURTH_YEAR', 'FIFTH_YEAR', 'GRADUATE');

-- CreateEnum
CREATE TYPE "Committee" AS ENUM ('SUPPLY_CHAIN', 'DCR', 'PR', 'BD', 'PEOPLE_AND_CULTURE', 'QC', 'TECHNICAL', 'MOBILE', 'FRONTEND_WEB', 'BACKEND', 'MARKETING', 'PHOTOGRAPHY', 'VIDEO_EDITING', 'GRAPHIC_DESIGN');

-- CreateTable
CREATE TABLE "Applicant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "university" TEXT NOT NULL,
    "faculty" TEXT NOT NULL,
    "academic_year" "AcademicYear" NOT NULL,
    "linkedIn_link" TEXT NOT NULL,
    "been_a_part_of_STP_before" BOOLEAN NOT NULL,
    "previous_committee_Team" TEXT,
    "previous_position_role" TEXT,
    "committee" "Committee" NOT NULL,
    "involved_in_other_student_activities" BOOLEAN NOT NULL,
    "previous_experience" BOOLEAN NOT NULL,
    "brief_about_experience" TEXT,
    "led_a_team_before" BOOLEAN NOT NULL,
    "leadership_experience" TEXT,
    "why_interested" TEXT NOT NULL,
    "strongest_skills" TEXT NOT NULL,
    "vision" TEXT NOT NULL,
    "handling_members_not_working" TEXT NOT NULL,
    "special_contribution" TEXT NOT NULL,
    "creative_ideas" TEXT NOT NULL,
    "area_to_improve" TEXT NOT NULL,
    "latest_achievement" TEXT NOT NULL,
    "why_choose_you" TEXT NOT NULL,
    "questions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);
