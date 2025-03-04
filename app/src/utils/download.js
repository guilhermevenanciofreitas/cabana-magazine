export class Download {

    static file = (base64, filename) => {

        // Converter Base64 para Blob
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    
        // Criar um link de download
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
    
        // Simular clique para iniciar o download
        document.body.appendChild(link);
        link.click();
    
        // Remover o link após o download
        document.body.removeChild(link);

    }

}