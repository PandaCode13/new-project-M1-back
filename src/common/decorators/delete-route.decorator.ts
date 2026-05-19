import { applyDecorators, Delete, HttpCode, HttpStatus } from '@nestjs/common';

/**
 * TYPE 3 — applyDecorators (composition)
 *
 * applyDecorators merges multiple decorators into one. This is useful when
 * the same combination of decorators appears repeatedly across controllers.
 *
 * In this codebase, every DELETE route has the same pattern:
 *   @Delete(':id')
 *   @HttpCode(HttpStatus.NO_CONTENT)
 *
 * Composing them into @DeleteRoute() has two benefits:
 *   1. No risk of forgetting @HttpCode(204) — it's baked in
 *   2. One place to update if the pattern changes (e.g. adding a guard later)
 *
 * BEFORE:
 *   @Delete(':id')
 *   @HttpCode(HttpStatus.NO_CONTENT)
 *   async remove(...) { ... }
 *
 * AFTER:
 *   @DeleteRoute()
 *   async remove(...) { ... }
 *
 * applyDecorators works on methods AND classes — the same mechanism powers
 * @ApiTags(), which combines Swagger metadata + OpenAPI tag in one call.
 */
export const DeleteRoute = () =>
  applyDecorators(Delete(':id'), HttpCode(HttpStatus.NO_CONTENT));
