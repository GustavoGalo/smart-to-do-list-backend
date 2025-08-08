# Smart To-Do List Backend

Este é o backend para uma aplicação de lista de tarefas inteligente que utiliza IA para gerar tarefas com base em objetivos definidos pelo usuário.

## Tecnologias Utilizadas

- [NestJS](https://nestjs.com/) - Framework para construção de aplicações server-side eficientes e escaláveis
- [Prisma](https://www.prisma.io/) - ORM para acesso ao banco de dados
- [SQLite](https://www.sqlite.org/) - Banco de dados relacional leve
- [Groq SDK](https://groq.com/) - SDK para integração com IA generativa
- [Jest](https://jestjs.io/) - Framework de testes

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

## Instalação

1. Clone o repositório:

```bash
git clone https://github.com/GustavoGalo/smart-to-do-list-backend.git
cd smart-to-do-list-backend
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
DATABASE_URL="file:./dev.db"
GROQ_API_KEY="sua-chave-api-groq"
```

Obtenha sua chave API do Groq em [https://console.groq.com/](https://console.groq.com/)

4. Execute as migrações do banco de dados:

```bash
npx prisma migrate dev
```

## Executando a Aplicação

### Modo de Desenvolvimento

```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Modo de Produção

```bash
npm run build
npm run start:prod
```

## Endpoints da API

### Listar todas as tarefas

- **GET** `/todo`

### Criar uma nova tarefa

- **POST** `/todo`
- Body: `{ "title": "Nome da tarefa" }`

### Atualizar uma tarefa

- **PUT** `/todo/:id`
- Body: `{ "title": "Novo nome", "isCompleted": true }`

### Excluir uma tarefa

- **DELETE** `/todo/:id`

### Gerar tarefas com IA

- **POST** `/todo/generate`
- Body: `{ "goal": "Aprender NestJS" }`

## Executando Testes

```bash
# Testes unitários
npm run test

# Testes com watch mode
npm run test:watch

# Testes com cobertura
npm run test:cov
```

## Estrutura do Projeto

```
├── prisma/ # Configurações e migrações do Prisma
├── src/ # Código fonte da aplicação
│ ├── constants/ # Constantes da aplicação
│ ├── todo/ # Módulo de tarefas
│ │ ├── dto/ # Data Transfer Objects
│ │ ├── todo.controller.ts # Controlador de tarefas
│ │ ├── todo.service.ts # Serviço de tarefas
│ │ └── todo.module.ts # Módulo de tarefas
│ ├── app.module.ts # Módulo principal da aplicação
│ ├── main.ts # Ponto de entrada da aplicação
│ └── prisma.service.ts # Serviço do Prisma
```

