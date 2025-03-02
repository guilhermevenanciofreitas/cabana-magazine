import React from 'react';
import { Routes, Route, useRoutes } from 'react-router-dom';
import { CustomProvider, Loader } from 'rsuite';
import enGB from 'rsuite/locales/en_GB';
import Frame from './components/Frame';
import DashboardPage from './views/dashboard';
import Error404Page from './views/errors/404';

import { appNavs } from './config';
import { BrowserRouter } from 'react-router-dom';


import { EntradaSaida1 } from './views/passo-1/index.entrada-saida';
import { EntradaSaida } from './views/passo-2/index.entrada-saida';

import ptBR from 'rsuite/locales/pt_BR';
import { IntlProvider } from 'react-intl';

export class Loading extends React.Component {

  static Show(message = 'Carregando...') {
    
    var loaderElement = document.getElementsByClassName('rs-loader-content')
  
    loaderElement[0].innerHTML = message

    document.getElementById('loading').style.display = 'block'
    
  }

  static Hide() {
    document.getElementById('loading').style.display = 'none';
  }

  render() {
    return (
      <div id='loading' className="loader-overlay" style={{display: 'none'}}>
        <div className="loader-content loader-center">
          <div className="loader-center"><Loader id='loader' size="lg" inverse content='Carregando...' /></div>
        </div>
      </div>
    );
  }

}

const App = () => {

  return (
    <>
      <Loading />
      <IntlProvider locale="zh">
        <CustomProvider locale={ptBR}>
          <Routes>
            
            {/*<Route path="sign-in" element={<SignInPage />} />*/}

            <Route path="/" element={<Frame navs={appNavs} />}>

              <Route index element={<EntradaSaida1 />} />

              <Route path="passo-1" element={<EntradaSaida1 />} />
              <Route path="passo-2" element={<EntradaSaida />} />

            </Route>
            
            <Route path="*" element={<Error404Page />} />

          </Routes>
        </CustomProvider>
      </IntlProvider>
    </>
  )
}

export default App;
