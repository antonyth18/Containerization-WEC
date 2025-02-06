import prisma from '../config/database.js';

/**
 * Get all events with related data - Public
 */
export const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        timeline: true,
        links: true,
        branding: true,
        tracks: true,
        sponsors: true,
        eventPeople: true
      }
    });
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

/**
 * Get event details using event id
 */
export const getEventById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        eventTimeline: true,
        eventLinks: true,
        eventBranding: {
          include: {
            coverImage: true,
            faviconImage: true,
            logoImage: true,
          }
        },
        tracks: {
          include: {
            prizes: true
          }
        },
        sponsors: true,
        eventPeople: true,
        applicationForm: true,
        customQuestions: true
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const independentPrizes = await prisma.prize.findMany({
      where: { trackId: null,
        eventId: event.id,
       },
    });

    if(independentPrizes.length === 0) {
      res.json(event);
    } else { 
        const eventUpdated = {
        ...event,
        tracks: [
          ...event.tracks,
          ...independentPrizes.map((prize) => ({
            name: '',
            description: '',
            prizes: [prize]
          }))
        ]
        };
        res.json(eventUpdated);
    }
  

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

/**
 * Create new event or a draft - Admin/Organizer only
 */
export const createEvent = async (req, res) => {
  try {
    const userId = req.auth.payload.sub;
    const eventData = { ...req.body, createdById: userId };
    
    const event = await prisma.event.create({
      data: eventData,
      include: {
        timeline: true,
        links: true,
        branding: true,
        tracks: true,
        sponsors: true,
        eventPeople: true
      }
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' });
  }
};

/**
 * Update event details based on event id - Admin/Organizer only
 */
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.payload.sub;
    const eventData = { ...req.body };

      const event = await prisma.event.update({
              where: {
        id: parseInt(id),
        createdById: userId // Ensure user owns the event
      },
      data: eventData,
      include: {
        timeline: true,
        links: true,
        branding: true,
        tracks: true,
        sponsors: true,
        eventPeople: true
      }
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
};

/**
 * Delete an event using event id - Admin/Organizer only
 */
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.payload.sub;

    const event = await prisma.event.delete({
      where: {
        id: parseInt(id),
        createdById: userId // Ensure user owns the event
      }
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

/**
 * Join an event - Participant only
 */
export const joinEvent = async (req, res) => {
  try {
  const { eventId } = req.params;
    const userId = req.auth.payload.sub;
  const { applicationDetails } = req.body;

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
    res.status(500).json({ error: 'Failed to join event' });
  }
};

export const applyToEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const userId = req.auth.payload.sub;

    const application = await prisma.application.create({
      data: {
        eventId: parseInt(eventId),
        userId,
        status: 'PENDING'
      }
    });

    res.json(application);
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply to event' });
  }
}; 