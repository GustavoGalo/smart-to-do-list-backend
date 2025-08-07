import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorMessages } from '../constants/error-messages';
import { PrismaService } from '../prisma.service';
import Groq from "groq-sdk";

@Injectable()
export class TodoService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return await this.prisma.todo.findMany()
  }

  async create(title: string) {
    return await this.prisma.todo.create({ data: { title } })
  }

  async update(id: string, body: { title: string, isCompleted: boolean }) {
    const todo = await this.prisma.todo.findUnique({ where: { id } })

    if (!todo) throw new NotFoundException(ErrorMessages.TODO_NOT_FOUND)

    return await this.prisma.todo.update({ where: { id }, data: { ...body } })
  }

  async delete(id: string) {
    const todo = await this.prisma.todo.findUnique({ where: { id } })

    if (!todo) throw new NotFoundException(ErrorMessages.TODO_NOT_FOUND)

    return await this.prisma.todo.delete({ where: { id } })
  }

  async generate(goal: string) {
    const groq = new Groq();

    const chatCompletion = await groq.chat.completions.create({
      "messages": [
        {
          "role": "user",
          "content": goal
        },
        {
          "role": "system",
          "content": "Aja como mediador, seu papel é gerar to do's para serem armazenados no sitema, a lista deve ser em markdown e não deve conter subitems. Os items devem ser listados por '-' e em estilo padrão, sem palavras em negrito, italico ou qualquer outro estilo de texto."
        }
      ],
      "model": "meta-llama/llama-4-scout-17b-16e-instruct",
      "temperature": 1,
      "max_completion_tokens": 1024,
      "top_p": 1,
      "stream": false,
      "stop": null
    });

    const todos = (chatCompletion.choices[0].message.content || "")
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('- '))
      .map(line => line.slice(2).trim());

    return this.prisma.todo.createMany({ data: todos.map(todo => ({ title: todo })) })
  }
}
