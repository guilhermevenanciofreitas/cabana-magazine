import React from 'react';
import { Icon } from '@rsuite/icons';
import { VscTable, VscCalendar } from 'react-icons/vsc';
import { MdFingerprint, MdDashboard, MdModeEditOutline, Md10K } from 'react-icons/md';
import CubesIcon from '@rsuite/icons/legacy/Cubes';
import { Badge } from 'rsuite';
import { FaArchive, FaCalendar, FaCalendarDay, FaCalendarTimes, FaCalendarWeek, FaCartPlus, FaDropbox, FaInfo, FaInfoCircle, FaLifeRing, FaMoneyBill, FaMoneyCheck, FaSupple, FaTasks, FaTruck, FaUserPlus, FaVirusSlash } from 'react-icons/fa';

export const appNavs = [
  {
    eventKey: 'passo-1',
    icon: <Icon as={MdDashboard} />,
    title: '1 - Lista',
    to: '/passo-1'
  },
  {
    eventKey: 'passo-2',
    icon: <Icon as={MdDashboard} />,
    title: '2 - Separação',
    to: '/passo-2'
  },
  {
    eventKey: 'passo-3',
    icon: <Icon as={MdDashboard} />,
    title: '3 - Gerar XML',
    to: '/passo-3'
  },
  {
    eventKey: 'passo-4',
    icon: <Icon as={MdDashboard} />,
    title: '4 - Expedição',
    to: '/passo-4'
  },
  {
    eventKey: 'passo-5',
    icon: <Icon as={MdDashboard} />,
    title: '5 - Enviados',
    to: '/passo-5'
  },
]
