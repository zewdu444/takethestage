// components/InstitutionDetail.tsx
'use client';
import React from 'react';

import { Institution } from     '../../type/Institution';

const InstitutionDetail: React.FC<{ institution: Institution }> = ({ institution }) => {


  

    return (
        <div>
            <h3>{institution.name}</h3>
            <p>{institution.level}</p>
            <p>{institution.city}</p>
            <p>{institution.region}</p>
            <p>{institution.woreda}</p>
            <p>{institution.classes}</p>
        </div>
    );
};

export default InstitutionDetail;
