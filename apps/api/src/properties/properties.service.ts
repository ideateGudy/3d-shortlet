import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/create-property.dto';
import { CreateSectionDto, UpdateSectionDto } from './dto/create-section.dto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    guests?: number;
  }) {
    const where: any = {};

    if (query?.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }
    if (query?.minPrice !== undefined || query?.maxPrice !== undefined) {
      where.pricePerNight = {};
      if (query.minPrice !== undefined) where.pricePerNight.gte = Number(query.minPrice);
      if (query.maxPrice !== undefined) where.pricePerNight.lte = Number(query.maxPrice);
    }
    if (query?.bedrooms !== undefined) {
      where.bedrooms = { gte: Number(query.bedrooms) };
    }
    if (query?.guests !== undefined) {
      where.maxGuests = { gte: Number(query.guests) };
    }

    return this.prisma.property.findMany({
      where,
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
        amenities: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneBySlug(slug: string) {
    const property = await this.prisma.property.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
        amenities: true,
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with slug "${slug}" not found`);
    }

    return property;
  }

  async findOneById(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
        amenities: true,
      },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID "${id}" not found`);
    }

    return property;
  }

  async create(dto: CreatePropertyDto) {
    return this.prisma.property.create({
      data: dto,
      include: {
        sections: true,
        amenities: true,
      },
    });
  }

  async update(id: string, dto: UpdatePropertyDto) {
    await this.findOneById(id);
    return this.prisma.property.update({
      where: { id },
      data: dto,
      include: {
        sections: { orderBy: { order: 'asc' } },
        amenities: true,
      },
    });
  }

  async delete(id: string) {
    await this.findOneById(id);
    await this.prisma.property.delete({ where: { id } });
    return { success: true };
  }

  // Sections
  async createSection(propertyId: string, dto: CreateSectionDto) {
    await this.findOneById(propertyId);
    const highestOrder = await this.prisma.propertySection.findFirst({
      where: { propertyId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const order = dto.order ?? (highestOrder ? highestOrder.order + 1 : 0);

    return this.prisma.propertySection.create({
      data: {
        propertyId,
        name: dto.name,
        type: dto.type,
        imageUrl: dto.imageUrl,
        order,
        initialYaw: dto.initialYaw ?? 0,
        initialPitch: dto.initialPitch ?? 0,
        hotspots: dto.hotspots || [],
      },
    });
  }

  async updateSection(propertyId: string, sectionId: string, dto: UpdateSectionDto) {
    const section = await this.prisma.propertySection.findFirst({
      where: { id: sectionId, propertyId },
    });
    if (!section) {
      throw new NotFoundException(`Section not found for property`);
    }

    return this.prisma.propertySection.update({
      where: { id: sectionId },
      data: {
        name: dto.name,
        type: dto.type,
        imageUrl: dto.imageUrl,
        order: dto.order,
        initialYaw: dto.initialYaw,
        initialPitch: dto.initialPitch,
        hotspots: dto.hotspots,
      },
    });
  }

  async reorderSections(propertyId: string, sectionOrders: { id: string; order: number }[]) {
    await this.prisma.$transaction(
      sectionOrders.map((item) =>
        this.prisma.propertySection.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );
    return { success: true };
  }

  async deleteSection(propertyId: string, sectionId: string) {
    const section = await this.prisma.propertySection.findFirst({
      where: { id: sectionId, propertyId },
    });
    if (!section) {
      throw new NotFoundException(`Section not found`);
    }
    await this.prisma.propertySection.delete({ where: { id: sectionId } });
    return { success: true };
  }
}
