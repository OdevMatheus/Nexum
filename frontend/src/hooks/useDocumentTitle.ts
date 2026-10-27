import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
    useEffect(() => {
        document.title = title
            ? `${title} • Nexum`
            : 'Nexum • Gestão Inteligente de Clientes e Assinaturas';
    }, [title]);
}
