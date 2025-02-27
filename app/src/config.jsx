import React from 'react';
import { Icon } from '@rsuite/icons';
import { VscTable, VscCalendar } from 'react-icons/vsc';
import { MdFingerprint, MdDashboard, MdModeEditOutline, Md10K } from 'react-icons/md';
import CubesIcon from '@rsuite/icons/legacy/Cubes';
import { Badge } from 'rsuite';
import { FaArchive, FaCalendar, FaCalendarDay, FaCalendarTimes, FaCalendarWeek, FaCartPlus, FaDropbox, FaInfo, FaInfoCircle, FaLifeRing, FaMoneyBill, FaMoneyCheck, FaSupple, FaTasks, FaTruck, FaUserPlus, FaVirusSlash } from 'react-icons/fa';

export const appNavs = [
  {
    eventKey: 'entrada-saida',
    icon: <Icon as={MdDashboard} />,
    title: 'Movimentação',
    to: '/entrada-saida'
  },
  /*
  {
    eventKey: 'cadastros',
    title: 'Cadastros',
    icon: <Icon as={FaTruck} />,
    children: [
      {
        eventKey: 'produtos',
        title: 'Produtos',
        to: '/cadastros/produtos'
      },
      {
        eventKey: 'unidades',
        title: 'Unidade',
        to: '/cadastros/unidades'
      },
      {
        eventKey: 'locais',
        title: 'Local',
        to: '/cadastros/locais'
      },
      {
        eventKey: 'tipoEntSai',
        title: 'Tipo de Entrada/Saída',
        to: '/cadastros/tipos-entrada-saida'
      },
      {
        eventKey: 'parceiros',
        title: 'Parceiros',
        to: '/cadastros/parceiros'
      },
    ]
  },
  {
    eventKey: 'relatorios',
    title: 'Relatórios',
    icon: <Icon as={FaArchive} />,
    children: [
      {
        eventKey: 'relatorios-produto',
        title: 'Produtos',
        to: '/relatorios/produto'
      },
      {
        eventKey: 'relatorios-local',
        title: 'Locais',
        to: '/relatorios/local'
      },
    ]
  },*/
  /*
  {
    eventKey: 'tasks',
    icon: <Icon as={FaTasks} />,
    title: 'Tarefas',
    to: '/tasks'
  },
  {
    eventKey: 'integrations',
    icon: <Icon as={FaInfoCircle} />,
    title: 'Integrações',
    to: '/integrations'
  },
  */
];
