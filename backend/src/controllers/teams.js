import prisma from '../config/database.js';

/**
 * Get all teams for current user
 */
export const getTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: req.auth.payload.sub
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        event: true
      }
    });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

/**
 * Create new team
 */
export const createTeam = async (req, res) => {
  const { eventId, name } = req.body;
  
  try {
    const team = await prisma.team.create({
      data: {
        eventId,
        name,
        members: {
          create: {
            userId: req.auth.payload.sub,
            role: 'LEADER'
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create team' });
  }
}; 