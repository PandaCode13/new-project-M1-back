import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isUUID } from 'class-validator';

export interface CursorPaginationParams {
  cursor: string | undefined;
  limit: number;
}

@Injectable()
export class CursorPaginationPipe implements PipeTransform {
  transform(value: Record<string, string>): CursorPaginationParams {
    // Hard cap at 100 to prevent accidental full-table scans
    const limit = Math.min(parseInt(value.limit ?? '20', 10), 100);
    const cursor = value.cursor || undefined;

    if (isNaN(limit) || limit < 1) {
      throw new BadRequestException('limit must be a positive integer');
    }
    if (cursor !== undefined && !isUUID(cursor)) {
      throw new BadRequestException('cursor must be a valid UUID');
    }

    return { cursor, limit };
  }
}
