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
    res.json(events);
  } catch (error) {
    throw error;
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
    const {
      id,
      name,
      type,
      mode,
      tagline,
      about,
      maxParticipants,
      minTeamSize,
      maxTeamSize,
      eventTimeline,
      eventLinks,
      eventBranding,
      status,
      tracks,
      sponsors,
      eventPeople,
      applicationForm,
      customQuestions,
    } = req.body;

    const tracksUpdated = tracks.map(({ id, prizes, ...rest }) => ({
      ...rest,
      prizes: prizes.map(({ trackId, ...prizeRest }) => prizeRest),
    }));
  
    
    if(id !== null){
      const deleteEvent = await prisma.event.delete({
        where: {
          id: parseInt(id),
        },
      });
    }
    
    const transaction = await prisma.$transaction(async (prisma) => {
      const event = await prisma.event.create({
        data: {
          name,
          type,
          mode,
          tagline,
          about,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
          minTeamSize: minTeamSize ? parseInt(minTeamSize) : null,
          maxTeamSize: maxTeamSize ? parseInt(maxTeamSize) : null,
          status: status,
          createdById: req.session.userId,
          eventTimeline: { create: eventTimeline },
          eventLinks: { create: eventLinks },
          eventBranding: {
            create: {
              ...eventBranding,
              coverImage: eventBranding.coverImage ? {
                create: eventBranding.coverImage
              } : undefined,
              faviconImage: eventBranding.faviconImage ? {
                create: eventBranding.faviconImage
              } : undefined,
              logoImage: eventBranding.logoImage ? {
                create: eventBranding.logoImage
              } : undefined
            }
          },
          applicationForm: {
            create: {
              educationRequired: applicationForm.educationRequired,
              experienceRequired: applicationForm.experienceRequired,
              profilesRequired: applicationForm.profilesRequired,
              contactRequired: applicationForm.contactRequired,
              tShirtSizeRequired: applicationForm.tShirtSizeRequired
            }
          }
        }
      });

      if (tracksUpdated && tracksUpdated.length > 0) {
        await Promise.all(
          tracksUpdated.map(async (track) => {
            // Adds only prizes in case track name is empty
            if (track.name.trim() === '' && track.prizes && track.prizes.length > 0) {
              await Promise.all(
                track.prizes.map(async (prize) => {
                  if (prize.title.trim() !== '') {
                    await prisma.prize.create({
                      data: {
                        ...prize,
                        trackId: null,
                        eventId: event.id,
                      }
                    });
                  }
                })
              );
            } else if (track.name.trim() !== '') {
              const createdTrack = await prisma.track.create({
                data: {
                  ...track,
                  eventId: event.id,
                  prizes: {
                    create: track.prizes.map(prize => ({
                      ...prize,
                      eventId: event.id,
                    }))
                  }
                }
              });
            }
          })
        );
      } 

      if (sponsors && sponsors.length > 0 ) {
        await prisma.sponsor.createMany({
          data: sponsors.map(sponsor => ({
            ...sponsor,
            eventId: event.id
          }))
        });
      }

      if (eventPeople && eventPeople.length > 0 ) {
        await prisma.eventPerson.createMany({
          data: eventPeople.map(person => ({
            ...person,
            eventId: event.id
          }))
        });
      }

      // Take the customQuestions as list of JSON object of questionText, questionType, options, isReqiured
      if (customQuestions && customQuestions.length > 0 ) {
        await prisma.customQuestion.createMany({
          data: customQuestions.map(question => ({
            ...question,
            eventId: event.id
          }))
        });
      }

      return event;
    });

    res.status(201).json(transaction);
  } catch (error) {
    throw error;
  }
};

/**
 * Update event details based on event id - Admin/Organizer only
 */
export const updateEvent = async (req, res) => {
  const { eventId } = req.params;
  const {
    name,
    type,
    mode,
    tagline,
    about,
    maxParticipants,
    minTeamSize,
    maxTeamSize,
    eventTimeline,
    eventLinks,
    eventBranding,
    tracks,
    status,
    sponsors,
    eventPeople,
    applicationForm,
    customQuestions
  } = req.body;

  const tracksUpdated = tracks.map(({ id, prizes, ...rest }) => ({
    ...rest,
    prizes: prizes.map(({ trackId, ...prizeRest }) => prizeRest),
  }));

  try {
    const transaction = await prisma.$transaction( async (prisma) => {

      const event = await prisma.event.update({
        where : {
          id: parseInt(eventId)
        },
        data : {
          name,
          type,
          mode,
          tagline,
          about,
          maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
          minTeamSize: minTeamSize ? parseInt(minTeamSize) : null,
          maxTeamSize: maxTeamSize ? parseInt(maxTeamSize) : null,
          status: status,
          eventTimeline: eventTimeline ? {
            update: {
              where: {
                eventId: parseInt(eventId)
              },
              data: eventTimeline
            }
          } : undefined,
          eventLinks: eventLinks ? {
          upsert: {
            where: {
              eventId: parseInt(eventId),
            },
            create: {
              ...eventLinks,
            },
            update: {
              ...eventLinks,
            },
          },
        }
      : undefined,
          eventBranding: eventBranding ? { 
            update : {
              where : {
                eventId: parseInt(eventId)
              },
              data: {
                ...eventBranding,
                coverImage: eventBranding.coverImage ? {
                  upsert: {
                    where: {
                      id: eventBranding.coverImage.id
                    },
                    create: eventBranding.coverImage,
                    update: eventBranding.coverImage
                  }
                } : undefined,
                faviconImage: eventBranding.faviconImage ? {
                  upsert: {
                    where: {
                      id: eventBranding.faviconImage.id
                    },
                    create: eventBranding.faviconImage,
                    update: eventBranding.faviconImage
                  }
                } : undefined,
                logoImage: eventBranding.logoImage ? {
                  upsert: {
                    where: {
                      id: eventBranding.logoImage.id
                    },
                    create: eventBranding.logoImage,
                    update: eventBranding.logoImage
                  }
                } : undefined,
              }
            }
           } : undefined,
           applicationForm: {
            upsert: {
              where: {
                eventId: parseInt(eventId),
              },
              create: {
                educationRequired: applicationForm.educationRequired,
                experienceRequired: applicationForm.experienceRequired,
                profilesRequired: applicationForm.profilesRequired,
                contactRequired: applicationForm.contactRequired,
                tShirtSizeRequired: applicationForm.tShirtSizeRequired,
              },
              update: {
                educationRequired: applicationForm.educationRequired,
                experienceRequired: applicationForm.experienceRequired,
                profilesRequired: applicationForm.profilesRequired,
                contactRequired: applicationForm.contactRequired,
                tShirtSizeRequired: applicationForm.tShirtSizeRequired,
              },
            },
          }
        }
      });

      const getIdsToDelete = async (modelName, items) => {

        const existingIds = await prisma[modelName].findMany({
          where: { eventId: parseInt(eventId) },
          select: { id: true },
        });

        const incomingIds = items
        .filter((item) => item.id)
        .map((item) => item.id);

        const idsToDelete = existingIds
        .map(items => items.id)
        .filter((id) => !incomingIds.includes(id)
        );

        return idsToDelete;

      }

      await prisma.track.deleteMany({
        where: {
          eventId : parseInt(eventId),
        },
      });

      await prisma.prize.deleteMany({
        where: {
          eventId : parseInt(eventId),
        },
      });

      if (tracksUpdated && tracksUpdated.length > 0) {
        await Promise.all(
          tracksUpdated.map(async (track) => {
            // Adds only prizes in case track name is empty
            if (track.name.trim() === '' && track.prizes && track.prizes.length > 0) {
              await Promise.all(
                track.prizes.map(async (prize) => {
                  if (prize.title.trim() !== '') {
                    await prisma.prize.create({
                      data: {
                        ...prize,
                        trackId: null,
                        eventId: parseInt(eventId)
                      }
                    });
                  }
                })
              );
            } else if (track.name.trim() !== '') {
              const createdTrack = await prisma.track.create({
                data: {
                  ...track,
                  eventId: parseInt(eventId),
                  prizes: {
                    create: track.prizes.map(prize => ({
                      ...prize,
                      eventId: parseInt(eventId),
                    }))
                  }
                }
              });
            }
          })
        );
      }

      
      const sponsorsToDelete = await getIdsToDelete('sponsor', sponsors);

      if (sponsorsToDelete.length > 0) {
        await prisma.sponsor.deleteMany({
          where: {
            id : { in: sponsorsToDelete},
          },
        });
      }

      if (sponsors && sponsors.length > 0) {
        await Promise.all(
          sponsors.map(async (sponsor) => {
            //deals with updation of existing sponsors
            if (sponsor.id) {
              await prisma.sponsor.update({
                where: {
                  id: sponsor.id,
                },
                data: {
                  name: sponsor.name,
                  logoUrl: sponsor.logoUrl,
                  websiteUrl: sponsor.websiteUrl,
                  tier: sponsor.tier,
                },
              });
            } else {
              //deals with adding new sponsors
              await prisma.sponsor.create({
                data: {
                  name: sponsor.name,
                  logoUrl: sponsor.logoUrl,
                  websiteUrl: sponsor.websiteUrl,
                  tier: sponsor.tier,
                  eventId: parseInt(eventId),
                },
              });
            }
          })
        );
      }

      const eventPeopleToDelete = await getIdsToDelete('eventPerson', eventPeople);

      if (eventPeopleToDelete.length > 0) {
        await prisma.eventPerson.deleteMany({
          where: {
            id : { in: eventPeopleToDelete},
          },
        });
      }

      if (eventPeople && eventPeople.length > 0) {
        await Promise.all(
          eventPeople.map(async (eventPeople) => {
            //deals with updation of existing event people
            if (eventPeople.id) {
              await prisma.eventPerson.update({
                where: {
                  id: eventPeople.id,
                },
                data: {
                  name: eventPeople.name,
                  role: eventPeople.role,
                  bio: eventPeople.bio,
                  imageUrl: eventPeople.imageUrl,
                  linkedUrl: eventPeople.linkedUrl,
                },
              });
            } else {
              //deals with adding new event people
              await prisma.eventPerson.create({
                data: {
                  name: eventPeople.name,
                  role: eventPeople.role,
                  bio: eventPeople.bio,
                  imageUrl: eventPeople.imageUrl,
                  linkedUrl: eventPeople.linkedUrl,
                  eventId: parseInt(eventId),
                },
              });
            }
          })
        );
      }
      
      const customQuestionsToDelete = await getIdsToDelete('customQuestion' , customQuestions);

      if (customQuestionsToDelete.length > 0) {
        await prisma.customQuestion.deleteMany({
          where: {
            id : { in: customQuestionsToDelete},
          },
        });
      }

      if(customQuestions && customQuestions.length > 0) {
        await Promise.all(
          customQuestions.map((question) =>
            prisma.customQuestion.upsert({
              where: {
                id: question.id ? question.id : 0,
              },
              create: {
                ...question,
                eventId : parseInt(eventId),
              },
              update: {
                ...question,
              },
            })
          )
        );
      }

    });

    res.status(201).json(transaction);
  }
  catch (error) {
    throw error;
  }

};

/**
 * Delete an event using event id - Admin/Organizer only
 */
export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteEvent = await prisma.event.delete({
      where : {
        id: parseInt(id),
      }
    });

    res.status(201).json(deleteEvent);

  } catch (error) {
    throw error;
  }

}

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