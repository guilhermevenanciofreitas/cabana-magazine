export class Archive {

    static download = (base64, suggestedName) => {

        const byteCharacters = atob(base64)
        const byteNumbers = new Array(byteCharacters.length)

        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray])
    
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = suggestedName
    
        document.body.appendChild(link)
        link.click()
    
        document.body.removeChild(link)

    }

    static saveAs = async (base64, suggestedName, startIn = 'downloads') => {
        
        const base64ToBinary = (base64) => {

            const binaryString = window.atob(base64)
            const len = binaryString.length
            const bytes = new Uint8Array(len)
            
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }
          
            return bytes
            
        }

        const archive = base64ToBinary(base64)

        const fileHandle = await window.showSaveFilePicker({
            startIn,
            suggestedName,
        })

        const writableStream = await fileHandle.createWritable()
        await writableStream.write(archive)
        await writableStream.close()
        
    }

}