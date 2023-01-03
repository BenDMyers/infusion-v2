import type { CaffeineLevel, HotOrIced, WithEmptyStringOption } from '../types/api';

export const caffeineContentValues: CaffeineLevel[] = ['High', 'Medium', 'Low', 'Decaf', 'None'];

export const hotOrIced: WithEmptyStringOption<HotOrIced>[] = ['', 'Hot', 'Iced'];