import prisma from '../config/database.js';

/**
 * Get all events with related data - Public
 */
export const getEvents = async (req, res) => {
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
    throw error;
  }
};

/**
 * Create new event - Admin/Organizer only
 */
export const createEvent = async (req, res) => {
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
        eventTimeline: { create: eventTimeline },
        eventLinks: { create: eventLinks },
        eventBranding: { create: eventBranding },
        tracks: {
          create: tracks.map(track => ({
            ...track,
            prizes: {
              create: track.prizes
            }
          }))
        },
        sponsors: {
          create: sponsors
        },
        eventPeople: {
          create: eventPeople
        }
      },
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
        eventPeople: true
      }
    });

    res.status(201).json(event);
  } catch (error) {
    throw error;
  }
};

/**
 * Join an event - Participant only
 */
export const joinEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.session.userId;
  const { applicationDetails } = req.body;

  try {
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
    throw error;
  }
}; 