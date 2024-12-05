export interface Student {
    id: number;
    email: string;
    grade: string;
    first_name: string;
    second_name: string;
    last_name: string;
    sex: 'male' | 'female';
    region_id: string;
    city: string;
    woreda: string;
    phone_number: string ;
    parents_phone_number: string;
    training_or_competition: 'training' | 'competition' | null;
    chosen_institution: string | null;
    date: string | null;
    shift: 'morning' | 'afternoon' | 'night' | null;
    shift1: 'morning' | 'afternoon' | 'night' | null;
    shift2: 'morning' | 'afternoon' | 'night' | null;
    payment_status: 'completed' | 'pending' | 'rejected' | null;
    class_id: number | null;
    class_type:string;
  }
