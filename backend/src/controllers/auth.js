import bcrypt from 'bcrypt';
import prisma from '../config/database.js';

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { user: auth0User } = req.body;
    console.log('Auth0 user data received:', auth0User);
    
    if (!auth0User?.sub || !auth0User?.email) {
      return res.status(400).json({ error: 'Invalid user data' });
    }

    // Try to find existing user first
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { auth0Id: auth0User.sub },
          { email: auth0User.email }
        ]
      }
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          auth0Id: auth0User.sub,
          email: auth0User.email,
          username: auth0User.nickname || auth0User.email.split('@')[0],
          role: 'ORGANIZER',  // Always set as organizer
          status: 'ACTIVE',   // Always active
          profile: {
            upsert: {
              create: {
                firstName: auth0User.given_name || '',
                lastName: auth0User.family_name || '',
                avatarUrl: auth0User.picture || null
              },
              update: {
                firstName: auth0User.given_name || '',
                lastName: auth0User.family_name || '',
                avatarUrl: auth0User.picture || null
              }
            }
          }
        },
        include: {
          profile: true
        }
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          auth0Id: auth0User.sub,
          email: auth0User.email,
          username: auth0User.nickname || auth0User.email.split('@')[0],
          role: 'ORGANIZER',  // Always set as organizer
          status: 'ACTIVE',   // Always active
          profile: {
            create: {
              firstName: auth0User.given_name || '',
              lastName: auth0User.family_name || '',
              avatarUrl: auth0User.picture || null
            }
          }
        },
        include: {
          profile: true
        }
      });
    }

    console.log('User created/updated successfully:', user);
    res.status(201).json(user);
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'User already exists',
        details: error.meta?.target 
      });
    }
    res.status(500).json({ 
      error: 'Failed to register user',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  const auth = req.auth;

  const user = await prisma.user.findUnique({ 
    where: { id: auth.payload.sub }
  });


  req.session.userId = user.id;
  req.session.userRole = user.role;

  res.json({ 
    user: { 
      id: user.id, 
      email: user.email, 
      username: user.username, 
      role: user.role 
    } 
  });
};

/**
 * Logout user
 */
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        error: 'Could not log out, please try again' 
      });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
};

/**
 * Get current user
 */
export const getCurrentUser = async (req, res) => {
  try {
    // User is already attached by ensureUser middleware
    res.json(req.user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const formData = req.body;
    const auth = req.auth;

    console.log('Onboarding data received:', formData);
    console.log('Auth payload:', auth.payload);

    // First check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: auth.payload.sub }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user and profile
    const updatedUser = await prisma.user.update({
      where: { 
        id: auth.payload.sub 
      },
      data: {
        status: 'ACTIVE',
        profile: {
          upsert: {
            create: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              bio: formData.bio,
              gender: formData.gender,
              phone: formData.phone,
              country: formData.country,
              city: formData.city
            },
            update: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              bio: formData.bio,
              gender: formData.gender,
              phone: formData.phone,
              country: formData.country,
              city: formData.city
            }
          }
        }
      }
    });

    // Add education records if provided and not empty
    if (formData.education?.length > 0) {
      await prisma.userEducation.deleteMany({
        where: { userId: auth.payload.sub }
      });

      const validEducation = formData.education.filter(edu => 
        edu.institutionName && edu.degree && edu.fieldOfStudy
      );

      if (validEducation.length > 0) {
        await prisma.userEducation.createMany({
          data: validEducation.map(edu => ({
            userId: auth.payload.sub,
            institutionName: edu.institutionName,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            graduationYear: edu.graduationYear
          }))
        });
      }
    }

    // Add experience records if provided and not empty
    if (formData.experience?.length > 0) {
      await prisma.userExperience.deleteMany({
        where: { userId: auth.payload.sub }
      });

      const validExperience = formData.experience.filter(exp => 
        exp.company && exp.position && exp.startDate
      );

      if (validExperience.length > 0) {
        await prisma.userExperience.createMany({
          data: validExperience.map(exp => ({
            userId: auth.payload.sub,
            company: exp.company,
            position: exp.position,
            startDate: new Date(exp.startDate),
            endDate: exp.current ? null : exp.endDate ? new Date(exp.endDate) : null,
            current: exp.current,
            description: exp.description
          }))
        });
      }
    }

    // Add skills if provided and not empty
    if (formData.skills?.length > 0) {
      await prisma.userSkill.deleteMany({
        where: { userId: auth.payload.sub }
      });

      const validSkills = formData.skills.filter(skill => skill.skillName?.trim());
      if (validSkills.length > 0) {
        await prisma.userSkill.createMany({
          data: validSkills.map(skill => ({
            userId: auth.payload.sub,
            skillName: skill.skillName,
            expertiseLevel: skill.expertiseLevel
          }))
        });
      }
    }

    // Add social profiles if provided and not empty
    if (formData.socialProfiles?.length > 0) {
      await prisma.userSocialProfile.deleteMany({
        where: { userId: auth.payload.sub }
      });

      const validProfiles = formData.socialProfiles.filter(profile => profile.url?.trim());
      if (validProfiles.length > 0) {
        await prisma.userSocialProfile.createMany({
          data: validProfiles.map(profile => ({
            userId: auth.payload.sub,
            platform: profile.platform,
            url: profile.url
          }))
        });
      }
    }

    // Get updated user with all relations
    const userWithDetails = await prisma.user.findUnique({
      where: { id: auth.payload.sub },
      include: {
        profile: true,
        education: true,
        experience: true,
        skills: true,
        socialProfiles: true
      }
    });

    res.json(userWithDetails);
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ 
      error: 'Failed to complete onboarding',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, gender, phone, country, city } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        profile: {
          upsert: {
            create: {
              firstName,
              lastName,
              bio,
              gender,
              phone,
              country,
              city
            },
            update: {
              firstName,
              lastName,
              bio,
              gender,
              phone,
              country,
              city
            }
          }
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
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const { education } = req.body;
    const auth = req.auth;

    if (education?.length > 0) {
      await prisma.userEducation.deleteMany({
        where: { userId: auth.payload.sub }
      });

      const validEducation = education.filter(edu => 
        edu.institutionName && edu.degree && edu.fieldOfStudy
      );

      if (validEducation.length > 0) {
        await prisma.userEducation.createMany({
          data: validEducation.map(edu => ({
            userId: auth.payload.sub,
            institutionName: edu.institutionName,
            degree: edu.degree,
            fieldOfStudy: edu.fieldOfStudy,
            graduationYear: edu.graduationYear
          }))
        });
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: auth.payload.sub },
      include: { education: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Education update error:', error);
    res.status(500).json({ error: 'Failed to update education' });
  }
};

export const updateSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    const auth = req.auth;

    if (skills?.length > 0) {
      await prisma.userSkill.deleteMany({
        where: { userId: auth.payload.sub }
      });

      const validSkills = skills.filter(skill => skill.skillName?.trim());
      if (validSkills.length > 0) {
        await prisma.userSkill.createMany({
          data: validSkills.map(skill => ({
            userId: auth.payload.sub,
            skillName: skill.skillName,
            expertiseLevel: skill.expertiseLevel
          }))
        });
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: auth.payload.sub },
      include: { skills: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Skills update error:', error);
    res.status(500).json({ error: 'Failed to update skills' });
  }
};

export const updateSocialProfiles = async (req, res) => {
  try {
    const { socialProfiles } = req.body;
    const auth = req.auth;

    if (socialProfiles?.length > 0) {
      await prisma.userSocialProfile.deleteMany({
        where: { userId: auth.payload.sub }
      });

      const validProfiles = socialProfiles.filter(profile => profile.url?.trim());
      if (validProfiles.length > 0) {
        await prisma.userSocialProfile.createMany({
          data: validProfiles.map(profile => ({
            userId: auth.payload.sub,
            platform: profile.platform,
            url: profile.url
          }))
        });
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: auth.payload.sub },
      include: { socialProfiles: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Social profiles update error:', error);
    res.status(500).json({ error: 'Failed to update social profiles' });
  }
}; 