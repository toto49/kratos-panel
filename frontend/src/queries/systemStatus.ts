import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';

export interface StorageStatus {
    totalGB: number;
    freeGB: number;
    usedGB: number;
}

export interface OsStatus {
    uptime: number;
    os: string;
    manufacturer: string;
    architecture : string;
    version : string;
}

export interface SystemStatus {
    storage: StorageStatus;
    os : OsStatus;
}

const fetchSystemStatus = async (): Promise<SystemStatus> => {
    const response = await apiFetch('/system/status');

    if (!response.ok) {
        throw new Error(`Impossible de récupérer le statut système (${response.status})`);
    }

    return response.json() as Promise<SystemStatus>;
};

export const useSystemStatus = () =>
    useQuery({
        queryKey: ['system-status'],
        queryFn: fetchSystemStatus,
        refetchInterval: 10_000,
    });
