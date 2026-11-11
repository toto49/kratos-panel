import { useSystemStatus } from '../queries/systemStatus';
import {formatUptime} from "../utils/formatters.ts";
import Sidebar from "../components/Sidebar.tsx";
import {useState} from "react";


export default function Server() {
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    return (
        <div className="flex min-h-screen w-full bg-bg-main text-text-main">
            {/* Sidebar fixe à gauche */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Zone de contenu principale à droite */}
            <div className="flex-1 flex flex-col min-w-0">
                <p>test</p>
            </div>
        </div>
    );
}