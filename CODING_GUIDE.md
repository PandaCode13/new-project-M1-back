# Guide: roles, guard admin et filtre par role

Objectif :

1. Ajouter un champ `role` sur le model `User`.
2. Creer un guard pour verifier le role de l'utilisateur connecte.
3. Proteger `GET /users` pour que seuls les admins puissent l'utiliser.
4. Permettre `GET /users?role=ADMIN` ou `GET /users?role=USER`.
5. Creer un pipe dedie pour verifier que le role demande existe.

## 1. Ajouter le role dans Prisma

Dans `prisma/schema.prisma`, ajouter un enum :

```prisma
enum Role {
  USER
  ADMIN
}
```

Puis ajouter le champ dans `model User` :

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique @db.VarChar(255)
  name          String   @default("") @db.VarChar(255)
  emailVerified Boolean  @default(false)
  image         String?
  firstName     String?  @db.VarChar(100)
  lastName      String?  @db.VarChar(100)
  role          Role     @default(USER)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tickets  Ticket[]
  reviews  Review[]
  wishlist Park[]    @relation("UserWishlist")
  sessions Session[]
  accounts Account[]

  @@map("users")
}
```

Pourquoi `@default(USER)` ?

Parce qu'un nouvel utilisateur doit etre simple utilisateur par defaut. On ne laisse pas le client choisir `ADMIN` a la creation.

Ensuite lancer :

```bash
npm run db:migrate
npm run db:generate
```

`db:migrate` met la base a jour.

`db:generate` regenere les types Prisma, dont `Role`.

## 2. Creer un DTO pour modifier le role

Creer un fichier separe :

```txt
src/users/dto/update-user-role.dto.ts
```

Contenu :

```ts
import { IsEnum } from 'class-validator';
import { Role } from '../../generated/prisma/client';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}
```

Ce DTO valide le body :

```json
{
  "role": "ADMIN"
}
```

Il refuse :

```json
{
  "role": "SUPER_ADMIN"
}
```

Important : le DTO valide la forme des donnees. Il ne verifie pas si l'utilisateur a le droit de changer un role. Ca, c'est le travail du guard.

## 3. Ajouter une methode dans le repository

Dans `src/users/users.repository.ts`, importer `Role` :

```ts
import { Role, User, Prisma } from '../generated/prisma/client';
```

Ajouter une methode :

```ts
updateRole(id: string, role: Role): Promise<User> {
  return this.prisma.user.update({
    where: { id },
    data: { role },
  });
}
```

Le repository ne contient pas la logique de permission. Il fait seulement la requete Prisma.

## 4. Ajouter une methode dans le service

Dans `src/users/users.service.ts`, importer `Role` :

```ts
import { Role } from '../generated/prisma/client';
```

Ajouter :

```ts
async updateRole(id: string, role: Role) {
  const user = await this.user.findById(id);

  if (!user) {
    throw new NotFoundException(`User ${id} not found`);
  }

  return this.user.updateRole(id, role);
}
```

Le service verifie que l'utilisateur existe avant de modifier son role.

## 5. Afficher le role dans la response

Dans `src/users/dto/user-response.dto.ts`, ajouter `Role` :

```ts
import { Role, User } from '../../generated/prisma/client';
```

Puis ajouter la propriete :

```ts
role!: Role;
```

Et dans `fromPrisma` :

```ts
dto.role = user.role;
```

Sans ca, le role peut etre modifie en base mais ne pas apparaitre dans la reponse API.

## 6. Creer le decorator `@Roles`

Le projet contient deja normalement :

```txt
src/common/decorators/roles.decorator.ts
```

Contenu attendu :

```ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

Ce decorator permet d'ecrire :

```ts
@Roles(Role.ADMIN)
```

Mais attention : `@Roles(Role.ADMIN)` ne bloque rien tout seul. Il ajoute seulement une metadata sur la route.

Pour bloquer la route, il faut un guard.

## 7. Creer le guard de role

Creer :

```txt
src/common/guards/roles.guard.ts
```

Contenu :

```ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
```

Ce guard suppose que `request.user` existe deja.

Donc il faut aussi avoir un guard d'authentification qui :

1. lit le token ou la session ;
2. trouve l'utilisateur ;
3. met l'utilisateur dans `request.user`.

Sans `request.user`, le `RolesGuard` ne peut pas savoir si la personne est admin.

## 8. Creer un pipe pour valider le filtre role

La route `GET /users` doit pouvoir filtrer :

```http
GET /users?role=ADMIN
GET /users?role=USER
```

Mais elle doit refuser :

```http
GET /users?role=SUPER_ADMIN
```

Creer :

```txt
src/common/pipes/role-query.pipe.ts
```

Contenu :

```ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';

@Injectable()
export class RoleQueryPipe implements PipeTransform {
  transform(value: unknown): Role | undefined {
    if (value === undefined || value === '') {
      return undefined;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('role must be a string');
    }

    if (!Object.values(Role).includes(value as Role)) {
      throw new BadRequestException(`role must be one of: ${Object.values(Role).join(', ')}`);
    }

    return value as Role;
  }
}
```

Ce pipe transforme et valide uniquement le query param `role`.

Si aucun role n'est donne, il retourne `undefined`, donc on renvoie tous les users.

## 9. Modifier le repository pour filtrer par role

Dans `src/users/users.repository.ts`, modifier `findAll`.

Avant :

```ts
findAll(pagination: OffsetPaginationParams): Promise<User[]> {
  return this.prisma.user.findMany({
    skip: pagination.skip,
    take: pagination.limit,
    orderBy: { createdAt: 'desc' },
  });
}
```

Apres :

```ts
findAll(pagination: OffsetPaginationParams, role?: Role): Promise<User[]> {
  return this.prisma.user.findMany({
    where: role ? { role } : undefined,
    skip: pagination.skip,
    take: pagination.limit,
    orderBy: { createdAt: 'desc' },
  });
}
```

Modifier aussi `count` pour compter avec le meme filtre :

```ts
count(role?: Role): Promise<number> {
  return this.prisma.user.count({
    where: role ? { role } : undefined,
  });
}
```

## 10. Modifier le service pour accepter le filtre role

Dans `src/users/users.service.ts`, modifier `findAll`.

Avant :

```ts
async findAll(pagination: OffsetPaginationParams) {
  const [data, total] = await Promise.all([
    this.user.findAll(pagination),
    this.user.count(),
  ]);

  return {
    data,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}
```

Apres :

```ts
async findAll(pagination: OffsetPaginationParams, role?: Role) {
  const [data, total] = await Promise.all([
    this.user.findAll(pagination, role),
    this.user.count(role),
  ]);

  return {
    data,
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
}
```

## 11. Proteger `GET /users` avec le role ADMIN

Dans `src/users/users.controller.ts`, ajouter les imports :

```ts
import { UseGuards } from '@nestjs/common';
import { Role } from '../generated/prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoleQueryPipe } from '../common/pipes/role-query.pipe';
```

Puis modifier la route `findAll`.

Avant :

```ts
@Get()
async findAll(
  @Query(OffsetPaginationPipe) pagination: OffsetPaginationParams,
) {
  const { data, total, page, limit, totalPages } =
    await this.usersService.findAll(pagination);

  return {
    data: data.map((user) => UserResponseDto.fromPrisma(user)),
    total,
    page,
    limit,
    totalPages,
  };
}
```

Apres :

```ts
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Get()
async findAll(
  @Query(OffsetPaginationPipe) pagination: OffsetPaginationParams,
  @Query('role', RoleQueryPipe) role?: Role,
) {
  const { data, total, page, limit, totalPages } =
    await this.usersService.findAll(pagination, role);

  return {
    data: data.map((user) => UserResponseDto.fromPrisma(user)),
    total,
    page,
    limit,
    totalPages,
  };
}
```

Important : dans une vraie app, il faut aussi mettre le guard d'auth avant `RolesGuard`.

Exemple :

```ts
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Get()
```

Sinon `RolesGuard` ne recevra jamais `request.user`.

## 12. Tester avec Postman

Route reservee admin :

```http
GET http://localhost:3001/users
Authorization: Bearer {{token}}
```

Filtrer les admins :

```http
GET http://localhost:3001/users?role=ADMIN
Authorization: Bearer {{token}}
```

Filtrer les users simples :

```http
GET http://localhost:3001/users?role=USER
Authorization: Bearer {{token}}
```

Cas invalide attendu en erreur `400 Bad Request` :

```http
GET http://localhost:3001/users?role=SUPER_ADMIN
Authorization: Bearer {{token}}
```

Cas non admin attendu en erreur `403 Forbidden` :

```http
GET http://localhost:3001/users
Authorization: Bearer {{token_non_admin}}
```

## 13. Resume

Le champ `role` dans Prisma definit ce qui existe en base.

Le DTO valide le body quand on modifie un role.

Le pipe `RoleQueryPipe` valide le query param `?role=...`.

Le guard `RolesGuard` verifie si l'utilisateur connecte a le bon role.

La route `GET /users` doit etre protegee par `@Roles(Role.ADMIN)`.

Le filtre `?role=ADMIN` doit etre passe au service, puis au repository, pour filtrer directement dans Prisma.
