import { Param, ParseUUIDPipe } from '@nestjs/common';

/**
 * TYPE 1a — Decorator factory (wraps existing NestJS decorators)
 *
 * A decorator factory is a function that returns a decorator.
 * Here we combine @Param(name) + ParseUUIDPipe into a single reusable decorator.
 * NestJS decorators are just functions — nothing stops you from composing them.
 *
 * BEFORE (repeated on every route with an :id param):
 *   findOne(@Param('id', ParseUUIDPipe) id: string)
 *   update(@Param('id', ParseUUIDPipe) id: string)
 *   remove(@Param('id', ParseUUIDPipe) id: string)
 *
 * AFTER:
 *   findOne(@UUIDParam('id') id: string)
 *   update(@UUIDParam('id') id: string)
 *   remove(@UUIDParam('id') id: string)
 */
export const UUIDParam = (name: string): ParameterDecorator =>
  Param(name, new ParseUUIDPipe());
