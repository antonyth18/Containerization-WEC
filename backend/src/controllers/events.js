import prisma from '../config/database.js';

export const createEvent = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const eventData = req.body;

    // Find user first
    const user = await prisma.user.findUnique({
      where: { auth0Id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate user role
    if (user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Only organizers can create events.' });
    }

    // delete previous autosave
    if(req.body.id){
      const eventDelete = await prisma.event.delete({
        where : { id : req.body.id}
      });
    }

    console.log('Full eventData:', JSON.stringify(eventData, null, 2));
    console.log('Event Branding Data:', JSON.stringify(eventData.eventBranding, null, 2));
    console.log('Logo Image Public URL:', eventData.eventBranding?.logoImage?.publicUrl);
    console.log('Cover Image Public URL:', eventData.eventBranding?.coverImage?.publicUrl);

    const event = await prisma.event.create({
      data: {
        name: eventData.name,
        tagline: eventData.tagline || null,
        about: eventData.about || null,
        type: eventData.type || 'HACKATHON',
        maxTeamSize: eventData.maxTeamSize ? parseInt(eventData.maxTeamSize) : null,
        maxParticipants: eventData.maxParticipants ? parseInt(eventData.maxParticipants) : null,
        minTeamSize: eventData.minTeamSize ? parseInt(eventData.minTeamSize) : null,
        mode: eventData.mode,
        status: eventData.status || 'PUBLISHED',
        createdById: user.id,
        
        timeline: {
          create: {
            eventStart: eventData.eventTimeline.eventStart,
            eventEnd: eventData.eventTimeline.eventEnd,
            applicationsStart: eventData.eventTimeline.applicationsStart,
            applicationsEnd: eventData.eventTimeline.applicationsEnd,
            rsvpDaysBeforeDeadline: parseInt(eventData.eventTimeline.rsvpDaysBeforeDeadline)
          }
        },
        
        branding: {
          create: {
            logoUrl: eventData.eventBranding.logoImage || null, 
            coverUrl: eventData.eventBranding.coverImage || null,
            brandColor: eventData.eventBranding.brandColor || '#000000'
          }
        },
        
        links: {
          create: {
            websiteUrl: eventData.eventLinks[0].websiteUrl || null,
            micrositeUrl: eventData.eventLinks[0].micrositeUrl || null,
            contactEmail: eventData.eventLinks[0].contactEmail || null,
            socialLinks: eventData.eventLinks[0].socialLinks || {}
          }
        },
        
        tracks: {
          create: eventData.tracks.map(track => ({
            name: track.name,
            description: track.description,
            prizes: {
              create: track.prizes?.map(prize => ({
                title: prize.title,
                description: prize.description,
                value: parseFloat(prize.value) || 0
              })) || []
            }
          }))
        },
        
        sponsors: {
          create: eventData.sponsors.map(sponsor => ({
            name: sponsor.name,
            websiteUrl: sponsor.websiteUrl || '',
            logoUrl: sponsor.logoUrl || null,
            tier: sponsor.tier || 'GOLD'  // Assuming GOLD is a valid tier in your schema
          }))
        },
        
        eventPeople: {
          create: eventData.eventPeople.map(person => ({
            name: person.name,
            role: person.role || 'JUDGE',
            imageUrl: person.avatar || null,     
            description: person.bio || null,     
            socialLinks: person.socialLinks || null
          }))
        },

        applicationForm: {
          create: {
            educationRequired: eventData.applicationForm?.educationRequired || false,
            experienceRequired: eventData.applicationForm?.experienceRequired || false,
            profilesRequired: eventData.applicationForm?.profilesRequired || false,
            contactRequired: eventData.applicationForm?.contactRequired || false,
            tShirtSizeRequired: eventData.applicationForm?.tShirtSizeRequired || false,
          }
        },

        customQuestions: {
          create: eventData.customQuestions.map(question => ({
            questionText: question.questionText,
            questionType: question.questionType,
            options: question.options,
            isRequired: question.isRequired
          }))
        }
      },
      include: {
        timeline: true,
        branding: true,
        links: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        timeline: true,
        branding: true,
        links: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true,
        applicationForm: true,
        customQuestions: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            profile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        timeline: true,
        branding: true,
        links: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true,
        customQuestions: true,
        applicationForm: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            profile: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const getCustomQuestions = async (req, res) => {
  try {
    const { eventId } = req.params; // Extract eventId from URL

    const questions = await prisma.customQuestion.findMany({
      where: { eventId: parseInt(eventId) }, // Filter by eventId
      select: { 
        questionText: true,
        questionType: true,
        options: true,
        isRequired: true
      }
    });

    res.json(questions); // Return questions as JSON
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};

export const getAutoSave = async (req, res) => {
  try {

    const userId = req.user.id;
    
    const event = await prisma.event.findFirst({
      where: {
        AND: [
          { status: 'AUTOSAVE' },
          { createdById: userId }
        ]
      },
      include: {
        timeline: true,
        branding: true,
        links: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true,
        customQuestions: true,
        applicationForm: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            profile: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetchingas event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.payload.sub;
    const updateData = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { auth0Id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find event
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user owns the event
    if (event.createdBy.auth0Id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    // If it's just a status update
    if (Object.keys(updateData).length === 1 && updateData.status) {
      const updatedEvent = await prisma.event.update({
        where: { id: parseInt(id) },
        data: { status: updateData.status },
        include: {
          timeline: true,
          branding: true,
          links: true,
          tracks: {
            include: {
              prizes: true
            }
          },
          sponsors: true,
          eventPeople: true,
          customQuestions: true,
          applicationForm: true,
          createdBy: {
            select: {
              id: true,
              username: true,
              profile: true
            }
          }
        }
      });

      return res.json(updatedEvent);
    }

    // Handle full event update
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        name: updateData.name,
        tagline: updateData.tagline || null,
        about: updateData.about || null,
        type: updateData.type || 'HACKATHON',
        maxParticipants: updateData.maxParticipants,
        minTeamSize: updateData.minTeamSize,
        maxTeamSize: updateData.maxTeamSize,
        mode: updateData.mode,
        status: updateData.status || event.status, // Keep existing status if not specified

        timeline: {
          update: {
            eventStart: updateData.eventTimeline.eventStart,
            eventEnd: updateData.eventTimeline.eventEnd,
            applicationsStart: updateData.eventTimeline.applicationsStart,
            applicationsEnd: updateData.eventTimeline.applicationsEnd,
            rsvpDaysBeforeDeadline: updateData.eventTimeline.rsvpDaysBeforeDeadline
          }
        },

        branding: {
          update: {
            logoUrl: updateData.eventBranding?.logoImage?.publicUrl || null,
            coverUrl: updateData.eventBranding?.coverImage?.publicUrl || null,
            brandColor: updateData.eventBranding?.brandColor || '#000000'
          }
        },

        links: {
          update: {
            websiteUrl: updateData.eventLinks[0]?.websiteUrl || '',
            micrositeUrl: updateData.eventLinks[0]?.micrositeUrl || '',
            contactEmail: updateData.eventLinks[0]?.contactEmail || '',
            socialLinks: updateData.eventLinks[0]?.socialLinks || null
          }
        }
      },
      include: {
        timeline: true,
        branding: true,
        links: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true,
        createdBy: {
          select: {
            id: true,
            username: true,
            profile: true
          }
        }
      }
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event', details: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.payload.sub;

    // Find user
    const user = await prisma.user.findUnique({
      where: { auth0Id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find event with its creator
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user owns the event
    if (event.createdBy.auth0Id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    // Delete all related records and the event itself
    await prisma.$transaction([
      // Delete applications first
      prisma.application.deleteMany({
        where: { eventId: parseInt(id) }
      }),

      // Delete prizes
      prisma.prize.deleteMany({
        where: {
          track: {
            eventId: parseInt(id)
          }
        }
      }),

      // Delete tracks
      prisma.track.deleteMany({
        where: { eventId: parseInt(id) }
      }),

      // Delete timeline
      prisma.eventTimeline.deleteMany({
        where: { eventId: parseInt(id) }
      }),

      // Delete branding
      prisma.eventBranding.deleteMany({
        where: { eventId: parseInt(id) }
      }),

      // Delete links
      prisma.eventLink.deleteMany({
        where: { eventId: parseInt(id) }
      }),

      // Delete sponsors
      prisma.sponsor.deleteMany({
        where: { eventId: parseInt(id) }
      }),

      // Delete event people
      prisma.eventPerson.deleteMany({
        where: { eventId: parseInt(id) }
      }),

      // Finally delete the event
      prisma.event.delete({
        where: { id: parseInt(id) }
      })
    ]);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event', details: error.message });
  }
};

export const joinEvent = async (req, res) => {
  // ... existing joinEvent code ...
};

// Add the missing applyToEvent function
export const applyToEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    // Get Auth0 ID from token
    const auth0Id = req.auth.payload.sub;
    const { userData, responses } = req.body;

    // ADDED: First find the user by their Auth0 ID
    const user = await prisma.user.findUnique({
      where: { auth0Id: auth0Id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate if event exists
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: { applicationForm: true }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // CHANGED: Use user.id instead of auth0Id
    const application = await prisma.application.create({
      data: {
        eventId: parseInt(eventId),
        userId: user.id, // Changed from auth0Id to internal user.id
        status: 'PENDING',
        userData: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          gender: userData.gender,
          city: userData.city,
          country: userData.country,
          tShirtSize: event.applicationForm?.tShirtSizeRequired ? userData.tShirtSize : null,
          education: event.applicationForm?.educationRequired ? {
            degree: userData.degree,
            branch: userData.branch,
            graduationYear: userData.graduationYear
          } : null,
          experience: event.applicationForm?.experienceRequired ? {
            company: userData.company,
            position: userData.position
          } : null,
          profiles: event.applicationForm?.profilesRequired ? userData.profiles : null,
          contact: event.applicationForm?.contactRequired ? {
            email: userData.email,
            phone: userData.contactNumber
          } : null
        },
        responses: responses || {}
      }
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Error in applyToEvent:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
};

export const publishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.payload.sub;

    // Find user
    const user = await prisma.user.findUnique({
      where: { auth0Id: userId },
      include: {
        events: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find event
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        createdBy: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user owns the event
    if (event.createdBy.auth0Id !== userId) {
      return res.status(403).json({ error: 'Not authorized to publish this event' });
    }

    // Update event status
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { status: 'PUBLISHED' },
      include: {
        timeline: true,
        branding: true,
        links: true,
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true
      }
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error publishing event:', error);
    res.status(500).json({ error: 'Failed to publish event' });
  }
};

