import { prisma } from "~~/prisma";
import { Prisma, Track } from "@prisma/client";

const buildWhere = (query: RequestQuery): Prisma.TrackWhereInput => {
  const field = query.field || "*";

  const filter: Prisma.TrackWhereInput = {};

  if (query.isFavorite === "true") {
    filter.isFavorite = true;
  }

  if (!query.query) return filter;

  const filterStrategies: Record<string, () => Prisma.TrackWhereInput> = {
    id: () => ({
      id: query.query,
      ...filter,
    }),
    "*": () => ({
      OR: [
        { title: { contains: query.query }, ...filter },
        { artists: { some: { name: { contains: query.query } } }, ...filter },
        { album: { title: { contains: query.query } }, ...filter },
      ],
    }),
    artist: () => ({
      ...filter,
      artists: { some: { name: { contains: query.query } } },
    }),
    album: () => ({
      ...filter,
      album: { title: { contains: query.query } },
    }),
  };

  return filterStrategies[field]?.() || filter;
};

const buildSortBy = (
  query: RequestQuery,
): Prisma.TrackOrderByWithRelationInput | undefined => {
  const direction = query.orderByDirection || "asc";
  if (!query.orderByField) return undefined;

  if (query.orderByField === "album") {
    return {
      album: {
        title: direction,
      },
    };
  }

  return {
    [query.orderByField]: direction,
  };
};

const getPagination = (
  query: RequestQuery,
): { skip: number; take: number } | undefined => {
  if (!query.page && !query.limit) {
    return undefined;
  }

  const page = query.page ? Math.max(parseInt(query.page), 1) : 1;
  const limit = query.limit ? Math.min(parseInt(query.limit), 100) : 20;

  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

export default defineEventHandler(async (event) => {
  const query = getQuery<RequestQuery>(event);

  try {
    const where = buildWhere(query);
    const orderBy = buildSortBy(query);
    const pagination = getPagination(query);

    const totalCount = await prisma.track.count({ where });

    const tracks = await prisma.track.findMany({
      where,
      orderBy,
      ...(pagination && { skip: pagination.skip, take: pagination.take }),
      include: {
        artists: true,
        album: true,
      },
    });

    return {
      error: null,
      data: tracks,
      meta: pagination
        ? {
            total: totalCount,
            page: query.page ? parseInt(query.page) : 1,
            limit: pagination.take,
            pages: Math.ceil(totalCount / (pagination.take || totalCount)),
          }
        : undefined,
      success: true,
    };
  } catch (e) {
    console.error("Error fetching tracks:", e);
    setResponseStatus(event, 500);
    return {
      data: [],
      error: e instanceof Error ? e.message : "Unknown error occurred",
      success: false,
    };
  }
});

type RequestQuery = {
  query?: string;
  orderByDirection?: "asc" | "desc";
  orderByField?: "title" | "dateAdded" | "album";
  field?: "*" | "title" | "artist" | "album" | "id";
  limit?: string;
  page?: string;
  isFavorite?: string;
};

interface TracksResponse {
  error: string | null;
  data: (Track & { artists: any[]; album: any })[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  success: boolean;
}
