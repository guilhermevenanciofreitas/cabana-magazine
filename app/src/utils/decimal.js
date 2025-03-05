export class Decimal {

    static format = (value, decimals = 2) => {
        return new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: false }).format(value ?? 0)
    }

    static change = (value, decimals = 2) => {

        value = value.replace(',', '.')

        if (!isNaN(value) && value !== '') {

            const numValue = value.replace(/\D/g, '')

            if (numValue === '') {
                return (0).toFixed(decimals)
            }

            const valueInCents = parseInt(numValue);
            const formattedValue = (valueInCents / 100).toFixed(decimals);

            return formattedValue
            
        } else {
            return (0).toFixed(decimals)
        }

    }

}