export interface Payment {
    id: number;
    student_id: number;
    amount: number;
    date: Date;
    status: 'paid' | 'overdue' | 'pending' | 'rejected';
    picture: string;
  }