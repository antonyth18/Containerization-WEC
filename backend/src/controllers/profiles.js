import prisma from '../config/database.js';

/**
 * Get user profile with all related data
 */
export const getProfile = async (req, res) => {
  try {
    // const auth = req.auth;
    // console.log(auth);
    const profile = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: {
        profile: true,
        education: true,
        experience: true,
        skills: true,
        socialProfiles: true
      }
    });
    res.json(profile);
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile and related data
 */
export const updateProfile = async (req, res) => {
  const { profile, education, experience, skills, socialProfiles } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.session.userId },
      data: {
        profile: {
          upsert: {
            create: profile,
            update: profile
          }
        },
        education: {
          deleteMany: {},
          create: education
        },
        experience: {
          deleteMany: {},
          create: experience
        },
        skills: {
          deleteMany: {},
          create: skills
        },
        socialProfiles: {
          deleteMany: {},
          create: socialProfiles
        }
      },
      include: {
        profile: true,
        education: true,
        experience: true,
        skills: true,
        socialProfiles: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    throw error;
  }
};

