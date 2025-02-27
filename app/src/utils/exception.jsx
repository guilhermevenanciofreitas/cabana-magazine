import _ from 'lodash';
import { toaster, Message } from 'rsuite';

export class Exception {

  static error(error) {
    const errors = JSON.parse(error.message).erros
    console.error(errors?.join('\n'))
    toaster.push(<Message type='error'><b>Mensagem</b><ul style={{marginTop: '10px'}}>{_.map(errors || [], (message, key) => <li key={key}>{message}</li>)}</ul></Message>,{ placement: 'topEnd', duration: 5000 })
  }

}