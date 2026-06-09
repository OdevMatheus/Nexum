import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
    useEffect(() => {
        const fullTitle = `Nexum - A plataforma de gestão de assinaturas definitiva • ${title || 'Início'} •     `;
        let currentText = fullTitle;
        document.title = currentText;

        const intervalId = setInterval(() => {
            currentText = currentText.substring(1) + currentText.substring(0, 1);
            document.title = currentText;
        }, 300);

        return () => {
            clearInterval(intervalId);
        };
    }, [title]);
}
