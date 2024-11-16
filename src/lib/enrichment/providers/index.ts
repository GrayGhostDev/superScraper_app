import { LinkedInEnricher } from './linkedin';
import { HunterEnricher } from './hunter';
import { RocketReachEnricher } from './rocketreach';
import { PeopleDataLabsEnricher } from './peopledatalabs';
import { LexisNexisEnricher } from './lexisnexis';

export const enrichers = {
  linkedin: LinkedInEnricher,
  hunter: HunterEnricher,
  rocketreach: RocketReachEnricher,
  peopledatalabs: PeopleDataLabsEnricher,
  lexisnexis: LexisNexisEnricher
};