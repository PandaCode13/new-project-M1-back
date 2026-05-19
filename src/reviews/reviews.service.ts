import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewsRepository } from './reviews.repository';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly reviews: ReviewsRepository) {}

  create(rollerCoasterId: string, dto: CreateReviewDto) {
    return this.reviews.create({
      rating: dto.rating,
      comment: dto.comment,
      user: { connect: { id: dto.userId } },
      rollerCoaster: { connect: { id: rollerCoasterId } },
    });
  }

  async findAllByCoaster(rollerCoasterId: string) {
    const [reviews, aggregate] = await Promise.all([
      this.reviews.findAllByCoaster(rollerCoasterId),
      this.reviews.aggregateByCoaster(rollerCoasterId),
    ]);
    return {
      averageRating: aggregate._avg.rating,
      total: aggregate._count.id,
      data: reviews,
    };
  }

  async delete(id: string) {
    const review = await this.reviews.findById(id);
    if (!review) {
      throw new NotFoundException(`Review ${id} not found`);
    }
    return this.reviews.delete(id);
  }
}
