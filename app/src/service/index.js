import axios from "axios";
import Swal from 'sweetalert2'

export class Service {

    Post = async (url, data, headers) => {

        const env = import.meta.env.VITE_API_URL

        let config = {};

        let authorization = JSON.parse(localStorage.getItem('Authorization'))

        try {

            if (authorization) {
                config = {
                    headers: {
                        'Authorization': `${authorization?.token}`,
                        ...headers
                    },
                }
            }

            var response = await axios.post(env + url, data || {}, config)

            if (authorization) {
                authorization.lastAcess = response.headers['last-acess']
                authorization.expireIn = parseInt(response.headers['expire-in'])
                localStorage.setItem('Authorization', JSON.stringify(authorization))
            }

            return response

        } catch (error) {

            //API fora do ar
            if (error.code == 'ERR_NETWORK') {
                const message = '[300] - Servidor fora do ar!'
                Swal.fire({showCloseButton: true, title: 'Ops...', icon: 'error', text: message})
                throw new Error(message)
            }

            //Em manutenção
            if (error?.response?.status == 301) {
                const message = '[301] - Servidor em manutenção, aguarde um instante!'
                Swal.fire({showCloseButton: true, title: 'Ops...', icon: 'warning', text: message, confirmButtonColor: "#FFF", confirmButtonText: 'Aguarde um instante'})
                throw new Error(message)
            }

            //Sessão expirada
            if (error?.response?.status == 400) {
                const message = error.response.data.message
                localStorage.removeItem('Authorization')
                //const to = window.location.hash.slice(1)
                //window.location.href = `/sign-in`
                throw new Error(message)
            }

            //Erro desconhecido
            const message = '[500] - Ocorreu um erro inesperado!'
            Swal.fire({showCloseButton: true, title: 'Ops...', icon: 'error', text: message, confirmButtonColor: "#FFF", confirmButtonText: '<span style="color: rgba(88, 86, 214)">Quero abrir um chamado!</span>',
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire('', 'Chamado <b>#49812</b> aberto com sucesso!', 'success')
                }
            })
            throw new Error(JSON.stringify(error?.response?.data))

        }
    }

}