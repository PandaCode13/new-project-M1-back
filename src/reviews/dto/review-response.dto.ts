import { Review, User } from '../../generated/prisma/client';

type ReviewWithUser = Review & { user: User };

export class ReviewResponseDto {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: { id: string; fullName: string };

  static fromPrisma(review: ReviewWithUser): ReviewResponseDto {
    const dto = new ReviewResponseDto();
    dto.id = review.id;
    dto.rating = review.rating;
    dto.comment = review.comment;
    dto.createdAt = review.createdAt;
    dto.user = {
      id: review.user.id,
      fullName: `${review.user.firstName} ${review.user.lastName}`,
    };
    return dto;
  }
}
