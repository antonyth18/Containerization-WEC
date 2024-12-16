import { z } from 'zod';

// Validation schemas
export const eventSchema = z.object({
  name: z.string().min(3).max(255),
  type: z.enum(['HACKATHON', 'GENERAL_EVENT']),
  tagline: z.string().optional(),
  about: z.string().optional(),
  maxParticipants: z.number().positive().optional(),
  minTeamSize: z.number().positive().optional(),
  maxTeamSize: z.number().positive().optional(),
  eventTimeline: z.object({
    timezone: z.string(),
    applicationsStart: z.string().datetime(),
    applicationsEnd: z.string().datetime(),
    eventStart: z.string().datetime(),
    eventEnd: z.string().datetime(),
    rsvpDeadlineDays: z.number()
  }),
  eventLinks: z.object({
    websiteUrl: z.string().url().optional(),
    micrositeUrl: z.string().url().optional(),
    contactEmail: z.string().email(),
    codeOfConductUrl: z.string().url().optional()
  }).optional()
});

export const teamSchema = z.object({
  eventId: z.number(),
  name: z.string().min(3).max(255)
});

export const projectSchema = z.object({
  eventId: z.number(),
  teamId: z.number(),
  title: z.string().min(3).max(255),
  description: z.string(),
  githubUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional()
});

// Validation middleware factory
export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Validation failed',
      details: error.errors
    });
  }
}; 