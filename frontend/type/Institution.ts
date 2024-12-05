export interface Institution {
    id: number;
    name: string;
    level: '5678' | '910' | '11-12' | 'college' | 'university' | 'masters';
    region: string;
    city: string;
    woreda: string;
    classes: number;
  }