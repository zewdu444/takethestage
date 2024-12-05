export interface Teacher {
    institution: string;
    first_name: string;
    second_name: string;
    last_name: string;
    level_of_teaching: 'grade 5-8' | 'grade 9-10' | 'college' | 'university' | 'masters';
    region: string;
    woreda: string;
    sex: 'male' | 'female';
    email: string;
    phone_number: string;
    password: string;
    is_teacher: boolean;
    chosen_institution?: number;
    campus?: string;
    date?: Date;
    shift: 'morning' | 'afternoon' | 'night';
    id:number;
    class: string; 

  }