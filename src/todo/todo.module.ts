import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { PrismaService } from 'src/prisma.service';
import { TodoController } from './todo.controller';

@Module({
  providers: [PrismaService, TodoService],
  controllers: [TodoController]
})
export class TodoModule {}
