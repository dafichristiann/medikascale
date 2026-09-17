export declare function getKunjunganList(filters: any): Promise<any[]>;
export declare function getKunjunganById(id: number): Promise<any>;
export declare function updateKunjunganStatus(id: number, status: string, prioritas: number | undefined, changedByUserId: number): Promise<{
    id: number;
    status_antrian: string;
    prioritas: boolean;
}>;
export declare function getAantrianLog(kunjunganId: number): Promise<any[]>;
