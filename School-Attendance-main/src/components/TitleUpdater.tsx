import { useEffect } from 'react';
import { useSchoolConfig } from '@/hooks/useSchoolConfig';

export function TitleUpdater() {
    const { schoolInfo } = useSchoolConfig();

    useEffect(() => {
        if (schoolInfo.name) {
            document.title = schoolInfo.name;
        }
    }, [schoolInfo.name]);

    return null;
}
