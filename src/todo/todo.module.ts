import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [PrismaService, TodoService]
})
export class TodoModule {}
