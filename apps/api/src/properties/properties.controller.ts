import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/create-property.dto';
import { CreateSectionDto, UpdateSectionDto } from './dto/create-section.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  async findAll(
    @Query('location') location?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('bedrooms') bedrooms?: number,
    @Query('guests') guests?: number
  ) {
    return this.propertiesService.findAll({
      location,
      minPrice,
      maxPrice,
      bedrooms,
      guests,
    });
  }

  @Get(':slug')
  async findOneBySlug(@Param('slug') slug: string) {
    return this.propertiesService.findOneBySlug(slug);
  }

  // Admin Property management
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.propertiesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.propertiesService.delete(id);
  }

  // Section management
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/sections')
  async createSection(@Param('id') propertyId: string, @Body() dto: CreateSectionDto) {
    return this.propertiesService.createSection(propertyId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/sections/:sectionId')
  async updateSection(
    @Param('id') propertyId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto
  ) {
    return this.propertiesService.updateSection(propertyId, sectionId, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/sections/reorder')
  async reorderSections(
    @Param('id') propertyId: string,
    @Body() body: { sectionOrders: { id: string; order: number }[] }
  ) {
    return this.propertiesService.reorderSections(propertyId, body.sectionOrders);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/sections/:sectionId')
  async deleteSection(@Param('id') propertyId: string, @Param('sectionId') sectionId: string) {
    return this.propertiesService.deleteSection(propertyId, sectionId);
  }
}
