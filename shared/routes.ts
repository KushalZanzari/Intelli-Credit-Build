import { z } from 'zod';
import { insertCompanySchema, insertFinancialsSchema, companies, financials, riskScores, camReports, documents } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  companies: {
    list: {
      method: 'GET' as const,
      path: '/api/companies' as const,
      responses: {
        200: z.array(z.custom<typeof companies.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/companies/:id' as const,
      responses: {
        200: z.custom<typeof companies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/companies' as const,
      input: insertCompanySchema,
      responses: {
        201: z.custom<typeof companies.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  financials: {
    list: {
      method: 'GET' as const,
      path: '/api/companies/:companyId/financials' as const,
      responses: {
        200: z.array(z.custom<typeof financials.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/companies/:companyId/financials' as const,
      input: insertFinancialsSchema.omit({ companyId: true }),
      responses: {
        201: z.custom<typeof financials.$inferSelect>(),
      },
    },
  },
  risk: {
    get: {
      method: 'GET' as const,
      path: '/api/companies/:companyId/risk' as const,
      responses: {
        200: z.custom<typeof riskScores.$inferSelect>().nullable(),
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/companies/:companyId/risk/generate' as const,
      responses: {
        200: z.custom<typeof riskScores.$inferSelect>(),
      },
    },
  },
  cam: {
    get: {
      method: 'GET' as const,
      path: '/api/companies/:companyId/cam' as const,
      responses: {
        200: z.custom<typeof camReports.$inferSelect>().nullable(),
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/companies/:companyId/cam/generate' as const,
      responses: {
        200: z.custom<typeof camReports.$inferSelect>(),
      },
    },
  },
  documents: {
    list: {
      method: 'GET' as const,
      path: '/api/companies/:companyId/documents' as const,
      responses: {
        200: z.array(z.custom<typeof documents.$inferSelect>()),
      },
    },
    upload: {
      method: 'POST' as const,
      path: '/api/companies/:companyId/documents' as const,
      // Form data mock upload
      input: z.any(),
      responses: {
        201: z.custom<typeof documents.$inferSelect>(),
      }
    }
  },
  research: {
    query: {
      method: 'POST' as const,
      path: '/api/companies/:companyId/research' as const,
      input: z.object({ query: z.string() }),
      responses: {
        200: z.object({ result: z.string() }),
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
