import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ParksModule } from './parks/parks.module';
import { RollerCoastersModule } from './roller-coasters/roller-coasters.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ParksModule,
    RollerCoastersModule,
    ReviewsModule,
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: { limit: '2mb' },
        urlencoded: { limit: '2mb', extended: true },
        rawBody: true,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
