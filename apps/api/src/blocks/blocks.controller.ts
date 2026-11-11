import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get('properties/:id/blocks')
  async getBlocksForProperty(@Param('id') propertyId: string) {
    return this.blocksService.getBlocksForProperty(propertyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('blocks')
  async createBlock(@Body() dto: CreateBlockDto) {
    return this.blocksService.createBlock(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('blocks/:id')
  async deleteBlock(@Param('id') id: string) {
    return this.blocksService.deleteBlock(id);
  }
}
