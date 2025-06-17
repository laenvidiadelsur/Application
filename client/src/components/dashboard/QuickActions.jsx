import React from 'react';
import {
  Business as BusinessIcon,
  Store as StoreIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

const QuickActions = ({ onNavigate }) => {
  const actions = [
    { label: 'Fundaciones', icon: <BusinessIcon />, color: 'blue', path: '/admin/fundaciones' },
    { label: 'Proveedores', icon: <StoreIcon />, color: 'green', path: '/admin/proveedores' },
    { label: 'Usuarios', icon: <PeopleIcon />, color: 'red', path: '/admin/usuarios' },
    { label: 'Reportes', icon: <AssessmentIcon />, color: 'purple', path: '/admin/reportes' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
      <nav className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onNavigate(action.path)}
            className={`w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-${action.color}-50 hover:text-${action.color}-700 transition-colors duration-200`}
          >
            <span className={`inline-flex items-center justify-center h-8 w-8 rounded-lg bg-${action.color}-100 text-${action.color}-600 mr-3`}>
              {action.icon}
            </span>
            <span className="font-medium">{action.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default QuickActions; 