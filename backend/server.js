const express = require('express');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const { PrismaClient, Decimal } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

const authenticateUser = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};


const isOrganizer = (req, res, next) => {
  if (req.session.userRole === 'ORGANIZER' || req.session.userRole === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden. Only organizers can perform this action.' });
  }
};


app.post('/api/register', async (req, res) => {
  try {
    const { email, username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        role: role.toUpperCase(),
        status: 'ACTIVE'
      },
    });

    req.session.userId = user.id;
    req.session.userRole = user.role; 
    res.status(201).json({ user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.userId = user.id;
    req.session.userRole = user.role; 
    res.json({ user: { id: user.id, email: user.email, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out, please try again' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logout successful' });
  });
});


app.get('/api/user', authenticateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, email: true, username: true, role: true }
    });
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        eventTimeline: true,
        eventLinks: true,
        eventBranding: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true,
        applicationForm: true
      }
    });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/events', authenticateUser, isOrganizer, async (req, res) => {
  try {
    const { 
      name, 
      type, 
      tagline, 
      about, 
      maxParticipants, 
      minTeamSize, 
      maxTeamSize,
      eventTimeline,
      eventLinks,
      eventBranding,
      tracks,
      sponsors,
      eventPeople
    } = req.body;

    const event = await prisma.event.create({
      data: {
        name,
        type: type.toUpperCase(),
        tagline,
        about,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        minTeamSize: minTeamSize ? parseInt(minTeamSize) : null,
        maxTeamSize: maxTeamSize ? parseInt(maxTeamSize) : null,
        status: 'DRAFT',
        createdById: req.session.userId,
        
        eventTimeline: {
          create: {
            timezone: eventTimeline.timezone,
            eventStart: new Date(eventTimeline.eventStart),
            eventEnd: new Date(eventTimeline.eventEnd),
            applicationsStart: new Date(eventTimeline.applicationsStart),
            applicationsEnd: new Date(eventTimeline.applicationsEnd),
            rsvpDeadlineDays: parseInt(eventTimeline.rsvpDeadlineDays)
          }
        },

        eventLinks: {
          create: {
            websiteUrl: eventLinks.websiteUrl,
            micrositeUrl: eventLinks.micrositeUrl,
            contactEmail: eventLinks.contactEmail,
            codeOfConductUrl: eventLinks.codeOfConductUrl,
            socialLinks: eventLinks.socialLinks || {}
          }
        },

        eventBranding: {
          create: {
            brandColor: eventBranding.brandColor,
            logoUrl: eventBranding.logoUrl,
            faviconUrl: eventBranding.faviconUrl,
            coverImageUrl: eventBranding.coverImageUrl
          }
        },

        applicationForm: {
          create: {
            educationRequired: true,
            experienceRequired: false,
            profilesRequired: true,
            contactRequired: true
          }
        },

        tracks: {
          create: tracks.map(track => ({
            name: track.name,
            description: track.description
          }))
        },

        sponsors: {
          create: sponsors.map(sponsor => ({
            name: sponsor.name,
            logoUrl: sponsor.logoUrl,
            websiteUrl: sponsor.websiteUrl,
            tier: sponsor.tier || 'GOLD'
          }))
        },

        eventPeople: {
          create: eventPeople.map(person => ({
            name: person.name,
            role: person.role,
            bio: person.bio,
            imageUrl: person.imageUrl,
            linkedinUrl: person.linkedinUrl
          }))
        }
      }
    });


    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      for (let prize of track.prizes) {
        await prisma.prize.create({
          data: {
            eventId: event.id,
            trackId: event.tracks[i].id,
            title: prize.title,
            description: prize.description,
            value: new Decimal(prize.value)
          }
        });
      }
    }


    const completeEvent = await prisma.event.findUnique({
      where: { id: event.id },
      include: {
        eventTimeline: true,
        eventLinks: true,
        eventBranding: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true,
        applicationForm: true 
      }
    });
    
    res.status(201).json(completeEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/events/:eventId/join', authenticateUser, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.session.userId;
    const { applicationDetails } = req.body;

    const event = await prisma.event.findUnique({ where: { id: parseInt(eventId) } });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const application = await prisma.application.create({
      data: {
        eventId: parseInt(eventId),
        userId,
        status: 'PENDING',
        rsvpStatus: 'PENDING',
        applicationDetails
      }
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


app.post('/api/teams', authenticateUser, async (req, res) => {
  try {
    const { eventId, name } = req.body;
    const team = await prisma.team.create({
      data: {
        eventId,
        name,
        members: {
          create: {
            userId: req.session.userId,
            role: 'LEADER'
          }
        }
      },
    });
    res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/projects', authenticateUser, async (req, res) => {
  try {
    const { eventId, teamId, title, description, githubUrl, demoUrl } = req.body;
    const project = await prisma.projectSubmission.create({
      data: {
        eventId,
        teamId,
        title,
        description,
        githubUrl,
        demoUrl
      },
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Error submitting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/profile', authenticateUser, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      include: {
        profile: true,
        education: true,
        experience: true,
        skills: true,
        socialProfiles: true
      }
    });
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/profile', authenticateUser, async (req, res) => {
  try {
    const { profile, education, experience, skills, socialProfiles } = req.body;

   
    const formattedProfile = {
      firstName: profile.firstName || null,
      lastName: profile.lastName || null,
      avatarUrl: profile.avatarUrl || null,
      bio: profile.bio || null,
      gender: profile.gender ? profile.gender.toUpperCase() : null,
      phone: profile.phone || null,
      country: profile.country || null,
      city: profile.city || null
    };


    const formattedEducation = education?.map(edu => ({
      institutionName: edu.institutionName,
      degree: edu.degree.toUpperCase(),
      fieldOfStudy: edu.fieldOfStudy,
      graduationYear: parseInt(edu.graduationYear)
    })) || [];

    const formattedExperience = experience?.map(exp => ({
      company: exp.company,
      position: exp.position,
      startDate: new Date(exp.startDate),
      endDate: exp.endDate ? new Date(exp.endDate) : null,
      current: Boolean(exp.current),
      description: exp.description || null
    })) || [];

    const formattedSkills = skills?.map(skill => ({
      skillName: skill.skillName,
      expertiseLevel: skill.expertiseLevel.toUpperCase()
    })) || [];

   
    const formattedSocialProfiles = socialProfiles?.map(social => ({
      platform: social.platform.toUpperCase(),
      url: social.url
    })) || [];

    const updatedUser = await prisma.user.update({
      where: { id: req.session.userId },
      data: {
        profile: {
          upsert: {
            create: formattedProfile,
            update: formattedProfile
          }
        },
        education: {
          deleteMany: {},
          create: formattedEducation
        },
        experience: {
          deleteMany: {},
          create: formattedExperience
        },
        skills: {
          deleteMany: {},
          create: formattedSkills
        },
        socialProfiles: {
          deleteMany: {},
          create: formattedSocialProfiles
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
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

