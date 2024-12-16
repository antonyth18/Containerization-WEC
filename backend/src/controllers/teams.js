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
            userId: req.session.userId
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
    throw error;
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
            userId: req.session.userId,
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
    throw error;
  }
}; 