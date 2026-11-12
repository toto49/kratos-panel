import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../utils/api';


export interface NodeResponse {
    id: number;
    uuid: string;
    name: string;
    fqdn: string;
    agentToken: string;
    isOnline: boolean;
    lastSeenAt: string | null;
    cpuCores: number | null;
    ramTotalMb: number | null;
    diskTotalGb: number | null;
    osInfo: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateNodePayload {
    name: string;
    fqdn: string;
}


const fetchNodesStatus = async (): Promise<NodeResponse[]> => {
    const response = await apiFetch('/nodes');

    if (!response.ok) {
        throw new Error(`Impossible de récupérer les nœuds (${response.status})`);
    }

    return response.json();
};

export const useNodesStatus = () =>
    useQuery<NodeResponse[]>({
        queryKey: ['nodes-status'],
        queryFn: fetchNodesStatus,
        refetchInterval: 10_000,
    });

const createNode = async (payload: CreateNodePayload): Promise<NodeResponse> => {
    const response = await apiFetch('/nodes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Erreur lors de la création du serveur (${response.status})`);
    }

    return response.json();
};

export const useCreateNode = () => {
    const queryClient = useQueryClient();

    return useMutation<NodeResponse, Error, CreateNodePayload>({
        mutationFn: createNode,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['nodes-status'] });
        },
    });
};
const deleteNode = async (id: number): Promise<void> => {
    const response = await apiFetch(`/nodes/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Erreur lors de la suppression du serveur (${response.status})`);
    }
};

export const useDeleteNode = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: deleteNode,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['nodes-status'] });
        },
    });
};