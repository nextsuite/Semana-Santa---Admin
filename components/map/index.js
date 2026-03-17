import dynamic from 'next/dynamic';

export const DynamicMapDraw = dynamic(() => import('./MapDraw'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Cargando mapa...</div>
});

export const DynamicMapMultiZonas = dynamic(() => import('./MapMultiZonas'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Cargando mapa...</div>
});
