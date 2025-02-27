import React, { useRef } from 'react';
import {
  Dropdown,
  Popover,
  Whisper,
  Stack,
  Badge,
  Avatar,
  IconButton,
  List,
  Button
} from 'rsuite';
import NoticeIcon from '@rsuite/icons/Notice';
import GearIcon from '@rsuite/icons/Gear';
import HelpOutlineIcon from '@rsuite/icons/HelpOutline';
import GithubIcon from '@rsuite/icons/legacy/Github';
import HeartIcon from '@rsuite/icons/legacy/HeartO';
import { Service } from '../../service';
import { useNavigate } from 'react-router-dom';

import Link from '../NavLink'
import ViewPassword from './view.password';
//import ViewUser from '../../views/setting/view.user';
import { Loading } from '../../App';

class RenderAdminSpeaker extends React.Component {

  handleSelect = eventKey => {
    this.props.onClose()
  };

  signOut = async () => {
    try{

      //Loading.Show('Saindo...');

      const r = await new Service().Post('login/sign-out');

      if (r?.status == 200) {

        //localStorage.removeItem("Authorization");

        //const from = (location?.pathname || '/') + (location?.search);
  
        //navigate(`sign-in`);
  
        //toast.success(r.data.message, { position: 'top-center' });

      }

    } catch (error) {
      //toast.error(error.message);
    }
    finally {
      //Loading.Hide();
    }
  }

  render = () => {

    const Authorization = JSON.parse(localStorage.getItem("Authorization"))

    return (
      <>
        <Popover ref={this.props.ref} className={this.props.className} style={{ left: this.props.left, top: this.props.top }} full>
          <Dropdown.Menu onSelect={this.handleSelect}>
            <Dropdown.Item panel style={{ padding: 10, width: 200 }}>
              <strong>{Authorization?.user?.name}</strong>
            </Dropdown.Item>
            <Dropdown.Item divider />
            <Dropdown.Item onClick={this.props.onProfile}>Perfil</Dropdown.Item>
            <Dropdown.Item onClick={this.props.onPasswordChange}>Alterar senha</Dropdown.Item>
            <Dropdown.Item divider />
            {/*<Dropdown.Item onClick={this.props.onLoggout}>Logout</Dropdown.Item>*/}
          </Dropdown.Menu>
        </Popover>
      </>
    )
  }

}

/*
const renderAdminSpeaker = ({ onClose, left, top, className }, ref) => {

  const navigate = useNavigate();

  const viewPassword = createRef()

  const Authorization = JSON.parse(localStorage.getItem("Authorization"));

  const handleSelect = eventKey => {
    onClose();
  };

  const signOut = async () => {
    try{

      //Loading.Show('Saindo...');

      const r = await new Service().Post('login/sign-out');

      if (r?.status == 200) {

        localStorage.removeItem("Authorization");

        //const from = (location?.pathname || '/') + (location?.search);
  
        navigate(`sign-in`);
  
        //toast.success(r.data.message, { position: 'top-center' });

      }

    } catch (error) {
      //toast.error(error.message);
    }
    finally {
      //Loading.Hide();
    }
  }

  const changePassword = () => {

    viewPassword.current.change()

  }

  return (
    <>
      
      <Popover ref={ref} className={className} style={{ left, top }} full>
        <Dropdown.Menu onSelect={handleSelect}>
          <Dropdown.Item panel style={{ padding: 10, width: 200 }}>
            <strong>{Authorization?.user?.name}</strong>
          </Dropdown.Item>
          <Dropdown.Item divider />
          <Dropdown.Item>Perfil</Dropdown.Item>
          <Dropdown.Item onClick={changePassword}>Alterar senha</Dropdown.Item>
          <Dropdown.Item divider />
          <Dropdown.Item onClick={signOut}>Logout</Dropdown.Item>
        </Dropdown.Menu>
      </Popover>
    </>
  );
};
*/

const renderSettingSpeaker = ({ onClose, left, top, className }, ref) => {
  const handleSelect = eventKey => {
    onClose();
    console.log(eventKey);
  };
  return (
    <Popover ref={ref} className={className} style={{ left, top }} full>
      <Dropdown.Menu onSelect={handleSelect}>
        <Dropdown.Item panel style={{ padding: 10, width: 200 }}>
          <strong>Configurações</strong>
        </Dropdown.Item>
        <Dropdown.Item as={Link} to='/setting'>Empresa</Dropdown.Item>
      </Dropdown.Menu>
    </Popover>
  );
};

const renderNoticeSpeaker = ({ onClose, left, top, className }, ref) => {
  const notifications = [
    [
      '7 hours ago',
      'The charts of the dashboard have been fully upgraded and are more visually pleasing.'
    ],
    [
      '13 hours ago',
      'The function of virtualizing large lists has been added, and the style of the list can be customized as required.'
    ],
    ['2 days ago', 'Upgraded React 18 and Webpack 5.'],
    [
      '3 days ago',
      'Upgraded React Suite 5 to support TypeScript, which is more concise and efficient.'
    ]
  ];

  return (
    <Popover ref={ref} className={className} style={{ left, top, width: 300 }} title="Last updates">
      <List>
        {notifications.map((item, index) => {
          const [time, content] = item;
          return (
            <List.Item key={index}>
              <Stack spacing={4}>
                <Badge /> <span style={{ color: '#57606a' }}>{time}</span>
              </Stack>

              <p>{content}</p>
            </List.Item>
          );
        })}
      </List>
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Button onClick={onClose}>More notifications</Button>
      </div>
    </Popover>
  );
};



const Header = () => {

  const navigate = useNavigate()

  const viewProfile = React.createRef()
  const viewPassword = React.createRef()

  const trigger = useRef(null);

  const onLoggout = async (props) => {
    try{

      Loading.Show('Saindo...');

      const r = await new Service().Post('login/sign-out').finally(() => Loading.Hide());

      if (r?.status == 200) {

        //localStorage.removeItem("Authorization");

        //const from = (location?.pathname || '/') + (location?.search);
  
        navigate(`sign-in`);
  
        //toast.success(r.data.message, { position: 'top-center' });

      }

    } catch (error) {
      //toast.error(error.message);
    }
    finally {
      //Loading.Hide();
    }
  }

  const onProfile = (props) => {
    props.onClose()
    const Authorization = JSON.parse(localStorage.getItem("Authorization"))
    viewProfile.current.editUser(Authorization.user.id)
  }

  const onPasswordChange = (props) => {
    props.onClose()
    const Authorization = JSON.parse(localStorage.getItem("Authorization"))
    viewPassword.current.change(Authorization.user.id)
  }

  return (
    <>

      {/*<ViewUser ref={viewProfile} title='Perfil' />*/}
      {/*<ViewPassword ref={viewPassword} />*/}

      <Stack className="header" spacing={8}>

        {/*
        <Whisper placement="bottomEnd" trigger="click" ref={trigger} speaker={renderNoticeSpeaker}>
          <IconButton icon={<Badge content={5}><NoticeIcon style={{ fontSize: 20 }} /></Badge>} />
        </Whisper>
        */}

        <Whisper placement="bottomEnd" trigger="click" ref={trigger} speaker={renderSettingSpeaker}>
          <IconButton icon={<GearIcon style={{ fontSize: 20 }} />} />
        </Whisper>

        <Whisper placement="bottomEnd" trigger="click" ref={trigger} speaker={(props, ref) => 
          <RenderAdminSpeaker ref={ref} {...props}
            onProfile={() => onProfile(props)}
            onPasswordChange={() => onPasswordChange(props)}
            onLoggout={() => onLoggout(props)}
          />}>
          <Avatar size="sm" circle src="https://www.citypng.com/public/uploads/preview/png-round-blue-contact-user-profile-icon-701751694975293fcgzulxp2k.png" alt="@simonguo" style={{ marginLeft: 8 }} />
        </Whisper>
      </Stack>
    </>
  )

}

export default Header;
