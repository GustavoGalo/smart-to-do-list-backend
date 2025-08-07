import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo-dto';
import { UpdateTodoDto } from './dto/update-todo-dto';
import { GenerateTodoDto } from './dto/generate-todo-dto';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async getTodos() {
    return this.todoService.list();
  }

  @Post()
  async createTodo(@Body() body: CreateTodoDto) {
    return this.todoService.create(body);
  }


  @Put(':id')
  async updateTodo(@Param('id') id: string, @Body() body: UpdateTodoDto) {
    return this.todoService.update(id, body);
  }

  @Delete(':id')
  async deleteTodo(@Param('id') id: string) {
    return this.todoService.delete(id);
  }

  @Post("/generate")
  async generate(@Body() body: GenerateTodoDto) {
    return this.todoService.generate(body.goal)
  }
}
