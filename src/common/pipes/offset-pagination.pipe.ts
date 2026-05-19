import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

export interface OffsetPaginationParams {
  page: number;
  limit: number;
  skip: number;
}

@Injectable()
export class OffsetPaginationPipe implements PipeTransform {
  transform(value: Record<string, string>): OffsetPaginationParams {
    const page = parseInt(value.page ?? '1', 10);
    // Hard cap at 100 to prevent accidental full-table scans
    const limit = Math.min(parseInt(value.limit ?? '20', 10), 100);

    if (isNaN(page) || page < 1) {
      throw new BadRequestException('page must be a positive integer');
    }
    if (isNaN(limit) || limit < 1) {
      throw new BadRequestException('limit must be a positive integer');
    }

    return { page, limit, skip: (page - 1) * limit };
  }
}
