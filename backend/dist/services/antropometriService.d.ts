export declare function createAntropometri(kunjunganId: number, tinggi: number, berat: number, lingkarKepala: number | null, umurBulan: number | null, catatan: string | null, createdByUserId: number): Promise<any>;
export declare function getAntropometriByPasien(pasienId: number): Promise<any[]>;
export declare function getAntropometriReport(filters: any): Promise<{
    total: number;
    normal: number;
    'at-risk': number;
    malnutrition: number;
    data: any[];
}>;
