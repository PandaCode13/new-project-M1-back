import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { UUIDParam } from '../common/decorators/uuid-param.decorator';
import { DeleteRoute } from '../common/decorators/delete-route.decorator';

@Controller('roller-coasters/:rollerCoasterId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(
    @UUIDParam('rollerCoasterId') rollerCoasterId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const review = await this.reviewsService.create(rollerCoasterId, dto);
    return ReviewResponseDto.fromPrisma(review);
  }

  @Get()
  async findAll(@UUIDParam('rollerCoasterId') rollerCoasterId: string) {
    const { averageRating, total, data } =
      await this.reviewsService.findAllByCoaster(rollerCoasterId);
    return {
      averageRating,
      total,
      data: data.map((review) => ReviewResponseDto.fromPrisma(review)),
    };
  }

  @DeleteRoute()
  delete(@UUIDParam('id') id: string) {
    return this.reviewsService.delete(id);
  }
}
