export interface Application {
    id:number;
    teacher_id: number;
    application_letter: string;
    submission_date: string;
    application_status: string;
    teacher: {
        name: string;
        cv: string;
    };
}