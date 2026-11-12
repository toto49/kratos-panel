import {apiFetch} from "../../utils/api";

export interface Plugin {
    id: number;
    name: string;
    version: string;
    description: string;
    definitionJson: Record<string, never>;
    updatedAt: string;

}

export default function ServicesView() {


    const fetch = async () => {
        const plugin = await apiFetch("/plugins");
        if (!plugin.ok) {
            throw new Error("Services view failed");
        }
        const data: Plugin[] = await plugin.json();
        console.log(data);
        return;
    }
    return (
        <>
            <p>yo</p>
            <button onClick={fetch} type="button">plugin</button>
        </>
    );
}