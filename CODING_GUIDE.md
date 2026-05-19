# Guide de codage du projet

Ce fichier sert de pense-bete pour implementer proprement les features NestJS/Prisma dans ce projet.

## 1. Ajouter des roles en base de donnees

Pour gerer les droits, le plus simple est d'ajouter un enum `Role` dans `prisma/schema.prisma`, puis un champ `role` sur le modele `User`.

Exemple :

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique @db.VarChar(255)
  name      String   @default("") @db.VarChar(255)
  firstName String?  @db.VarChar(100)
  lastName  String?  @db.VarChar(100)
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

Apres modification du schema :

```bash
npm run db:migrate
npm run db:generate
```

Si la base existe deja avec des users, garder un `@default(USER)` evite de casser les anciennes lignes.

## 2. Utiliser les roles dans les DTO et services

Ne jamais faire confiance au body envoye par le client pour donner un role sensible.

Mauvais exemple :

```json
{
  "email": "user@test.com",
  "role": "ADMIN"
}
```

Bon principe :

- un utilisateur cree depuis une route publique doit etre `USER` par defaut ;
- seul un admin peut promouvoir un autre utilisateur ;
- le service decide ce qui est autorise, pas le client.

Exemple de DTO pour changer un role :

```ts
import { IsEnum } from 'class-validator';
import { Role } from '../generated/prisma/client';

export class UpdateUserRoleDto {
  @IsEnum(Role)
  role: Role;
}
```

## 3. Creer un guard pour verifier les roles

Le projet contient deja `src/common/decorators/roles.decorator.ts`.

On peut donc proteger une route comme ceci :

```ts
@Roles('ADMIN')
@Delete(':id')
remove(@Param('id') id: string) {
  return this.usersService.remove(id);
}
```

Il faut ensuite creer un guard qui lit cette metadata.

Exemple :

```ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
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

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
```

Important : ce guard suppose qu'un guard d'authentification a deja verifie le token et ajoute `request.user`.

## 4. Brancher les guards sur les routes

Sur une route :

```ts
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
@Patch(':id/role')
updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
  return this.usersService.updateRole(id, dto.role);
}
```

Sur tout un controller :

```ts
@UseGuards(AuthGuard, RolesGuard)
@Controller('users')
export class UsersController {}
```

Sur toute l'application, on peut aussi enregistrer un guard global, mais il faut le faire seulement quand l'auth est claire pour toutes les routes.

## 5. Pipes pour valider les donnees

Il y a deja un `ValidationPipe` global dans `src/main.ts` :

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

Effet :

- `whitelist: true` supprime les champs non declares dans le DTO ;
- `forbidNonWhitelisted: true` renvoie une erreur si le client envoie un champ interdit ;
- `transform: true` convertit les donnees vers les types attendus quand c'est possible.

Pour valider un body, utiliser un DTO :

```ts
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  firstName: string;
}
```

Puis dans le controller :

```ts
@Post()
create(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}
```

## 6. Pipes pour valider le format des parametres

Pour les ids, utiliser le decorateur existant `@UUIDParam`.

Exemple :

```ts
@Get(':id')
findOne(@UUIDParam('id') id: string) {
  return this.usersService.findOne(id);
}
```

Pour les query params complexes, creer un pipe dedie comme ceux du projet :

- `OffsetPaginationPipe`
- `CursorPaginationPipe`

Exemple :

```ts
@Get()
findAll(@Query(OffsetPaginationPipe) pagination: OffsetPaginationParams) {
  return this.usersService.findAll(pagination);
}
```

Un pipe doit :

- lire la valeur recue ;
- convertir les types si besoin ;
- rejeter les formats invalides avec `BadRequestException` ;
- retourner une valeur propre et utilisable par le service.

## 7. Regle simple a retenir

- DTO : valide le body envoye par le client.
- Pipe : valide ou transforme un parametre, une query, ou un body.
- Guard : autorise ou bloque l'acces a une route.
- Decorator : simplifie la lecture d'une info recurrente, comme `@Roles()` ou `@CurrentUser()`.
- Service : contient la logique metier.
- Repository : parle avec Prisma et la base de donnees.
